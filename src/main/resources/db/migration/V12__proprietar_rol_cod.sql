-- Extinde enum-ul rol cu valoarea PROPRIETAR
ALTER TABLE utilizatori
    MODIFY COLUMN rol ENUM('CLIENT', 'ADMIN', 'PROPRIETAR') DEFAULT 'CLIENT';

-- Adauga coloanele pentru verificarea codului de upgrade la PROPRIETAR
ALTER TABLE utilizatori
    ADD COLUMN cod_verificare VARCHAR(6) NULL,
    ADD COLUMN cod_expira DATETIME NULL;
