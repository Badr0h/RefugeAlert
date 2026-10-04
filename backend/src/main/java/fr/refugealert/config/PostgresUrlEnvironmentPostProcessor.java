package fr.refugealert.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

public class PostgresUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String url = environment.getProperty("SPRING_DATASOURCE_URL");
        String jdbcUrl = toJdbcUrl(url);
        if (jdbcUrl == null || jdbcUrl.equals(url)) {
            return;
        }
        Map<String, Object> values = new HashMap<>();
        values.put("SPRING_DATASOURCE_URL", jdbcUrl);
        values.put("spring.datasource.url", jdbcUrl);
        environment.getPropertySources().addFirst(new MapPropertySource("render-postgres-url", values));
    }

    static String toJdbcUrl(String url) {
        if (url == null || url.isBlank()) {
            return url;
        }
        if (url.startsWith("postgres://")) {
            return "jdbc:postgresql://" + url.substring("postgres://".length());
        }
        if (url.startsWith("postgresql://")) {
            return "jdbc:postgresql://" + url.substring("postgresql://".length());
        }
        return url;
    }
}
