-- Adăugare coloană proprietar_id și status_proprietate în tabela proprietati
ALTER TABLE proprietati
    ADD COLUMN proprietar_id BIGINT NULL AFTER imagine_principala,
    ADD COLUMN status_proprietate ENUM('PENDING','ACTIVA','RESPINSA') NOT NULL DEFAULT 'ACTIVA' AFTER proprietar_id,
    ADD CONSTRAINT fk_proprietate_proprietar FOREIGN KEY (proprietar_id) REFERENCES utilizatori(id) ON DELETE SET NULL;

-- Tabel cu orașe din România
CREATE TABLE orase_romania (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    judet VARCHAR(100) NOT NULL
);
