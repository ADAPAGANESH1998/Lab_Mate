package com.app.labmate.controller;

import com.app.labmate.model.Achievement;
import com.app.labmate.service.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AchievementController {

    @Autowired
    private AchievementService achievementService;

    @PostMapping("/achievement")
    public Achievement createOrUpdateAchievement(@RequestBody Achievement achievement) {
        return achievementService.saveOrUpdateAchievement(achievement);
    }

    @GetMapping("/getAchievementByEmail/{email}")
    public Optional<Achievement> getAchievementByEmail(@PathVariable("email") String email) {
        return achievementService.getAchievementByEmail(email);
    }
}
