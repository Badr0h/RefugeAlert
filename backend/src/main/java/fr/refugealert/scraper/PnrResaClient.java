package fr.refugealert.scraper;

import fr.refugealert.config.RefugeAlertProperties;
import java.time.LocalDate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class PnrResaClient {

    private final RestClient restClient;
    private final String userAgent;

    public PnrResaClient(RefugeAlertProperties properties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(properties.pnr().timeout());
        factory.setReadTimeout(properties.pnr().timeout());
        this.restClient = RestClient.builder()
                .baseUrl(properties.pnr().baseUrl())
                .requestFactory(factory)
                .build();
        this.userAgent = properties.pnr().userAgent();
    }

    public String fetchHtml(LocalDate start, LocalDate end) {
        try {
            return request(start, end);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().is5xxServerError()) {
                return request(start, end);
            }
            throw ex;
        } catch (ResourceAccessException ex) {
            return request(start, end);
        }
    }

    private String request(LocalDate start, LocalDate end) {
        return restClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/stock.php")
                        .queryParam("date_debut", start.toString())
                        .queryParam("date_fin", end.toString())
                        .build())
                .header(HttpHeaders.USER_AGENT, userAgent)
                .retrieve()
                .body(String.class);
    }
}
