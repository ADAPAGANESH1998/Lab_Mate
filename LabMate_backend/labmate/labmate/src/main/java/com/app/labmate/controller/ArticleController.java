package com.app.labmate.controller;

import com.app.labmate.model.ArticleDTO;
import com.app.labmate.model.PdfDocument;
import com.app.labmate.model.PdfMetadata;
import com.app.labmate.repo.PdfDocumentRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api")
public class ArticleController {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private PdfDocumentRepository pdfDocumentRepository;

    // In-memory storage for PDF metadata
    private static final CopyOnWriteArrayList<PdfMetadata> pdfMetadataList = new CopyOnWriteArrayList<>();

    @GetMapping("/article")
    public ResponseEntity<?> getArticle(@RequestParam String url) {
        try {
            // ✅ Extract DOI from input URL
            String doi;
            if (url.contains("doi.org/")) {
                doi = url.substring(url.indexOf("10."));
            } else if (url.startsWith("10.")) {
                doi = url;
            } else {
                return ResponseEntity.badRequest().body("Invalid DOI or URL format.");
            }

            // ✅ Use Crossref free API
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

            // ✅ Title
            List<String> titles = (List<String>) message.get("title");
            article.setTitle(titles != null && !titles.isEmpty() ? titles.get(0) : null);

            // ✅ DOI
            article.setDoi("https://doi.org/"+(String) message.get("DOI"));

            // ✅ Journal Name
            List<String> containerTitles = (List<String>) message.get("container-title");
            article.setJournal(containerTitles != null && !containerTitles.isEmpty() ? containerTitles.get(0) : null);

            // ✅ Volume
            article.setVolume((String) message.get("volume"));

            // ✅ Publication Date
            if (message.get("issued") != null) {
                Map<String, Object> issued = (Map<String, Object>) message.get("issued");
                List<List<Integer>> dateParts = (List<List<Integer>>) issued.get("date-parts");
                if (dateParts != null && !dateParts.isEmpty()) {
                    List<Integer> date = dateParts.get(0);
                    String formattedDate = date.stream().map(Object::toString).collect(Collectors.joining("-"));
                    article.setPublicationDate(formattedDate);
                }
            }

            // ✅ Authors
            if (message.get("author") != null) {
                List<Map<String, Object>> authorsList = (List<Map<String, Object>>) message.get("author");
                List<String> authors = new ArrayList<>();
                for (Map<String, Object> a : authorsList) {
                    String given = (String) a.get("given");
                    String family = (String) a.get("family");
                    authors.add((given != null ? given : "") + " " + (family != null ? family : ""));
                }
                article.setAuthors(String.join(", ", authors));
            }

            // ✅ Abstract (if available)
            if (message.get("abstract") != null) {
                // Abstract might be in HTML tags, you can strip them if needed
                String abs = (String) message.get("abstract");
                abs = abs.replaceAll("<[^>]+>", ""); // remove HTML tags
                article.setAbstractText(abs);
            }

            return ResponseEntity.ok(article);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching article: " + e.getMessage());
        }
    }

    @PostMapping("/upload-pdf")
    public ResponseEntity<?> uploadPdf(@RequestParam("file") MultipartFile file,
                                       @RequestParam("username") String username,
                                       @RequestParam("title") String title) {
        try {
            if (file.isEmpty() || !file.getOriginalFilename().endsWith(".pdf")) {
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
