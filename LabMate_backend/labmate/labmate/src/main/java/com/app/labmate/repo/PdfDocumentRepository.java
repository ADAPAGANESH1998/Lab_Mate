package com.app.labmate.repo;

import com.app.labmate.model.PdfDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PdfDocumentRepository extends JpaRepository<PdfDocument, Long> {
    Optional<PdfDocument> findByUsernameAndTitle(String username, String title);
}

