package com.app.labmate.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pdf_documents")
public class PdfDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String title;

    @Lob
    @Column(name = "pdf_data", columnDefinition = "LONGBLOB")
    private byte[] pdfData;

    public PdfDocument() {}

    public PdfDocument(String username, String title, byte[] pdfData) {
        this.username = username;
        this.title = title;
        this.pdfData = pdfData;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getTitle() { return title; }
    public byte[] getPdfData() { return pdfData; }

    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setTitle(String title) { this.title = title; }
    public void setPdfData(byte[] pdfData) { this.pdfData = pdfData; }
}

