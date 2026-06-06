package com.rms.domain.interview;

import com.rms.domain.application.Application;
import com.rms.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    Page<Interview> findByApplication_Job_Recruiter(User recruiter, Pageable pageable);
    Page<Interview> findByApplication_Candidate(User candidate, Pageable pageable);

    @Query("SELECT i FROM Interview i WHERE i.application.id = :appId")
    List<Interview> findByApplicationId(Long appId);
}
