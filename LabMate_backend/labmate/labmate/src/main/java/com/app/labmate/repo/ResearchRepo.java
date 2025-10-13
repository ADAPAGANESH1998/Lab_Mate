package com.app.labmate.repo;

import com.app.labmate.model.Research;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResearchRepo extends JpaRepository<Research,Long> {
    Optional<Research> findByEmail(String email);
}
