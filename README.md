# Rezervo – Hotel & Accommodation Reservation Platform

Full-stack web application for searching and booking accommodation, inspired by Booking.com. Built as a Bachelor's thesis project (Computer Science, Petroleum-Gas University of Ploiești).

> **Note:** this project was developed with the assistance of AI tools.

## Features

- User registration and login with JWT authentication, plus email verification
- Browse and view accommodation properties and their rooms
- Booking flow: make reservations and view your own bookings
- Property owners can add and manage their own listings
- Reviews and detailed ratings for properties
- Events section with accommodation suggestions for each event
- Real-time chat between users (WebSocket) and in-app notifications
- Admin dashboard for managing users, properties, rooms and events

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, TypeScript, Vite |
| Backend | Java, Spring Boot, Spring Security (JWT), Spring Data JPA, WebSocket |
| Database | MySQL, Flyway migrations |
| Build tools | Maven, npm |

## Project structure

```
frontend/   React + TypeScript client
src/        Spring Boot backend (controllers, services, repositories, security)
src/main/resources/db/migration/   Flyway SQL migrations (schema + demo data)
```

## Running locally

**Prerequisites:** Java, Node.js, and a running MySQL server (for example through WAMP).

1. **Create the database**
   ```sql
   CREATE DATABASE rezervari_db;
   ```
2. **Configure the backend**
   - Copy `src/main/resources/application-example.properties` to `src/main/resources/application.properties`.
   - Fill in your own values: the database password (empty by default in WAMP), a random `jwt.secret`, and the Gmail address plus app password used for sending emails.
3. **Start the backend** (from the project root)
   ```bash
   ./mvnw spring-boot:run
   ```
   Flyway creates the tables and loads demo data automatically on first start. The API runs on `http://localhost:8080`.
4. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Then open the address shown in the terminal (usually `http://localhost:5173`).

## Demo data

The migrations include a few demo accounts (see `V3__seed_data.sql`). They are for local testing only; change their passwords before putting the app online.

## Author

Radu Cristian Nicolae – [LinkedIn](https://www.linkedin.com/in/radu-cristian-2b8685448)