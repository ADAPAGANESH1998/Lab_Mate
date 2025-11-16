package com.app.labmate.repo;

import com.app.labmate.model.Publication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {
    Optional<Publication> findByTitleAndSavedBy(String title, String savedBy);

    List<Publication> findAllBySavedBy(String savedBy);
}
