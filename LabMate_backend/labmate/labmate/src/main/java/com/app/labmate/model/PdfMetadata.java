package com.app.labmate.model;

public class PdfMetadata {
    private String username;
    private String title;
    private String filename;

    public PdfMetadata(String username, String title, String filename) {
        this.username = username;
        this.title = title;
        this.filename = filename;
    }

    public String getUsername() {
        return username;
    }

    public String getTitle() {
        return title;
    }

    public String getFilename() {
        return filename;
    }
}

