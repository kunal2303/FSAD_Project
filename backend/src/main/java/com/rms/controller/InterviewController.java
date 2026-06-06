package com.rms.controller;

import com.rms.domain.interview.Interview;
import com.rms.domain.user.User;
import com.rms.service.InterviewService;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping("/applications/{appId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Interview> schedule(@PathVariable Long appId,
                                               @AuthenticationPrincipal User user,
                                               @RequestBody InterviewService.ScheduleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(interviewService.schedule(appId, user, req));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('RECRUITER')")
    public Interview reschedule(@PathVariable Long id,
                                 @AuthenticationPrincipal User user,
                                 @RequestBody InterviewService.ScheduleRequest req) {
        return interviewService.reschedule(id, user, req);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('RECRUITER')")
    public Interview cancel(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return interviewService.cancel(id, user);
    }

    @PatchMapping("/{id}/feedback")
    @PreAuthorize("hasRole('RECRUITER')")
    public Interview feedback(@PathVariable Long id,
                               @AuthenticationPrincipal User user,
                               @RequestBody InterviewService.FeedbackRequest req) {
        return interviewService.submitFeedback(id, user, req);
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public Page<Interview> recruiterInterviews(@AuthenticationPrincipal User user,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        return interviewService.recruiterInterviews(user,
                PageRequest.of(page, size, Sort.by("scheduledAt").ascending()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public Page<Interview> myInterviews(@AuthenticationPrincipal User user,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        return interviewService.candidateInterviews(user,
                PageRequest.of(page, size, Sort.by("scheduledAt").ascending()));
    }

    @GetMapping("/applications/{appId}")
    public List<Interview> forApplication(@PathVariable Long appId) {
        return interviewService.forApplication(appId);
    }
}
