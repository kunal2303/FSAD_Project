package com.rms.controller;

import com.rms.domain.offer.Offer;
import com.rms.domain.user.User;
import com.rms.service.OfferService;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping("/applications/{appId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Offer> create(@PathVariable Long appId,
                                         @AuthenticationPrincipal User user,
                                         @RequestBody OfferService.OfferRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(offerService.create(appId, user, req));
    }

    @PatchMapping("/{id}/send")
    @PreAuthorize("hasRole('RECRUITER')")
    public Offer send(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return offerService.send(id, user);
    }

    @PatchMapping("/{id}/revoke")
    @PreAuthorize("hasRole('RECRUITER')")
    public Offer revoke(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return offerService.revoke(id, user);
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public Page<Offer> recruiterOffers(@AuthenticationPrincipal User user,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        return offerService.recruiterOffers(user, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('CANDIDATE')")
    public Offer accept(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return offerService.accept(id, user);
    }

    @PatchMapping("/{id}/decline")
    @PreAuthorize("hasRole('CANDIDATE')")
    public Offer decline(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return offerService.decline(id, user);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public Page<Offer> myOffers(@AuthenticationPrincipal User user,
                                 @RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "20") int size) {
        return offerService.candidateOffers(user, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }
}
