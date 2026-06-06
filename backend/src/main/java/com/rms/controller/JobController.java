package com.rms.controller;

import com.rms.domain.job.Job;
import com.rms.domain.job.JobStatus;
import com.rms.domain.user.User;
import com.rms.service.JobService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public Page<Job> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return jobService.listOpen(q, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @GetMapping("/{id}")
    public Job get(@PathVariable Long id) {
        return jobService.getById(id);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('RECRUITER')")
    public Page<Job> myJobs(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return jobService.listByRecruiter(user, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Job> create(@AuthenticationPrincipal User user,
                                      @Valid @RequestBody JobService.JobRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.create(user, req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public Job update(@PathVariable Long id,
                      @AuthenticationPrincipal User user,
                      @Valid @RequestBody JobService.JobRequest req) {
        return jobService.update(id, user, req);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public Job changeStatus(@PathVariable Long id,
                            @AuthenticationPrincipal User user,
                            @RequestParam JobStatus status) {
        return jobService.changeStatus(id, user, status);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        jobService.delete(id, user);
    }
}
