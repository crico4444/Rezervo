-- Adauga campuri specifice apartamentelor direct pe proprietate
ALTER TABLE proprietati
  ADD COLUMN nr_camere INT NULL,
  ADD COLUMN capacitate INT NULL,
  ADD COLUMN pret_pe_noapte DECIMAL(10,2) NULL;

-- Copiaza datele din camere in proprietati pentru apartamente existente
UPDATE proprietati p
JOIN (
  SELECT proprietate_id,
         SUM(1) AS nr,
         MAX(capacitate) AS cap,
         MIN(pret_pe_noapte) AS pret
  FROM camere
  GROUP BY proprietate_id
) c ON p.id = c.proprietate_id
SET p.nr_camere   = 1,
    p.capacitate  = c.cap,
    p.pret_pe_noapte = c.pret
WHERE p.tip = 'APARTAMENT';

-- Pastreaza o singura camera virtuala per apartament (pentru sistemul de rezervari)
-- Sterge camerele extra (pastreaza doar cea cu id minim per apartament)
DELETE FROM camere
WHERE proprietate_id IN (SELECT id FROM proprietati WHERE tip = 'APARTAMENT')
  AND id NOT IN (
    SELECT min_id FROM (
      SELECT MIN(id) AS min_id
      FROM camere
      WHERE proprietate_id IN (SELECT id FROM proprietati WHERE tip = 'APARTAMENT')
      GROUP BY proprietate_id
    ) t
  );

-- Actualizeaza camera virtuala cu datele corecte ale apartamentului
UPDATE camere c
JOIN proprietati p ON c.proprietate_id = p.id
SET c.pret_pe_noapte = p.pret_pe_noapte,
    c.capacitate     = p.capacitate,
    c.disponibila    = TRUE
WHERE p.tip = 'APARTAMENT';
