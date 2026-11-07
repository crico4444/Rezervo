package com.licenta.rezervari.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/proprietati/ale-mele").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/proprietati/pending").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/proprietati/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/camere/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/recenzii/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/recenzii-proprietari/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orase/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/evenimente/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/imagini/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/imagini-camere/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/imagini-camere").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/imagini-camere/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/proprietati").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/proprietati/*/ale-mele").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/proprietati/*/ale-mele").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/proprietati/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/proprietati/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/camere/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/camere/**").authenticated()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
