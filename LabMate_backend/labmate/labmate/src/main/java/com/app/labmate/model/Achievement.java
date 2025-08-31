package com.app.labmate.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "achievement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "awards_and_recognition", columnDefinition = "TEXT")
    private String awardsAndRecognition;

    @Column(name = "major_milestones", columnDefinition = "TEXT")
    private String majorMilestones;

    @Column(name = "funding_secured", columnDefinition = "TEXT")
    private String fundingSecured;

    @Column(name = "breakthroughs_or_innovations", columnDefinition = "TEXT")
    private String breakthroughsOrInnovations;

    @Column(name = "teaching_and_mentorship", columnDefinition = "TEXT")
    private String teachingAndMentorship;

    @Column(name = "community_contributions", columnDefinition = "TEXT")
    private String communityContributions;
}

