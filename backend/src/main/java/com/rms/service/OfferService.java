package com.rms.service;

import com.rms.domain.application.Application;
import com.rms.domain.application.ApplicationRepository;
import com.rms.domain.application.ApplicationStatus;
import com.rms.domain.offer.*;
import com.rms.domain.user.User;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@Transactional
public class OfferService {

    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;

    public OfferService(OfferRepository offerRepository,
                        ApplicationRepository applicationRepository) {
        this.offerRepository = offerRepository;
        this.applicationRepository = applicationRepository;
    }

    public record OfferRequest(BigDecimal salary, LocalDate startDate, LocalDate expiresAt, String notes) {}

    public Offer create(Long appId, User recruiter, OfferRequest req) {
        Application app = getApplication(appId);
        assertRecruiterOwns(app, recruiter);
        if (offerRepository.findByApplication_Id(appId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An offer already exists for this application");
        }
        Offer offer = Offer.builder()
                .application(app)
                .salary(req.salary())
                .startDate(req.startDate())
                .expiresAt(req.expiresAt())
                .notes(req.notes())
                .build();
        return offerRepository.save(offer);
    }

    public Offer send(Long offerId, User recruiter) {
        Offer offer = getById(offerId);
        assertRecruiterOwnsOffer(offer, recruiter);
        offer.setStatus(OfferStatus.SENT);
        Application app = offer.getApplication();
        app.setStatus(ApplicationStatus.OFFER_EXTENDED);
        applicationRepository.save(app);
        return offerRepository.save(offer);
    }

    public Offer revoke(Long offerId, User recruiter) {
        Offer offer = getById(offerId);
        assertRecruiterOwnsOffer(offer, recruiter);
        offer.setStatus(OfferStatus.REVOKED);
        return offerRepository.save(offer);
    }

    public Offer accept(Long offerId, User candidate) {
        Offer offer = getById(offerId);
        assertCandidateOwns(offer, candidate);
        if (offer.getStatus() != OfferStatus.SENT) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Offer is not in SENT state");
        }
        offer.setStatus(OfferStatus.ACCEPTED);
        Application app = offer.getApplication();
        app.setStatus(ApplicationStatus.HIRED);
        applicationRepository.save(app);
        return offerRepository.save(offer);
    }

    public Offer decline(Long offerId, User candidate) {
        Offer offer = getById(offerId);
        assertCandidateOwns(offer, candidate);
        offer.setStatus(OfferStatus.DECLINED);
        return offerRepository.save(offer);
    }

    public Page<Offer> recruiterOffers(User recruiter, Pageable pageable) {
        return offerRepository.findByApplication_Job_Recruiter(recruiter, pageable);
    }

    public Page<Offer> candidateOffers(User candidate, Pageable pageable) {
        return offerRepository.findByApplication_Candidate(candidate, pageable);
    }

    public Offer getById(Long id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));
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

    private void assertRecruiterOwnsOffer(Offer offer, User recruiter) {
        assertRecruiterOwns(offer.getApplication(), recruiter);
    }

    private void assertCandidateOwns(Offer offer, User candidate) {
        if (!offer.getApplication().getCandidate().getId().equals(candidate.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }
}
