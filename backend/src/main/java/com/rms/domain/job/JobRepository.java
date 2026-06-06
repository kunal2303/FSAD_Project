package com.rms.domain.job;

import com.rms.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    Page<Job> findByStatus(JobStatus status, Pageable pageable);
    Page<Job> findByRecruiter(User recruiter, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.status = 'OPEN' AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Job> search(String q, Pageable pageable);

    long countByRecruiterAndStatus(User recruiter, JobStatus status);
}
