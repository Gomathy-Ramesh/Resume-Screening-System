package com.resume.resume_screening_system.repository;

import com.resume.resume_screening_system.entity.AdminUser;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminUserRepository
        extends JpaRepository<AdminUser, Long> {

    Optional<AdminUser> findByUsername(
            String username
    );

    Optional<AdminUser> findByEmail(
            String email
    );
}