package com.app.labmate.service;

import com.app.labmate.model.Research;
import com.app.labmate.repo.ResearchRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ResearchService {

    @Autowired
    private ResearchRepo researchRepo;

//    public Research createResearch(Research research) {
//       return researchRepo.save(research);
//    }

    public Research saveOrUpdateResearch(Research research) {
        Optional<Research> existing = researchRepo.findByEmail(research.getEmail());

        if (existing.isPresent()) {
            Research dbResearch = existing.get();

            dbResearch.setAboutResearch(research.getAboutResearch());
            dbResearch.setPrimaryResearchFocus(research.getPrimaryResearchFocus());
            dbResearch.setInspirationalQuestion(research.getInspirationalQuestion());
            dbResearch.setCurrentResearchChallenges(research.getCurrentResearchChallenges());
            dbResearch.setTechniquesExpertise(research.getTechniquesExpertise());
            dbResearch.setResearchProjects(research.getResearchProjects());
            dbResearch.setAreYouLookingForFunding(research.getAreYouLookingForFunding());

            return researchRepo.save(dbResearch);
        } else {
            return researchRepo.save(research);
        }
    }



    public Optional<Research> getResearchById(Long id) {
        return researchRepo.findById(id);
    }

    public Optional<Research> getResearchByEmail(String email) {
        return researchRepo.findByEmail(email);
    }
}
