package com.app.labmate.controller;

import com.app.labmate.model.ArticleDTO;
import com.app.labmate.model.PdfDocument;
import com.app.labmate.repo.PdfDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api")
public class ArticleController {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private PdfDocumentRepository pdfDocumentRepository;

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
            String url = "https://api.openalex.org/works/doi:" + URLEncoder.encode(doi, StandardCharsets.UTF_8.name());
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

}
