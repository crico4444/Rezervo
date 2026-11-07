CREATE TABLE notificari (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilizator_id BIGINT       NOT NULL,
    titlu         VARCHAR(200) NOT NULL,
    continut      VARCHAR(500) NOT NULL,
    citita        BOOLEAN      NOT NULL DEFAULT FALSE,
    creat_la      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificare_utilizator FOREIGN KEY (utilizator_id) REFERENCES utilizatori(id) ON DELETE CASCADE
);

CREATE INDEX idx_notificari_utilizator ON notificari(utilizator_id, citita);
