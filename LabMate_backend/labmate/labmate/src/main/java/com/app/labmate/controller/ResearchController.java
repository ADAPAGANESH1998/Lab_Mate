package com.app.labmate.controller;


import com.app.labmate.model.Research;
import com.app.labmate.service.ResearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ResearchController {

    @Autowired
    private ResearchService researchService;

    @PostMapping("/research")
    public Research createResearch(@RequestBody Research research) {
        return researchService.saveOrUpdateResearch(research);
    }

    @GetMapping("/getResearchById")
    public Optional<Research> getResearchById(@RequestParam("id") Long id) {
        return researchService.getResearchById(id);
    }

    @GetMapping("/getResearchByEmail/{email}")
    public Optional<Research> getResearchByEmail(@PathVariable("email") String email) {
        return researchService.getResearchByEmail(email);
    }


}
