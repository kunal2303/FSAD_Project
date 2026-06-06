package com.rms.service;

import com.rms.domain.application.*;
import com.rms.domain.job.Job;
import com.rms.domain.job.JobRepository;
import com.rms.domain.job.JobStatus;
import com.rms.domain.user.User;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                               JobRepository jobRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
    }

    public record ApplyRequest(String coverLetter, String resumeUrl) {}

    public Application apply(Long jobId, User candidate, ApplyRequest req) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
        if (job.getStatus() != JobStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Job is not open for applications");
        }
        if (applicationRepository.existsByJobAndCandidate(job, candidate)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied to this job");
        }
        Application app = Application.builder()
                .job(job)
                .candidate(candidate)
                .coverLetter(req.coverLetter())
                .resumeUrl(req.resumeUrl())
                .build();
        return applicationRepository.save(app);
    }

    public Page<Application> myCandidateApplications(User candidate, Pageable pageable) {
        return applicationRepository.findByCandidate(candidate, pageable);
    }

    public Page<Application> applicationsForJob(Long jobId, User recruiter, Pageable pageable) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return applicationRepository.findByJob(job, pageable);
    }

    public Page<Application> allRecruiterApplications(User recruiter, Pageable pageable) {
        return applicationRepository.findByJob_Recruiter(recruiter, pageable);
    }

    public Application updateStatus(Long appId, User recruiter, ApplicationStatus status) {
        Application app = getById(appId);
        if (!app.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        app.setStatus(status);
        return applicationRepository.save(app);
    }

    public Application addNotes(Long appId, User recruiter, String notes) {
        Application app = getById(appId);
        if (!app.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        app.setRecruiterNotes(notes);
        return applicationRepository.save(app);
    }

    public Application withdraw(Long appId, User candidate) {
        Application app = getById(appId);
        if (!app.getCandidate().getId().equals(candidate.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        app.setStatus(ApplicationStatus.WITHDRAWN);
        return applicationRepository.save(app);
    }

    public Application getById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
    }
}
