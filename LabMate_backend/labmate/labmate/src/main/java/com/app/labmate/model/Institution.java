package com.app.labmate.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "institution")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class Institution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String institution;

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
    @Size(min = 6)
    private String password;

    @NotBlank
    private String confirmPassword;

}
