CREATE TABLE evenimente (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    nume       VARCHAR(200) NOT NULL,
    descriere  TEXT,
    oras       VARCHAR(100) NOT NULL,
    latitudine  DECIMAL(10, 7) NOT NULL,
    longitudine DECIMAL(10, 7) NOT NULL,
    data_start DATE NOT NULL,
    data_end   DATE NOT NULL,
    ora        TIME,
    imagine    VARCHAR(500),
    link_bilete VARCHAR(500),
    categorie  ENUM('CONCERT','FESTIVAL','SPORT','CULTURAL','ALTELE') NOT NULL DEFAULT 'CONCERT',
    creat_la   DATETIME DEFAULT CURRENT_TIMESTAMP
);
