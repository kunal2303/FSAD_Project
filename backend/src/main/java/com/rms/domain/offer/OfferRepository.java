package com.rms.domain.offer;

import com.rms.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    Optional<Offer> findByApplication_Id(Long applicationId);
    Page<Offer> findByApplication_Job_Recruiter(User recruiter, Pageable pageable);
    Page<Offer> findByApplication_Candidate(User candidate, Pageable pageable);
}
