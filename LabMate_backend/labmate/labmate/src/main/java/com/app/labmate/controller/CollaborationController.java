package com.app.labmate.controller;

import com.app.labmate.model.Collaboration;
import com.app.labmate.service.CollaborationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class CollaborationController {

    @Autowired
    private CollaborationService collaborationService;

    @PostMapping("/collaboration")
    public Collaboration createCollaboration(@RequestBody Collaboration collaboration){
        return collaborationService.saveOrUpdateCollaboration(collaboration);
    }

    @GetMapping("/getCollaborationByEmail/{email}")
    public Optional<Collaboration> getCollaborationByEmail(@PathVariable("email") String email) {
        return collaborationService.getCollaborationByEmail(email);
    }

}
