package com.app.labmate.service;

import com.app.labmate.model.ArticleDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class PublicationService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ArticleDTO fetchArticleMetadata(String url) throws Exception {
        String pii = extractPii(url);
        if (pii == null) {
            throw new IllegalArgumentException("Invalid ScienceDirect URL, cannot extract PII");
        }

        // Construct DOI directly from PII
        String doi = "10.1016/" + pii;

        // Call OpenAlex API
        String openAlexUrl = "https://api.openalex.org/works/doi:" + doi;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(openAlexUrl))
                .header("User-Agent", "Java HttpClient")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        // Parse JSON response
        JsonNode root = objectMapper.readTree(response.body());
        ArticleDTO dto = new ArticleDTO();

        dto.setTitle(root.path("title").asText("N/A"));

        // Authors
        if (root.has("authorships")) {
            StringBuilder authors = new StringBuilder();
            for (JsonNode a : root.path("authorships")) {
                String name = a.path("author").path("display_name").asText();
                if (!name.isEmpty()) {
                    if (authors.length() > 0) authors.append(", ");
                    authors.append(name);
                }
            }
            dto.setAuthors(authors.toString());
        } else {
            dto.setAuthors("N/A");
        }

        dto.setAbstractText(root.path("abstract").asText("N/A"));
        dto.setJournal(root.path("host_venue").path("display_name").asText("N/A"));

        return dto;
    }

    // Helper to extract PII from ScienceDirect URL
    private String extractPii(String url) {
        if (url == null || !url.contains("/pii/")) return null;
        return url.substring(url.lastIndexOf("/pii/") + 5);
    }
}
