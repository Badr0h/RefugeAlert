package fr.refugealert.scheduler;

import fr.refugealert.service.AvailabilitySyncService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AvailabilityScheduler {

    private final AvailabilitySyncService availabilitySyncService;

    public AvailabilityScheduler(AvailabilitySyncService availabilitySyncService) {
        this.availabilitySyncService = availabilitySyncService;
    }

    @Scheduled(
            fixedDelayString = "${refugealert.sync.delay-ms:900000}",
            initialDelayString = "${refugealert.sync.initial-delay-ms:20000}")
    public void tick() {
        availabilitySyncService.syncAll();
    }
}
