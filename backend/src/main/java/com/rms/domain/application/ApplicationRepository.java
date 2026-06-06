package com.rms.domain.application;

import com.rms.domain.job.Job;
import com.rms.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Page<Application> findByCandidate(User candidate, Pageable pageable);
    Page<Application> findByJob(Job job, Pageable pageable);
    Page<Application> findByJob_Recruiter(User recruiter, Pageable pageable);
    Optional<Application> findByJobAndCandidate(Job job, User candidate);
    boolean existsByJobAndCandidate(Job job, User candidate);

    @Query("SELECT a.status, COUNT(a) FROM Application a WHERE a.job.recruiter = :recruiter GROUP BY a.status")
    java.util.List<Object[]> countByStatusForRecruiter(User recruiter);
}
