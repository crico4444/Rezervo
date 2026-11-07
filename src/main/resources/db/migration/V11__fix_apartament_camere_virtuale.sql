-- Creeaza camera virtuala pentru apartamentele care nu au nicio camera
INSERT INTO camere (proprietate_id, nume, descriere, tip, capacitate, pret_pe_noapte, disponibila)
SELECT p.id,
       'Virtual',
       '',
       'DOUBLE',
       COALESCE(p.capacitate, 3),
       COALESCE(p.pret_pe_noapte, 0.00),
       1
FROM proprietati p
WHERE p.tip = 'APARTAMENT'
  AND NOT EXISTS (SELECT 1 FROM camere c WHERE c.proprietate_id = p.id);

-- Sincronizeaza capacitatea si pretul camerelor virtuale cu datele din proprietate
UPDATE camere c
JOIN proprietati p ON c.proprietate_id = p.id
SET c.capacitate     = COALESCE(p.capacitate, GREATEST(c.capacitate, 3)),
    c.pret_pe_noapte = COALESCE(p.pret_pe_noapte, c.pret_pe_noapte),
    c.disponibila    = 1
WHERE p.tip = 'APARTAMENT';
