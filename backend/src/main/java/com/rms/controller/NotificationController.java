package com.rms.controller;

import com.rms.domain.notification.Notification;
import com.rms.domain.notification.NotificationRepository;
import com.rms.domain.user.User;
import org.springframework.data.domain.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Transactional
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public Page<Notification> list(@AuthenticationPrincipal User user,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        return notificationRepository.findByUser(user,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal User user) {
        return Map.of("count", notificationRepository.countByUserAndRead(user, false));
    }

    @PatchMapping("/mark-all-read")
    public void markAllRead(@AuthenticationPrincipal User user) {
        notificationRepository.markAllRead(user);
    }
}
