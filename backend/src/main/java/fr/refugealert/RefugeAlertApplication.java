package fr.refugealert;

import fr.refugealert.config.RefugeAlertProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(RefugeAlertProperties.class)
public class RefugeAlertApplication {

    public static void main(String[] args) {
        SpringApplication.run(RefugeAlertApplication.class, args);
    }
}
