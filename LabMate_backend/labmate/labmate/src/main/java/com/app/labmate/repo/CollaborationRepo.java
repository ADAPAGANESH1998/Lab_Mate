package com.app.labmate.repo;

import com.app.labmate.model.Collaboration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CollaborationRepo extends JpaRepository<Collaboration,Long> {


    Optional<Collaboration> findByEmail(String email);
}
