package com.licenta.rezervari.security;

import com.licenta.rezervari.repository.UtilizatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UtilizatorRepository utilizatorRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul cu email-ul " + email + " nu a fost găsit"));
    }
}
