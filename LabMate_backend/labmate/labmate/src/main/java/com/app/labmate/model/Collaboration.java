package com.app.labmate.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "collaboration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class Collaboration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email")
    private String email;

    @Column(name = "types_of_collaboration_desired", columnDefinition = "TEXT")
    private String typesOfCollaborationDesired;

    @Column(name = "preferred_domains", columnDefinition = "TEXT")
    private String preferredDomains;

    @Column(name = "collaboration_goals", columnDefinition = "TEXT")
    private String collaborationGoals;

    @Column(name = "resource_sharing", columnDefinition = "TEXT")
    private String resourceSharing;

    @Column(name = "available_time", length = 100)
    private String availableTime;

    @Column(name = "desired_skills_in_collaborators", columnDefinition = "TEXT")
    private String desiredSkillsInCollaborators;

    @Column(name = "mutual_benefits_in_collaboration", columnDefinition = "TEXT")
    private String mutualBenefitsInCollaboration;
}
