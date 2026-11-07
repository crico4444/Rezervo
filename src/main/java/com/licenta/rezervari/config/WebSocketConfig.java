package com.licenta.rezervari.config;

import com.licenta.rezervari.security.WebSocketAuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Broker pentru destinatii user-specific (/user/...) si topic-uri globale (/topic/...)
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix pentru mesajele trimise de client catre server
        config.setApplicationDestinationPrefixes("/app");
        // Prefix pentru destinatii user-specific
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint WebSocket nativ (fara SockJS) — clientul se conecteaza la ws://localhost:8080/ws
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Interceptor care valideaza JWT-ul din headerul CONNECT
        registration.interceptors(webSocketAuthInterceptor);
    }
}
