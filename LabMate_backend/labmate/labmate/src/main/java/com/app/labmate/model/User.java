package com.app.labmate.model;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String fullName;

//    @NotNull
@JsonFormat(pattern = "yyyy-MM-dd")
    private Date dateOfBirth;

    @NotBlank
    private String profession;

    @NotBlank
    private String country;

//    @NotBlank
    private String state;

//    @Email
//    @NotBlank
    private String email;

//    @Email
//    @NotBlank
    private String confirmEmail;

    @NotBlank
    private String institution;

    @NotBlank
    @Size(min = 6)
    private String password;

    @NotBlank
    private String confirmPassword;

    // Getters and setters
}
