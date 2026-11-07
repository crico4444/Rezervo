-- Seteaza rolul PROPRIETAR pentru toti utilizatorii CLIENT
-- care au cel putin o proprietate listata in sistem.
-- Utilizatorii cu rol ADMIN raman neatinsi.
UPDATE utilizatori u
SET u.rol = 'PROPRIETAR'
WHERE u.rol = 'CLIENT'
  AND EXISTS (
      SELECT 1 FROM proprietati p WHERE p.proprietar_id = u.id
  );
