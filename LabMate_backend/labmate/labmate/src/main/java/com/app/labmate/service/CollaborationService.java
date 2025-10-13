package com.app.labmate.service;

import com.app.labmate.model.Collaboration;
import com.app.labmate.repo.CollaborationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CollaborationService {

    @Autowired
    private CollaborationRepo collaborationRepo;

//

    public Collaboration saveOrUpdateCollaboration(Collaboration collaboration) {
        Optional<Collaboration> existing = collaborationRepo.findByEmail(collaboration.getEmail());

        if (existing.isPresent()) {
            Collaboration existingCollab = existing.get();

            // Update fields
            existingCollab.setTypesOfCollaborationDesired(collaboration.getTypesOfCollaborationDesired());
            existingCollab.setPreferredDomains(collaboration.getPreferredDomains());
            existingCollab.setCollaborationGoals(collaboration.getCollaborationGoals());
            existingCollab.setResourceSharing(collaboration.getResourceSharing());
            existingCollab.setAvailableTime(collaboration.getAvailableTime());
            existingCollab.setDesiredSkillsInCollaborators(collaboration.getDesiredSkillsInCollaborators());
            existingCollab.setMutualBenefitsInCollaboration(collaboration.getMutualBenefitsInCollaboration());

            return collaborationRepo.save(existingCollab);
        } else {
            // New entry
            return collaborationRepo.save(collaboration);
        }
    }


    public Optional<Collaboration> getCollaborationById(Long id) {
        return collaborationRepo.findById(id);
    }

    public Optional<Collaboration> getCollaborationByEmail(String email) {
        return collaborationRepo.findByEmail(email);
    }
}
