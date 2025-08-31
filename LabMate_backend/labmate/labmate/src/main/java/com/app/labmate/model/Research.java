package com.app.labmate.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "research")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class Research {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email")
    private String email;

    @Column(name = "about_research", columnDefinition = "TEXT")
    private String aboutResearch;

    @Column(name = "primary_research_focus", length = 255)
    private String primaryResearchFocus;

    @Column(name = "inspirational_question", columnDefinition = "TEXT")
    private String inspirationalQuestion;

    @Column(name = "current_research_challenges", columnDefinition = "TEXT")
    private String currentResearchChallenges;

    @Column(name = "techniques_expertise", columnDefinition = "TEXT")
    private String techniquesExpertise;

    @Column(name = "research_projects", columnDefinition = "TEXT")
    private String researchProjects;

    @Column(name = "looking_for_funding")
    private String areYouLookingForFunding;

}
