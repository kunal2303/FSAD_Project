package com.rms.service;

import com.rms.domain.application.Application;
import com.rms.domain.application.ApplicationRepository;
import com.rms.domain.application.ApplicationStatus;
import com.rms.domain.interview.*;
import com.rms.domain.user.User;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;

    public InterviewService(InterviewRepository interviewRepository,
                             ApplicationRepository applicationRepository) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
    }

    public record ScheduleRequest(
            Instant scheduledAt,
            Integer durationMins,
            String location,
            String meetingUrl,
            Long interviewerId
    ) {}

    public record FeedbackRequest(String feedback, Short rating) {}

    public Interview schedule(Long appId, User recruiter, ScheduleRequest req) {
        Application app = getApplication(appId);
        assertRecruiterOwns(app, recruiter);

        Interview interview = Interview.builder()
                .application(app)
                .scheduledAt(req.scheduledAt())
                .durationMins(req.durationMins() != null ? req.durationMins() : 60)
                .location(req.location())
                .meetingUrl(req.meetingUrl())
                .build();
        Interview saved = interviewRepository.save(interview);

        app.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(app);

        return saved;
    }

    public Interview reschedule(Long interviewId, User recruiter, ScheduleRequest req) {
        Interview interview = getById(interviewId);
        assertRecruiterOwnsInterview(interview, recruiter);
        interview.setScheduledAt(req.scheduledAt());
        interview.setDurationMins(req.durationMins() != null ? req.durationMins() : interview.getDurationMins());
        interview.setLocation(req.location());
        interview.setMeetingUrl(req.meetingUrl());
        interview.setStatus(InterviewStatus.RESCHEDULED);
        return interviewRepository.save(interview);
    }

    public Interview cancel(Long interviewId, User recruiter) {
        Interview interview = getById(interviewId);
        assertRecruiterOwnsInterview(interview, recruiter);
        interview.setStatus(InterviewStatus.CANCELLED);
        return interviewRepository.save(interview);
    }

    public Interview submitFeedback(Long interviewId, User recruiter, FeedbackRequest req) {
        Interview interview = getById(interviewId);
        assertRecruiterOwnsInterview(interview, recruiter);
        interview.setFeedback(req.feedback());
        interview.setRating(req.rating());
        interview.setStatus(InterviewStatus.COMPLETED);
        return interviewRepository.save(interview);
    }

    public Page<Interview> recruiterInterviews(User recruiter, Pageable pageable) {
        return interviewRepository.findByApplication_Job_Recruiter(recruiter, pageable);
    }

    public Page<Interview> candidateInterviews(User candidate, Pageable pageable) {
        return interviewRepository.findByApplication_Candidate(candidate, pageable);
    }

    public List<Interview> forApplication(Long appId) {
        return interviewRepository.findByApplicationId(appId);
    }

    public Interview getById(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview not found"));
    }

    private Application getApplication(Long appId) {
        return applicationRepository.findById(appId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
    }

    private void assertRecruiterOwns(Application app, User recruiter) {
        if (!app.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private void assertRecruiterOwnsInterview(Interview interview, User recruiter) {
        assertRecruiterOwns(interview.getApplication(), recruiter);
    }
}
