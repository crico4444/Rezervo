CREATE TABLE IF NOT EXISTS mesaje (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    rezervare_id BIGINT    NOT NULL,
    expeditor_id BIGINT    NOT NULL,
    continut     TEXT      NOT NULL,
    citit        BOOLEAN   NOT NULL DEFAULT FALSE,
    creat_la     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rezervare_id) REFERENCES rezervari(id) ON DELETE CASCADE,
    FOREIGN KEY (expeditor_id) REFERENCES utilizatori(id) ON DELETE CASCADE
);
