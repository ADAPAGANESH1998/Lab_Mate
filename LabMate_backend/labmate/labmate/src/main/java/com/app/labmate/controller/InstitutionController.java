package com.app.labmate.controller;

import com.app.labmate.model.Institution;
import com.app.labmate.service.InstitutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api")

public class InstitutionController {

    @Autowired
    private InstitutionService institutionService;

    @PostMapping("/saveInstitution")
    public Institution saveInstitution(@RequestBody Institution institution){
        return institutionService.saveInstitution(institution);
    }


}
