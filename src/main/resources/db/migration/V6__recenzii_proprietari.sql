CREATE TABLE IF NOT EXISTS recenzii_proprietari (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilizator_id BIGINT NOT NULL,
    proprietar_id BIGINT NOT NULL,
    rating        INT NOT NULL,
    comentariu    TEXT,
    creat_la      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilizator_id) REFERENCES utilizatori(id) ON DELETE CASCADE,
    FOREIGN KEY (proprietar_id) REFERENCES utilizatori(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_proprietar (utilizator_id, proprietar_id)
);
