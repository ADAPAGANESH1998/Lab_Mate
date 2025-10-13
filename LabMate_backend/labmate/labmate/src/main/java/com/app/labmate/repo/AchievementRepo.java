package com.app.labmate.repo;

import com.app.labmate.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AchievementRepo extends JpaRepository<Achievement, Long> {
    Optional<Achievement> findByEmail(String email);
}
