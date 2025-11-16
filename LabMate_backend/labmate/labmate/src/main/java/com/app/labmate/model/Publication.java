package com.app.labmate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "publications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Lob
    private String authors; // comma separated for convenience

    @Lob
    private String abstractText;

    private String journal;

    private String doi;

    private String volume;

    private String publicationDate;

    private String issn;

    private String url;

    private String savedBy;

    @ElementCollection
    @CollectionTable(name = "publication_authors_array", joinColumns = @JoinColumn(name = "publication_id"))
    @Column(name = "author")
    private List<String> authorsArray;

}

