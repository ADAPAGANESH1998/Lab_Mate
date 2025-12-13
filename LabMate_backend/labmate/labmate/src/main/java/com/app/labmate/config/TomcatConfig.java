package com.app.labmate.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatConfig implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        factory.addConnectorCustomizers(connector -> {
            // Allow colon and a few other characters in path and query to avoid 403 for DOIs in path
            // These values are passed to Tomcat's relaxedPathChars and relaxedQueryChars
            connector.setProperty("relaxedPathChars", ":[]{}|\\`^\"<>");
            connector.setProperty("relaxedQueryChars", ":[]{}|\\`^\"<>");
        });
    }
}

