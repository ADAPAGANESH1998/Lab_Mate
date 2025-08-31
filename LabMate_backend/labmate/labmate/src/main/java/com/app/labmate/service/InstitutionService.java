package com.app.labmate.service;

import com.app.labmate.model.Institution;
import com.app.labmate.repo.InstitutionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InstitutionService {

    @Autowired
    private InstitutionRepo institutionRepo;

    public Institution saveInstitution(Institution institution) {
        return institutionRepo.save(institution);
    }
}
