ALTER TABLE proprietati
    MODIFY COLUMN latitudine  DOUBLE NULL,
    MODIFY COLUMN longitudine DOUBLE NULL;

ALTER TABLE evenimente
    MODIFY COLUMN latitudine  DOUBLE NOT NULL,
    MODIFY COLUMN longitudine DOUBLE NOT NULL;
