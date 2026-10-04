package fr.refugealert.scheduler;

import fr.refugealert.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DigestScheduler {

    private final NotificationService notificationService;

    public DigestScheduler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 0 7 * * *", zone = "Europe/Paris")
    public void daily() {
        notificationService.sendDailyDigests();
    }
}
