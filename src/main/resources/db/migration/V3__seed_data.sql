-- =====================================================================
-- Date de test pentru aplicația de rezervări
-- Parola tuturor utilizatorilor de test: password
-- =====================================================================

-- Orașe din România
INSERT INTO orase_romania (nume, judet) VALUES
('Alba Iulia', 'Alba'),
('Arad', 'Arad'),
('Azuga', 'Prahova'),
('Bacău', 'Bacău'),
('Baia Mare', 'Maramureș'),
('Băile Felix', 'Bihor'),
('Băile Herculane', 'Caraș-Severin'),
('Botoșani', 'Botoșani'),
('Brașov', 'Brașov'),
('București', 'Ilfov'),
('Bușteni', 'Prahova'),
('Buzău', 'Buzău'),
('Cluj-Napoca', 'Cluj'),
('Constanța', 'Constanța'),
('Covasna', 'Covasna'),
('Craiova', 'Dolj'),
('Deva', 'Hunedoara'),
('Eforie Nord', 'Constanța'),
('Focșani', 'Vrancea'),
('Galați', 'Galați'),
('Iași', 'Iași'),
('Mamaia', 'Constanța'),
('Mangalia', 'Constanța'),
('Oradea', 'Bihor'),
('Piatra Neamț', 'Neamț'),
('Pitești', 'Argeș'),
('Ploiești', 'Prahova'),
('Predeal', 'Brașov'),
('Râmnicu Vâlcea', 'Vâlcea'),
('Satu Mare', 'Satu Mare'),
('Sibiu', 'Sibiu'),
('Sighișoara', 'Mureș'),
('Sinaia', 'Prahova'),
('Slănic Moldova', 'Bacău'),
('Sovata', 'Mureș'),
('Suceava', 'Suceava'),
('Târgu Mureș', 'Mureș'),
('Timișoara', 'Timiș'),
('Tulcea', 'Tulcea'),
('Vatra Dornei', 'Suceava');

-- =====================================================================
-- Utilizatori de test
-- Parola pentru toți: password
-- Hash BCrypt standard ($2a$10$...) pentru "password"
-- =====================================================================
INSERT IGNORE INTO utilizatori (nume, prenume, email, parola, telefon, rol, creat_la) VALUES
('Admin',      'Hotel',   'admin@hotel.ro', '$2a$10$ajKETFzsjL5G.4TiImaGAub/OGADsZu55XDaa78k.li003pQnqWfe', '0700000000', 'ADMIN',  NOW()),
('Ionescu',    'Radu',    'radu@test.ro',   '$2a$10$ajKETFzsjL5G.4TiImaGAub/OGADsZu55XDaa78k.li003pQnqWfe', '0721111111', 'CLIENT', NOW()),
('Popescu',    'Maria',   'maria@test.ro',  '$2a$10$ajKETFzsjL5G.4TiImaGAub/OGADsZu55XDaa78k.li003pQnqWfe', '0722222222', 'CLIENT', NOW()),
('Dumitrescu', 'Ion',     'ion@test.ro',    '$2a$10$ajKETFzsjL5G.4TiImaGAub/OGADsZu55XDaa78k.li003pQnqWfe', '0733333333', 'CLIENT', NOW());

-- =====================================================================
-- Proprietăți (ACTIVA = admin@hotel.ro, PENDING = maria@test.ro)
-- proprietar_id se calculează dinamic față de email
-- =====================================================================
INSERT INTO proprietati (nume, descriere, adresa, oras, tara, tip, stele, imagine_principala, proprietar_id, status_proprietate, creat_la) VALUES
('Hotel Central București',
 'Hotel de 4 stele în inima Bucureștiului, la 5 minute de Piața Universității. Camere moderne, restaurant, spa și parcare proprie.',
 'Calea Victoriei 150', 'București', 'România', 'HOTEL', 4,
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
 (SELECT id FROM utilizatori WHERE email = 'admin@hotel.ro'), 'ACTIVA', NOW()),

('Vila Montana Sinaia',
 'Vilă romantică la poalele munților Bucegi, cu vedere panoramică. Acces direct la pârtie, șemineu și terasă.',
 'Str. Peleșului 22', 'Sinaia', 'România', 'VILA', 3,
 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
 (SELECT id FROM utilizatori WHERE email = 'radu@test.ro'), 'ACTIVA', NOW()),

('Apartament Modern Cluj',
 'Apartament complet utilat în centrul Clujului, aproape de Piața Unirii. Ideal pentru city break sau sejur de afaceri.',
 'Str. Memorandumului 8', 'Cluj-Napoca', 'România', 'APARTAMENT', NULL,
 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
 (SELECT id FROM utilizatori WHERE email = 'radu@test.ro'), 'ACTIVA', NOW()),

('Hostel Vechi Brașov',
 'Hostel cu specific medieval în cetatea Brașovului. Atmosferă prietenoasă, locație centrală, preț accesibil.',
 'Str. Republicii 4', 'Brașov', 'România', 'HOSTEL', 2,
 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
 (SELECT id FROM utilizatori WHERE email = 'radu@test.ro'), 'ACTIVA', NOW()),

('Pensiune Transilvăneană Sibiu',
 'Pensiune tradițională cu arhitectură specifică Sibiului. Mic dejun inclus, grădină și parcare gratuită.',
 'Str. Ocnei 14', 'Sibiu', 'România', 'VILA', 2,
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
 (SELECT id FROM utilizatori WHERE email = 'maria@test.ro'), 'PENDING', NOW());

-- =====================================================================
-- Camere
-- =====================================================================

-- Hotel Central București (proprietate_id = 1)
INSERT INTO camere (proprietate_id, nume, descriere, tip, capacitate, pret_pe_noapte, disponibila) VALUES
(1, 'Single Standard',     'Cameră single cu pat matrimonial, TV și baie privată.',      'SINGLE', 1, 250.00, true),
(1, 'Double Deluxe',       'Cameră dublă spațioasă cu vedere la oraș și minibar.',        'DOUBLE', 2, 450.00, true),
(1, 'Suite Prezidențială', 'Suită de lux cu jacuzzi, salon și vedere panoramică.',        'SUITE',  2, 900.00, true);

-- Vila Montana Sinaia (proprietate_id = 2)
INSERT INTO camere (proprietate_id, nume, descriere, tip, capacitate, pret_pe_noapte, disponibila) VALUES
(2, 'Camera Muntilor',  'Cameră cu 2 paturi single și vedere la Bucegi.',     'TWIN',   2, 350.00, true),
(2, 'Camera Romantica', 'Pat king-size, semineu si terasa privata.',          'DOUBLE', 2, 550.00, true);

-- Apartament Modern Cluj (proprietate_id = 3)
INSERT INTO camere (proprietate_id, nume, descriere, tip, capacitate, pret_pe_noapte, disponibila) VALUES
(3, 'Apartament 2 camere', 'Living, dormitor, bucatarie complet utilata, Wi-Fi rapid.', 'DOUBLE', 3, 300.00, true);

-- Hostel Brașov (proprietate_id = 4)
INSERT INTO camere (proprietate_id, nume, descriere, tip, capacitate, pret_pe_noapte, disponibila) VALUES
(4, 'Pat Dormitor Mixt', 'Loc in dormitor comun de 6 persoane, dulap cu lacat.',   'SINGLE', 1,  80.00, true),
(4, 'Camera Privata',    'Camera privata pentru 2 persoane cu baie proprie.',      'DOUBLE', 2, 180.00, true);

-- =====================================================================
-- Rezervări de test
-- =====================================================================
INSERT INTO rezervari (utilizator_id, camera_id, data_check_in, data_check_out, nr_persoane, pret_total, status, creat_la) VALUES
((SELECT id FROM utilizatori WHERE email = 'ion@test.ro'),   2, '2026-05-10', '2026-05-13', 2, 1350.00, 'CONFIRMATA', NOW()),
((SELECT id FROM utilizatori WHERE email = 'maria@test.ro'), 5, '2026-05-20', '2026-05-23', 2, 1650.00, 'PENDING',    NOW()),
((SELECT id FROM utilizatori WHERE email = 'ion@test.ro'),   7, '2026-06-01', '2026-06-04', 3,  900.00, 'PENDING',    NOW());

-- =====================================================================
-- Recenzii (rating INT 1-5, conform CHECK constraint)
-- =====================================================================
INSERT INTO recenzii (utilizator_id, proprietate_id, rating, comentariu, creat_la) VALUES
((SELECT id FROM utilizatori WHERE email = 'ion@test.ro'),   1, 5, 'Hotel excelent, personal amabil si camere curate. Mic dejun bogat. Recomand cu caldura!', NOW()),
((SELECT id FROM utilizatori WHERE email = 'maria@test.ro'), 2, 5, 'Vila de vis cu vedere superba la munte. Am reveni oricand. Semineul a creat o atmosfera perfecta.', NOW());

INSERT INTO rating_detaliat (recenzie_id, curatenie, locatie, confort, personal, raport_calitate_pret)
SELECT id, 5, 5, 4, 5, 4 FROM recenzii WHERE comentariu LIKE 'Hotel excelent%';

INSERT INTO rating_detaliat (recenzie_id, curatenie, locatie, confort, personal, raport_calitate_pret)
SELECT id, 5, 4, 5, 5, 4 FROM recenzii WHERE comentariu LIKE 'Vila de vis%';
