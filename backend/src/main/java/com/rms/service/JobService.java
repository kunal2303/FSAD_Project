package com.rms.service;

import com.rms.domain.job.*;
import com.rms.domain.user.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@Transactional
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public record JobRequest(
            @NotBlank String title,
            @NotBlank String description,
            String department,
            String location,
            String jobType,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            LocalDate closesAt
    ) {}

    public Page<Job> listOpen(String query, Pageable pageable) {
        if (query != null && !query.isBlank()) {
            return jobRepository.search(query.trim(), pageable);
        }
        return jobRepository.findByStatus(JobStatus.OPEN, pageable);
    }

    public Page<Job> listByRecruiter(User recruiter, Pageable pageable) {
        return jobRepository.findByRecruiter(recruiter, pageable);
    }

    public Job getById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
    }

    public Job create(User recruiter, JobRequest req) {
        Job job = Job.builder()
                .recruiter(recruiter)
                .title(req.title())
                .description(req.description())
                .department(req.department())
                .location(req.location())
                .jobType(req.jobType())
                .salaryMin(req.salaryMin())
                .salaryMax(req.salaryMax())
                .closesAt(req.closesAt())
                .status(JobStatus.DRAFT)
                .build();
        return jobRepository.save(job);
    }

    public Job update(Long id, User recruiter, JobRequest req) {
        Job job = getById(id);
        assertOwner(job, recruiter);
        job.setTitle(req.title());
        job.setDescription(req.description());
        job.setDepartment(req.department());
        job.setLocation(req.location());
        job.setJobType(req.jobType());
        job.setSalaryMin(req.salaryMin());
        job.setSalaryMax(req.salaryMax());
        job.setClosesAt(req.closesAt());
        return jobRepository.save(job);
    }

    public Job changeStatus(Long id, User recruiter, JobStatus status) {
        Job job = getById(id);
        assertOwner(job, recruiter);
        job.setStatus(status);
        return jobRepository.save(job);
    }

    public void delete(Long id, User recruiter) {
        Job job = getById(id);
        assertOwner(job, recruiter);
        jobRepository.delete(job);
    }

    private void assertOwner(Job job, User recruiter) {
        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }
}
