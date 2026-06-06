package com.rms.controller;

import com.rms.domain.application.ApplicationRepository;
import com.rms.domain.job.JobRepository;
import com.rms.domain.job.JobStatus;
import com.rms.domain.offer.OfferRepository;
import com.rms.domain.user.User;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('RECRUITER')")
public class ReportController {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final OfferRepository offerRepository;

    public ReportController(JobRepository jobRepository,
                             ApplicationRepository applicationRepository,
                             OfferRepository offerRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.offerRepository = offerRepository;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary(@AuthenticationPrincipal User recruiter) {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("openJobs", jobRepository.countByRecruiterAndStatus(recruiter, JobStatus.OPEN));
        report.put("totalJobs", jobRepository.findByRecruiter(recruiter,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements());

        Map<String, Long> byStatus = new LinkedHashMap<>();
        applicationRepository.countByStatusForRecruiter(recruiter)
                .forEach(row -> byStatus.put(row[0].toString(), (Long) row[1]));
        report.put("applicationsByStatus", byStatus);

        long totalApplications = byStatus.values().stream().mapToLong(Long::longValue).sum();
        report.put("totalApplications", totalApplications);

        long hired = byStatus.getOrDefault("HIRED", 0L);
        long offersSent = byStatus.getOrDefault("OFFER_EXTENDED", 0L) + hired;
        report.put("offerConversionRate", totalApplications > 0
                ? Math.round((double) offersSent / totalApplications * 1000) / 10.0
                : 0.0);

        return report;
    }
}
