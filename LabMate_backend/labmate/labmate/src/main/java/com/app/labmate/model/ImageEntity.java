package com.app.labmate.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "image_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class ImageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Lob
    private byte[] imageData;

    // Getters and setters
}

