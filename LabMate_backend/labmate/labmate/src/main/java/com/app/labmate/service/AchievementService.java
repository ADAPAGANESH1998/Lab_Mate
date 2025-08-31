package com.app.labmate.service;

import com.app.labmate.model.Achievement;
import com.app.labmate.repo.AchievementRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AchievementService {

    @Autowired
    private AchievementRepo achievementRepo;

    public Achievement saveOrUpdateAchievement(Achievement achievement) {
        Optional<Achievement> existing = achievementRepo.findByEmail(achievement.getEmail());

        if (existing.isPresent()) {
            Achievement existingAch = existing.get();
            existingAch.setAwardsAndRecognition(achievement.getAwardsAndRecognition());
            existingAch.setMajorMilestones(achievement.getMajorMilestones());
            existingAch.setFundingSecured(achievement.getFundingSecured());
            existingAch.setBreakthroughsOrInnovations(achievement.getBreakthroughsOrInnovations());
            existingAch.setTeachingAndMentorship(achievement.getTeachingAndMentorship());
            existingAch.setCommunityContributions(achievement.getCommunityContributions());
            return achievementRepo.save(existingAch);
        } else {
            return achievementRepo.save(achievement);
        }
    }

    public Optional<Achievement> getAchievementByEmail(String email) {
        return achievementRepo.findByEmail(email);
    }

    public Optional<Achievement> getAchievementById(Long id) {
        return achievementRepo.findById(id);
    }
}
