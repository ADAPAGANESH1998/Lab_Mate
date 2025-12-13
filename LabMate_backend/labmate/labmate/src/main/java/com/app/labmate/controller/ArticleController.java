package com.app.labmate.controller;

import com.app.labmate.model.ArticleDTO;
import com.app.labmate.model.PdfDocument;
import com.app.labmate.repo.PdfDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.Instant;
import java.net.URLEncoder;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class ArticleController {

    private static final Logger logger = LoggerFactory.getLogger(ArticleController.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private PdfDocumentRepository pdfDocumentRepository;

    // optional Semantic Scholar API key (set in application.properties if available)
    @Value("${semanticscholar.api.key:}")
    private String semanticScholarApiKey;

    // simple in-memory cache for citations to reduce external calls (TTL seconds)
    private final ConcurrentHashMap<String, CitationCacheEntry> citationsCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_SECONDS = 60 * 60; // 1 hour

    private static class CitationCacheEntry {
        final Map<String, Object> value;
        final Instant created;

        CitationCacheEntry(Map<String, Object> value) {
            this.value = value;
            this.created = Instant.now();
        }

        boolean isExpired() {
            return Instant.now().isAfter(created.plusSeconds(CACHE_TTL_SECONDS));
        }
    }

    @GetMapping("/article")
    public ResponseEntity<?> getArticle(@RequestParam String url) {
        try {
            String doi;
            if (url.contains("doi.org/")) {
                doi = url.substring(url.indexOf("10."));
            } else if (url.startsWith("10.")) {
                doi = url;
            } else {
                return ResponseEntity.badRequest().body("Invalid DOI or URL format.");
            }

            String apiUrl = "https://api.crossref.org/works/" + doi;

            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                return ResponseEntity.badRequest().body("Failed to fetch data from Crossref.");
            }

            Map<String, Object> body = response.getBody();
            Map<String, Object> message = (Map<String, Object>) body.get("message");

            ArticleDTO article = new ArticleDTO();

            List<String> titles = (List<String>) message.get("title");
            article.setTitle(titles != null && !titles.isEmpty() ? titles.get(0) : null);

            article.setDoi("https://doi.org/" + (String) message.get("DOI"));

            List<String> containerTitles = (List<String>) message.get("container-title");
            article.setJournal(containerTitles != null && !containerTitles.isEmpty() ? containerTitles.get(0) : null);

            article.setVolume((String) message.get("volume"));

            if (message.get("issued") != null) {
                Map<String, Object> issued = (Map<String, Object>) message.get("issued");
                List<List<Integer>> dateParts = (List<List<Integer>>) issued.get("date-parts");
                if (dateParts != null && !dateParts.isEmpty()) {
                    List<Integer> date = dateParts.get(0);
                    String formattedDate = date.stream().map(Object::toString).collect(Collectors.joining("-"));
                    article.setPublicationDate(formattedDate);
                }
            }

            if (message.get("author") != null) {
                List<Map<String, Object>> authorsList = (List<Map<String, Object>>) message.get("author");
                List<String> authors = new ArrayList<>();
                for (Map<String, Object> a : authorsList) {
                    String given = (String) a.get("given");
                    String family = (String) a.get("family");
                    authors.add((given != null ? given : "") + " " + (family != null ? family : ""));
                }
                article.setAuthors(String.join(", ", authors));
                article.setAuthorsArray(authors);
            }

            if (message.get("abstract") != null) {
                String abs = (String) message.get("abstract");
                abs = abs.replaceAll("<[^>]+>", "");
                article.setAbstractText(abs);
            }

            if (message.get("URL") != null) {
                article.setUrl((String) message.get("URL"));
            }

            if (article.getAbstractText() == null || article.getAbstractText().isBlank()) {
                String fallback = fetchAbstractFromEuropePMC((String) message.get("DOI"));
                if (fallback != null && !fallback.isBlank()) {
                    article.setAbstractText(fallback);
                }
            }

            if (article.getAbstractText() == null || article.getAbstractText().isBlank()) {
                String doiStr = (String) message.get("DOI");
                String ss = fetchAbstractFromSemanticScholar(doiStr);
                if (ss != null && !ss.isBlank()) {
                    article.setAbstractText(ss);
                }
            }

            if (article.getAbstractText() == null || article.getAbstractText().isBlank()) {
                String doiStr = (String) message.get("DOI");
                String ox = fetchAbstractFromOpenAlex(doiStr);
                if (ox != null && !ox.isBlank()) {
                    article.setAbstractText(ox);
                }
            }

            return ResponseEntity.ok(article);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching article: " + e.getMessage());
        }
    }

    private String fetchAbstractFromEuropePMC(String doi) {
        try {
            if (doi == null || doi.isBlank()) return null;
            String rawQuery = "DOI:\"" + doi + "\"";
            String epmc = "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query="
                    + URLEncoder.encode(rawQuery, StandardCharsets.UTF_8.name())
                    + "&format=json&pageSize=1";

            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> resp = restTemplate.exchange(epmc, HttpMethod.GET, entity, Map.class);
            if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) return null;

            Map<String, Object> body = resp.getBody();
            Object rl = body.get("resultList");
            if (!(rl instanceof Map)) return null;
            Map<String, Object> resultList = (Map<String, Object>) rl;
            Object resultsObj = resultList.get("result");
            if (!(resultsObj instanceof List)) return null;
            List<Map<String, Object>> results = (List<Map<String, Object>>) resultsObj;
            if (results.isEmpty()) return null;
            Map<String, Object> first = results.get(0);
            Object abs = first.get("abstractText");
            if (abs == null) abs = first.get("abstract");
            if (abs instanceof String) return ((String) abs).replaceAll("<[^>]+>", "");
            return null;
        } catch (Exception ex) {
            return null;
        }
    }

    private String fetchAbstractFromSemanticScholar(String doi) {
        try {
            if (doi == null || doi.isBlank()) return null;
            String url = "https://api.semanticscholar.org/graph/v1/paper/DOI:" + URLEncoder.encode(doi, StandardCharsets.UTF_8.name()) + "?fields=abstract";
            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) return null;
            Map<String, Object> body = resp.getBody();
            Object abs = body.get("abstract");
            if (abs instanceof String) return ((String) abs).replaceAll("<[^>]+>", "");
            return null;
        } catch (Exception ex) {
            return null;
        }
    }

    private String fetchAbstractFromOpenAlex(String doi) {
        try {
            if (doi == null || doi.isBlank()) return null;
            // Use raw normalized DOI in path (OpenAlex expects slashes unencoded)
            String url = "https://api.openalex.org/works/doi:" + doi;
            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) return null;
            Map<String, Object> body = resp.getBody();
            Object abs = body.get("abstract");
            if (abs == null) abs = body.get("abstract_inverted");
            if (abs instanceof String) return ((String) abs).replaceAll("<[^>]+>", "");
            return null;
        } catch (Exception ex) {
            return null;
        }
    }

    @PostMapping("/upload-pdf")
    public ResponseEntity<?> uploadPdf(@RequestParam("file") MultipartFile file,
                                       @RequestParam("username") String username,
                                       @RequestParam("title") String title) {
        try {
            if (file.isEmpty() || file.getOriginalFilename() == null || !file.getOriginalFilename().endsWith(".pdf")) {
                return ResponseEntity.badRequest().body("Please upload a valid PDF file.");
            }
            byte[] pdfBytes = file.getBytes();
            PdfDocument existing = pdfDocumentRepository.findByUsernameAndTitle(username, title).orElse(null);
            if (existing != null) {
                existing.setPdfData(pdfBytes);
                pdfDocumentRepository.save(existing);
                return ResponseEntity.ok("File updated and stored in database successfully.");
            } else {
                PdfDocument pdfDocument = new PdfDocument(username, title, pdfBytes);
                pdfDocumentRepository.save(pdfDocument);
                return ResponseEntity.ok("File uploaded and stored in database successfully.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/pdf/{username}/{title}")
    public ResponseEntity<?> getPdfByUserAndTitle(@PathVariable String username, @PathVariable String title) {
        try {
            PdfDocument pdfDoc = pdfDocumentRepository.findByUsernameAndTitle(username, title).orElse(null);
            if (pdfDoc == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("PDF not found for user and title.");
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + pdfDoc.getTitle() + ".pdf\"")
                    .body(pdfDoc.getPdfData());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving PDF: " + e.getMessage());
        }
    }

    // Normalize DOI: repeatedly URL-decode until stable to remove double-encoding like %252F -> %2F -> /
    private String normalizeDoi(String doi) {
        if (doi == null) return null;
        try {
            String prev;
            String cur = doi;
            int safety = 0;
            do {
                prev = cur;
                try {
                    cur = URLDecoder.decode(prev, StandardCharsets.UTF_8.name());
                } catch (IllegalArgumentException iae) {
                    // if decoding fails, stop and use the last good value
                    break;
                }
                safety++;
            } while (!cur.equals(prev) && safety < 10);
            return cur.trim();
        } catch (Exception ex) {
            return doi.trim();
        }
    }

    // Fetch total citation count from OpenAlex for a DOI
    private Integer fetchCitationFromOpenAlex(String doi) {
        try {
            if (doi == null || doi.isBlank()) return null;
            doi = normalizeDoi(doi);
            logger.debug("fetchCitationFromOpenAlex: normalized doi={}", doi);
            String url = "https://api.openalex.org/works/doi:" + doi;
            logger.debug("fetchCitationFromOpenAlex: requesting {}", url);
            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            logger.debug("fetchCitationFromOpenAlex: status={} bodyPresent={}", resp.getStatusCodeValue(), resp.getBody() != null);
            if (resp.getBody() != null) {
                try { String s = resp.getBody().toString(); logger.debug("fetchCitationFromOpenAlex: body (trunc): {}", s.length() > 1000 ? s.substring(0,1000) + "..." : s); } catch (Exception _e) { /* ignore */ }
            }
            if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) return null;
            Map<String, Object> body = resp.getBody();
            Object cited = body.get("cited_by_count");
            if (cited instanceof Number) return ((Number) cited).intValue();
            return null;
        } catch (Exception ex) {
            logger.warn("fetchCitationFromOpenAlex failed for {}: {}", doi, ex.getMessage(), ex);
            return null;
        }
    }

    // Fetch the OpenAlex work JSON for a DOI (returns the parsed body map or null)
    private Map<String, Object> fetchOpenAlexWork(String doi) {
        try {
            if (doi == null || doi.isBlank()) return null;
            doi = normalizeDoi(doi);
            String url = "https://api.openalex.org/works/doi:" + doi;
            logger.debug("fetchOpenAlexWork: requesting {}", url);
            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            logger.debug("fetchOpenAlexWork: status={} bodyPresent={}", resp.getStatusCodeValue(), resp.getBody() != null);
            if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) return null;
            return resp.getBody();
        } catch (Exception ex) {
            logger.warn("fetchOpenAlexWork failed for {}: {}", doi, ex.getMessage(), ex);
            return null;
        }
    }

    // Compute h-index and i10-index for an OpenAlex author id by paging their works
    private Map<String, Object> computeAuthorMetricsOpenAlex(String authorId) {
        try {
            if (authorId == null || authorId.isBlank()) return Map.of("hIndex", null, "i10Index", null, "paperCount", 0);
            List<Integer> cites = new ArrayList<>();
            String cursor = "*";
            int pages = 0;
            while (pages < 50) { // safety limit
                // Do not URL-encode the cursor value itself — OpenAlex returns a cursor token that must be used verbatim.
                // Build the OpenAlex works URL manually: encode the authorId but append cursor verbatim
                String encodedAuthor = URLEncoder.encode(authorId, StandardCharsets.UTF_8.name());
                String url = "https://api.openalex.org/works?filter=author.id:" + encodedAuthor + "&per-page=200&cursor=" + cursor;
                logger.debug("computeAuthorMetricsOpenAlex: requesting {} (cursor={})", url, cursor);
                 HttpHeaders headers = new HttpHeaders();
                 headers.add("User-Agent", "Mozilla/5.0");
                 HttpEntity<Void> entity = new HttpEntity<>(headers);
                 ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
                 if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) break;
                 Map<String, Object> body = resp.getBody();
                 Object resultsObj = body.get("results");
                 if (resultsObj instanceof List) {
                     List<?> results = (List<?>) resultsObj;
                     for (Object o : results) {
                         if (!(o instanceof Map)) continue;
                         Map<?, ?> wm = (Map<?, ?>) o;
                         Object c = wm.get("cited_by_count");
                         if (c instanceof Number) cites.add(((Number) c).intValue());
                     }
                 }
                 // get next_cursor from meta
                 Object metaObj = body.get("meta");
                 if (!(metaObj instanceof Map)) break;
                 Map<?, ?> meta = (Map<?, ?>) metaObj;
                 Object nextCursor = meta.get("next_cursor");
                 if (!(nextCursor instanceof String)) break;
                 String next = (String) nextCursor;
                 if (next == null || next.isBlank() || next.equals(cursor)) break;
                 cursor = next;
                 pages++;
             }

            // compute h-index and i10-index
            if (cites.isEmpty()) return Map.of("hIndex", 0, "i10Index", 0, "paperCount", 0);
            cites.sort((a,b) -> Integer.compare(b,a));
            int h = 0; int i10 = 0;
            for (int i = 0; i < cites.size(); i++) {
                int cit = cites.get(i);
                if (cit >= 10) i10++;
                if (cit >= i+1) h = i+1; else break;
            }
            return Map.of("hIndex", h, "i10Index", i10, "paperCount", cites.size());
        } catch (Exception ex) {
            logger.warn("computeAuthorMetricsOpenAlex failed for {}: {}", authorId, ex.getMessage(), ex);
            return Map.of("hIndex", null, "i10Index", null, "paperCount", 0);
        }
    }

    // Fetch citation count from Semantic Scholar for a DOI
    private Integer fetchCitationFromSemanticScholar(String doi) {
        try {
            if (doi == null || doi.isBlank()) return null;
            doi = normalizeDoi(doi);
            logger.debug("fetchCitationFromSemanticScholar: normalized doi={}", doi);
            String url = "https://api.semanticscholar.org/graph/v1/paper/DOI:" + doi + "?fields=citationCount";
            logger.debug("fetchCitationFromSemanticScholar: requesting {}", url);
            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0");
            if (semanticScholarApiKey != null && !semanticScholarApiKey.isBlank()) {
                headers.add("x-api-key", semanticScholarApiKey);
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            logger.debug("fetchCitationFromSemanticScholar: status={} bodyPresent={}", resp.getStatusCodeValue(), resp.getBody() != null);
            if (resp.getBody() != null) {
                try { String s = resp.getBody().toString(); logger.debug("fetchCitationFromSemanticScholar: body (trunc): {}", s.length() > 1000 ? s.substring(0,1000) + "..." : s); } catch (Exception _e) { }
            }
            if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) return null;
            Map<String, Object> body = resp.getBody();
            Object c = body.get("citationCount");
            if (c instanceof Number) return ((Number) c).intValue();
            return null;
        } catch (Exception ex) {
            logger.warn("fetchCitationFromSemanticScholar failed for {}: {}", doi, ex.getMessage(), ex);
            return null;
        }
    }

    // Fetch citation count from Crossref for a DOI
    private Integer fetchCitationFromCrossref(String doi) {
        try {
            if (doi == null || doi.isBlank()) return null;
            doi = normalizeDoi(doi);
            logger.debug("fetchCitationFromCrossref: normalized doi={}", doi);
            String url = "https://api.crossref.org/works/" + doi;
            logger.debug("fetchCitationFromCrossref: requesting {}", url);
            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            logger.debug("fetchCitationFromCrossref: status={} bodyPresent={}", resp.getStatusCodeValue(), resp.getBody() != null);
            if (resp.getBody() != null) {
                try { String s = resp.getBody().toString(); logger.debug("fetchCitationFromCrossref: body (trunc): {}", s.length() > 1000 ? s.substring(0,1000) + "..." : s); } catch (Exception _e) { }
            }
            if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) return null;
            Map<String, Object> body = resp.getBody();
            Object messageObj = body.get("message");
            if (!(messageObj instanceof Map)) return null;
            Map<String, Object> message = (Map<String, Object>) messageObj;
            Object c = message.get("is-referenced-by-count");
            if (c instanceof Number) return ((Number) c).intValue();
            return null;
        } catch (Exception ex) {
            logger.warn("fetchCitationFromCrossref failed for {}: {}", doi, ex.getMessage(), ex);
            return null;
        }
    }

    @PostMapping(value = "/citations")
    public ResponseEntity<?> postCitations(@RequestParam(value = "doi", required = false) String doiParam) {
        try {
            String doi = doiParam;
            if ((doi == null || doi.isBlank()) && doi != null) {
                Object v = doi;
                if (v instanceof String) doi = (String) v;
            }

            if (doi == null || doi.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing DOI (provide as query param or JSON body {\"doi\": \"10.xxx/...\"})"));
            }

            // If user passed a full URL, extract the DOI portion
            if (doi.contains("doi.org/")) {
                int idx = doi.indexOf("10.");
                if (idx >= 0) doi = doi.substring(idx);
            }

            // If client sent percent-encoded DOI (e.g. 10.1016%2F...), decode once to avoid double-encoding
            doi = URLDecoder.decode(doi, StandardCharsets.UTF_8.name()).trim();

             Integer openAlexCount = fetchCitationFromOpenAlex(doi);
            List<Map<String, Object>> openAlexCountsByYear = fetchCountsByYearFromOpenAlex(doi);
            Integer semanticCount = fetchCitationFromSemanticScholar(doi);
            Integer crossrefCount = fetchCitationFromCrossref(doi);

            Map<String, Object> openAlexMap = new HashMap<>();
            openAlexMap.put("cited_by_count", openAlexCount);
            openAlexMap.put("counts_by_year", openAlexCountsByYear);

            Map<String, Object> semanticMap = new HashMap<>();
            semanticMap.put("citationCount", semanticCount);

            Map<String, Object> crossrefMap = new HashMap<>();
            crossrefMap.put("citationCount", crossrefCount);

            Map<String, Object> result = new HashMap<>();
            result.put("doi", doi);
            result.put("openAlex", openAlexMap);
            result.put("semanticScholar", semanticMap);
            result.put("crossref", crossrefMap);

            // Fetch OpenAlex work JSON and compute author metrics
            Map<String, Object> work = fetchOpenAlexWork(doi);
            if (work != null) {
                result.put("openAlexWork", work);
                Object authorsObj = work.get("authorships");
                if (authorsObj instanceof List) {
                    List<?> authors = (List<?>) authorsObj;
                    List<Map<String, Object>> authorMetrics = new ArrayList<>();
                    for (Object a : authors) {
                        if (!(a instanceof Map)) continue;
                        Map<String, Object> authorEntry = (Map<String, Object>) a;
                        // OpenAlex authorship structure: { author: { id: 'https://openalex.org/A...' , display_name: ... }, ... }
                        String authorId = null;
                        Object authorObj = authorEntry.get("author");
                        if (authorObj instanceof Map) {
                            Map<?, ?> authorMap = (Map<?, ?>) authorObj;
                            Object idObj = authorMap.get("id");
                            if (idObj instanceof String) authorId = (String) idObj;
                        }
                        // fallbacks if present
                        if ((authorId == null || authorId.isBlank()) && authorEntry.get("author_id") instanceof String) {
                            authorId = (String) authorEntry.get("author_id");
                        }
                        if (authorId != null && !authorId.isBlank()) {
                            Map<String, Object> metrics = computeAuthorMetricsOpenAlex(authorId);
                            Map<String, Object> metricItem = new HashMap<>();
                            metricItem.put("author_id", authorId);
                            metricItem.put("h_index", metrics.get("hIndex"));
                            metricItem.put("i10_index", metrics.get("i10Index"));
                            metricItem.put("paper_count", metrics.get("paperCount"));
                            // include display name if available
                            if (authorObj instanceof Map) {
                                Object name = ((Map<?,?>)authorObj).get("display_name");
                                if (name instanceof String) metricItem.put("display_name", name);
                            }
                            authorMetrics.add(metricItem);
                        }
                    }
                    result.put("authorMetrics", authorMetrics);
                }
            }

            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            logger.error("Error in postCitations: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", ex.getMessage()));
        }
    }

    // Fetch counts by year from OpenAlex for a DOI (returns list of {year, cited_by_count})
    private List<Map<String, Object>> fetchCountsByYearFromOpenAlex(String doi) {
        try {
            if (doi == null || doi.isBlank()) return List.of();
            doi = normalizeDoi(doi);
            String url = "https://api.openalex.org/works/doi:" + doi;
            logger.debug("fetchCountsByYearFromOpenAlex: requesting {}", url);
            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            logger.debug("fetchCountsByYearFromOpenAlex: status={} bodyPresent={}", resp.getStatusCode(), resp.getBody() != null);
            if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) return List.of();
            Map<String, Object> body = resp.getBody();
            Object countsObj = body.get("counts_by_year");
            if (!(countsObj instanceof List)) return List.of();
            List<?> countsList = (List<?>) countsObj;
            List<Map<String, Object>> out = new ArrayList<>();
            for (Object o : countsList) {
                if (!(o instanceof Map)) continue;
                Map<?, ?> m = (Map<?, ?>) o;
                Object yearObj = m.get("year");
                Object citedObj = m.get("cited_by_count");
                Integer year = yearObj instanceof Number ? ((Number) yearObj).intValue() : null;
                Integer cited = citedObj instanceof Number ? ((Number) citedObj).intValue() : null;
                Map<String, Object> row = new HashMap<>();
                row.put("year", year);
                row.put("cited_by_count", cited);
                out.add(row);
            }
            return out;
        } catch (Exception ex) {
            logger.warn("fetchCountsByYearFromOpenAlex failed for {}: {}", doi, ex.getMessage(), ex);
            return List.of();
        }
    }

}
