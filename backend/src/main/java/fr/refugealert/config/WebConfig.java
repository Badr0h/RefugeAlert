package fr.refugealert.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final RefugeAlertProperties properties;

    public WebConfig(RefugeAlertProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = properties.cors().allowedOrigins().stream()
                .map(WebConfig::withoutTrailingSlash)
                .filter(origin -> !origin.isBlank())
                .distinct()
                .toArray(String[]::new);
        registry.addMapping("/api/**").allowedOrigins(origins).allowedMethods("GET", "POST", "OPTIONS");
    }

    static String withoutTrailingSlash(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("/+$", "");
    }
}
