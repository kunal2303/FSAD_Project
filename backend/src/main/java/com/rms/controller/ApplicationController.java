package com.rms.controller;

import com.rms.domain.application.Application;
import com.rms.domain.application.ApplicationStatus;
import com.rms.domain.user.User;
import com.rms.service.ApplicationService;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/jobs/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Application> apply(@PathVariable Long jobId,
                                              @AuthenticationPrincipal User user,
                                              @RequestBody ApplicationService.ApplyRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.apply(jobId, user, req));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public Page<Application> myApplications(@AuthenticationPrincipal User user,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return applicationService.myCandidateApplications(user,
                PageRequest.of(page, size, Sort.by("submittedAt").descending()));
    }

    @PatchMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('CANDIDATE')")
    public Application withdraw(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return applicationService.withdraw(id, user);
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public Page<Application> forJob(@PathVariable Long jobId,
                                     @AuthenticationPrincipal User user,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size) {
        return applicationService.applicationsForJob(jobId, user,
                PageRequest.of(page, size, Sort.by("submittedAt").descending()));
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public Page<Application> recruiterAll(@AuthenticationPrincipal User user,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        return applicationService.allRecruiterApplications(user,
                PageRequest.of(page, size, Sort.by("submittedAt").descending()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public Application updateStatus(@PathVariable Long id,
                                     @AuthenticationPrincipal User user,
                                     @RequestParam ApplicationStatus status) {
        return applicationService.updateStatus(id, user, status);
    }

    @PatchMapping("/{id}/notes")
    @PreAuthorize("hasRole('RECRUITER')")
    public Application addNotes(@PathVariable Long id,
                                 @AuthenticationPrincipal User user,
                                 @RequestBody Map<String, String> body) {
        return applicationService.addNotes(id, user, body.get("notes"));
    }
}
