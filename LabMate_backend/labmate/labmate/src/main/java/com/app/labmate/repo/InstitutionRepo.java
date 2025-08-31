package com.app.labmate.repo;

import com.app.labmate.model.Institution;
import com.app.labmate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstitutionRepo extends JpaRepository<Institution,Long> {
    Optional<Institution> findByEmail(String email);
}
