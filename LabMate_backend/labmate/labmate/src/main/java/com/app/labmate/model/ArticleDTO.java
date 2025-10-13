package com.app.labmate.model;

import lombok.Data;

@Data
public class ArticleDTO {
    private String title;
    private String authors;
    private String abstractText;
    private String journal;
    private String doi;
    private String volume;
    private String publicationDate;
    private String issn;
    private String url;
}
