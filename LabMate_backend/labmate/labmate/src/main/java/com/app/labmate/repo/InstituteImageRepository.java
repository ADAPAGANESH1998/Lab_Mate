package com.app.labmate.repo;

import com.app.labmate.model.ImageEntity;
import com.app.labmate.model.InstituteImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstituteImageRepository extends JpaRepository<InstituteImageEntity, Long> {
}
