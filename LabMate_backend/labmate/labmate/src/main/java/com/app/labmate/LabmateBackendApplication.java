	package com.app.labmate;

	import org.springframework.boot.SpringApplication;
	import org.springframework.boot.autoconfigure.SpringBootApplication;
	import org.springframework.web.bind.annotation.CrossOrigin;

	@SpringBootApplication
	@CrossOrigin(value = "http://localhost:4200") // Corrected URL
	public class LabmateBackendApplication {

		public static void main(String[] args) {
			SpringApplication.run(LabmateBackendApplication.class, args);
		}

	}
