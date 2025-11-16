package com.app.labmate.controller;

import com.app.labmate.model.Publication;
import com.app.labmate.repo.PublicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class PublicationController {

    @Autowired
    private PublicationRepository publicationRepository;

    @PostMapping("/publications")
    public ResponseEntity<?> savePublication(@RequestBody Publication publication) {
        try {
            if (publication.getTitle() == null || publication.getSavedBy() == null) {
                return ResponseEntity.badRequest().body("title and savedBy are required");
            }

            Optional<Publication> existing = publicationRepository.findByTitleAndSavedBy(publication.getTitle(), publication.getSavedBy());
            if (existing.isPresent()) {
                // existing: update/override fields and save (upsert behavior)
                Publication e = existing.get();
                e.setAuthors(publication.getAuthors());
                e.setAbstractText(publication.getAbstractText());
                e.setJournal(publication.getJournal());
                e.setDoi(publication.getDoi());
                e.setVolume(publication.getVolume());
                e.setPublicationDate(publication.getPublicationDate());
                e.setIssn(publication.getIssn());
                e.setUrl(publication.getUrl());
                e.setAuthorsArray(publication.getAuthorsArray());

                Publication updated = publicationRepository.save(e);
                return ResponseEntity.ok(updated);
            } else {
                Publication saved = publicationRepository.save(publication);
                return ResponseEntity.status(HttpStatus.CREATED).body(saved);
            }
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save publication: " + ex.getMessage());
        }
    }

    @GetMapping("/publications/{savedBy}")
    public ResponseEntity<?> getPublicationsBySavedBy(@PathVariable String savedBy) {
        try {
            List<Publication> list = publicationRepository.findAllBySavedBy(savedBy);
            if (list == null || list.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No publications found for user: " + savedBy);
            }
            return ResponseEntity.ok(list);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch publications: " + ex.getMessage());
        }
    }
}
