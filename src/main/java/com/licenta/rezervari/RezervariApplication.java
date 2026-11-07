package com.licenta.rezervari;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RezervariApplication {

	public static void main(String[] args) {
		SpringApplication.run(RezervariApplication.class, args);
	}

}
