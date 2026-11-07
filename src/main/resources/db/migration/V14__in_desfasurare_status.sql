-- Adauga statusul IN_DESFASURARE (check-in confirmat de client, sejur in curs)
ALTER TABLE rezervari
    MODIFY COLUMN status ENUM('PENDING','CONFIRMATA','IN_DESFASURARE','ANULATA','FINALIZATA')
    NOT NULL DEFAULT 'CONFIRMATA';
