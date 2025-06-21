-- Import data from Excel file
-- Processing 103 opportunities

-- Create account manager users
INSERT INTO degoudse.users (username, name, email, created_at, updated_at) VALUES ('albrecht.bouwman', 'Albrecht Bouwman', 'albrecht.bouwman@degoudse.nl', NOW(), NOW()) ON CONFLICT (username) DO NOTHING;
INSERT INTO degoudse.users (username, name, email, created_at, updated_at) VALUES ('alex.salden', 'Alex Salden', 'alex.salden@degoudse.nl', NOW(), NOW()) ON CONFLICT (username) DO NOTHING;

-- Create customer entities
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('RGO Makelaars B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Tex-Mex Streetfood', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Vishandel sperling', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('TOPHOLD International B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Cronofy B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Thema Timmerwerken', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Tibben Tapijt en', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Timmerfabriek Precisie 90', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Arian Snijders', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('M Trompetter', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Brink Eibergen B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Avifit Beauty Equipment BV', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('BRN Parket B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('G.C. Lettinga', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('J.M. von Meijenfeldt-Boter', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('J.W. Scheffer', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('VvE Gezelstraat 3, 3A t/m 3D', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Dickhoff Installaties', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Resu Beheer B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Bakker Wijnand Vof', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Slagerij Boeve', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Tolhuis ''n Tol', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Kindernet Deventer B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('CC Nederland B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('PIMM Solutions B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('GMB (Geraedts Metaal', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Bruins Betonstaalvlechtbedrijf', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Van Seters Metaaltechniek', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Lasklus Nederland B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Maco Metaal B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Mulders Metaal op Maat', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Hauwlo Zonweringen', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Landman Siermetaal B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Ruud van Laer las en montagewerk', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Duinhouwer BV', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('TVG Las- en Montagetechniek', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Konstruktiebedrijf W. Verweij', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('AL 13 Architectural Facades', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Alutech Arnhem', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('KO-MA Holding B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('RS-Lastechniek', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Reparatiebedrijf H. Kelderman', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('M. van Es', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Duinhouwer Onroerend Goed BV', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('R. Schouten Beheer B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('VR Steel', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Winters Metaaltechniek', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Hofmeijer Las- en', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Timmerman Techniek Assen B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Elektim-Techniek B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Gelderland Hekwerken B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Stephan Borgers', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Gartech', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Amuko Service', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('SH Vastgoed BV', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Van der Kroon Metaal en', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('De Werelth', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('M.Oomen techniek', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('SLAGHUIS Veelzijdig in', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('W. Verweij Beheer BV', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('RBSS Vastgoed B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Vermeulen Ingenieursbureau B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Cristel vd sanden Interieur', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('AanZet Staal-Bouw-Techniek B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('AanZet Holding B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('GB Hoogwerkers B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('S. van Bergeijk Heftruck VOF', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Retsok Norg BV', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Spin Pompen BV', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Bakker Protech', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Wildenborg Haardendesign B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('DKM Tec', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Hinneman Engineering B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Lift Products', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('R. Schouten Beheer BV', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Joosten Metaal', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Elbouw G/E Kombinatie BV', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('G. Leijten', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('R Leijten', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Coach 27', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Jeanneke Bosch Vakantie', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Fidatrade BV', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Bercx Klimaattechniek', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Het Gouden Woud B.V.', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Van den Broek Hoveniersbedrijf', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('G.F.J. Pijnenburg', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('LTW Leenders en HGJ Gielen', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('P.J.G. Peeters', 'Business', 'Various', 'Medium', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;

-- Create partner entities
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Schouten Zekerheid Mak in Ass BV', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Zicht B.V.', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Cooperatieve Rabobank U.A.', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Klap B.V.', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Mevas BV', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Aon (v.h.Meeus)', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Meijers Assurantien', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('HDB Risicobeheer BV', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Wonen & Welzijn Assurantien BV', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Van den Berk Assurantien B.V.', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at) VALUES ('Leenders & Gielen Assurantien', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;

-- Create opportunities with relationships
INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Zak. Dienstverlening',
  '2019-03-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'RGO Makelaars B.V.'
  AND p.name = 'Schouten Zekerheid Mak in Ass BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Horeca',
  '2020-09-25',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Tex-Mex Streetfood'
  AND p.name = 'Schouten Zekerheid Mak in Ass BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Groothand',
  '2021-07-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Vishandel sperling'
  AND p.name = 'Schouten Zekerheid Mak in Ass BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Groothandel',
  '2021-07-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Vishandel sperling'
  AND p.name = 'Schouten Zekerheid Mak in Ass BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Zakelijke Dienstverlening',
  '2023-09-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'TOPHOLD International B.V.'
  AND p.name = 'Schouten Zekerheid Mak in Ass BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Zak. Dienstverlening',
  '2024-11-11',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Cronofy B.V.'
  AND p.name = 'Schouten Zekerheid Mak in Ass BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Bouwnijver',
  '2015-02-13',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Thema Timmerwerken'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Detailhand',
  '2019-05-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Tibben Tapijt en'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Productie',
  '2022-12-19',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Timmerfabriek Precisie 90'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Groothand',
  '2021-01-29',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Arian Snijders'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Groothandel',
  '2021-01-29',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Arian Snijders'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Zakelijke Dienstverlening',
  '2022-10-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'M Trompetter'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Groothandel',
  '2022-11-19',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Brink Eibergen B.V.'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Avifit Beauty Equipment BV'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Avifit Beauty Equipment BV'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'BRN Parket B.V.'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2024-03-14',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'G.C. Lettinga'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2024-04-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'J.M. von Meijenfeldt-Boter'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2024-07-05',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'J.W. Scheffer'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2024-09-19',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'J.W. Scheffer'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2025-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'VvE Gezelstraat 3, 3A t/m 3D'
  AND p.name = 'Zicht B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Bouwnijverhei',
  '2017-11-22',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Dickhoff Installaties'
  AND p.name = 'Cooperatieve Rabobank U.A.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Bouwnijver',
  '2018-06-21',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Dickhoff Installaties'
  AND p.name = 'Cooperatieve Rabobank U.A.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2018-03-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Resu Beheer B.V.'
  AND p.name = 'Cooperatieve Rabobank U.A.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Detailhand',
  '2022-01-26',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Bakker Wijnand Vof'
  AND p.name = 'Cooperatieve Rabobank U.A.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Detailhandel',
  '2022-01-26',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Bakker Wijnand Vof'
  AND p.name = 'Cooperatieve Rabobank U.A.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Detailhandel',
  '2019-06-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Slagerij Boeve'
  AND p.name = 'Cooperatieve Rabobank U.A.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Horeca',
  '2019-10-11',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Tolhuis ''n Tol'
  AND p.name = 'Cooperatieve Rabobank U.A.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Pers. Dienstverlening',
  '2023-12-18',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Kindernet Deventer B.V.'
  AND p.name = 'Cooperatieve Rabobank U.A.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Groothand',
  '2019-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'CC Nederland B.V.'
  AND p.name = 'Klap B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Detailhand',
  '2023-12-13',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'PIMM Solutions B.V.'
  AND p.name = 'Klap B.V.'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2013-11-19',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'GMB (Geraedts Metaal'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Bouwnijverhei',
  '2019-11-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Bruins Betonstaalvlechtbedrijf'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2019-05-07',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Van Seters Metaaltechniek'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2016-10-12',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Lasklus Nederland B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2017-02-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Maco Metaal B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2017-03-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Mulders Metaal op Maat'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2017-03-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Mulders Metaal op Maat'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2017-04-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Hauwlo Zonweringen'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2017-09-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Landman Siermetaal B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2017-09-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Landman Siermetaal B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2017-09-04',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Ruud van Laer las en montagewerk'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2018-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Duinhouwer BV'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2018-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'TVG Las- en Montagetechniek'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2018-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Konstruktiebedrijf W. Verweij'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Bouwnijver',
  '2018-04-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'AL 13 Architectural Facades'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2018-04-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Alutech Arnhem'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2018-06-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'KO-MA Holding B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2018-11-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'RS-Lastechniek'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2018-11-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'RS-Lastechniek'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2018-10-17',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Reparatiebedrijf H. Kelderman'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2019-03-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'M. van Es'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2019-03-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'M. van Es'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2019-03-10',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Duinhouwer Onroerend Goed BV'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2019-05-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'R. Schouten Beheer B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2019-12-16',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'VR Steel'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2023-10-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Winters Metaaltechniek'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2020-06-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Hofmeijer Las- en'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2020-05-11',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Timmerman Techniek Assen B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2020-05-19',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Elektim-Techniek B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2020-08-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Gelderland Hekwerken B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2021-05-31',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Stephan Borgers'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2020-11-15',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Gartech'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2020-10-13',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Amuko Service'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2020-10-13',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Amuko Service'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2020-11-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'SH Vastgoed BV'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2021-04-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Van der Kroon Metaal en'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2021-07-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'De Werelth'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2021-08-27',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'M.Oomen techniek'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2022-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'SLAGHUIS Veelzijdig in'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2022-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'SLAGHUIS Veelzijdig in'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Metaalbewerki',
  '2022-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'W. Verweij Beheer BV'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Persoonlijke Dienstverlening',
  '2022-03-11',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'RBSS Vastgoed B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Conversie',
  '2022-07-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Vermeulen Ingenieursbureau B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Conversie',
  '2022-07-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Vermeulen Ingenieursbureau B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Detailhand',
  '2022-07-22',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Cristel vd sanden Interieur'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Bouwnijver',
  '2022-11-08',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'AanZet Staal-Bouw-Techniek B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Bouwnijverhei',
  '2022-11-10',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'AanZet Holding B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Groothand',
  '2022-11-17',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'GB Hoogwerkers B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'S. van Bergeijk Heftruck VOF'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Retsok Norg BV'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Spin Pompen BV'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Bakker Protech'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Bakker Protech'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Bouwnijverhei',
  '2022-12-15',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Wildenborg Haardendesign B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2023-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'DKM Tec'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2023-05-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Hinneman Engineering B.V.'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Zakelijke Dienstverlening',
  '2023-07-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Lift Products'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2023-12-07',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'R. Schouten Beheer BV'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Metaalbew.',
  '2024-04-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Joosten Metaal'
  AND p.name = 'Mevas BV'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Bouwnijver',
  '2023-02-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Elbouw G/E Kombinatie BV'
  AND p.name = 'Aon (v.h.Meeus)'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Bouwnijverhei',
  '2022-07-22',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'G. Leijten'
  AND p.name = 'Meijers Assurantien'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Bouwnijverhei',
  '2022-07-22',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'R Leijten'
  AND p.name = 'Meijers Assurantien'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Bouwnijverhei',
  '2022-07-22',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'R Leijten'
  AND p.name = 'Meijers Assurantien'
  AND u.username = 'albrecht.bouwman';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Pers. Dienstverlening',
  '2024-05-31',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Coach 27'
  AND p.name = 'HDB Risicobeheer BV'
  AND u.username = 'alex.salden';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Horeca',
  '2020-11-18',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Jeanneke Bosch Vakantie'
  AND p.name = 'HDB Risicobeheer BV'
  AND u.username = 'alex.salden';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2024-11-14',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Fidatrade BV'
  AND p.name = 'Wonen & Welzijn Assurantien BV'
  AND u.username = 'alex.salden';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Inventaris/Goederen Bouwnijver',
  '2020-10-14',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Bercx Klimaattechniek'
  AND p.name = 'Van den Berk Assurantien B.V.'
  AND u.username = 'alex.salden';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Horeca',
  '2023-01-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Het Gouden Woud B.V.'
  AND p.name = 'Van den Berk Assurantien B.V.'
  AND u.username = 'alex.salden';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Bouwnijverhei',
  '2017-05-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'Van den Broek Hoveniersbedrijf'
  AND p.name = 'Leenders & Gielen Assurantien'
  AND u.username = 'alex.salden';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Bouwnijverhei',
  '2018-02-01',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'G.F.J. Pijnenburg'
  AND p.name = 'Leenders & Gielen Assurantien'
  AND u.username = 'alex.salden';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Zakelijke Dienstverlening',
  '2018-01-05',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'LTW Leenders en HGJ Gielen'
  AND p.name = 'Leenders & Gielen Assurantien'
  AND u.username = 'alex.salden';

INSERT INTO degoudse.opportunities (title, client_id, partner_id, account_manager_id, insurance_description, start_date, status, stage, type, probability, estimated_value, created_at, updated_at) 
SELECT 
  'Zonnepanelen',
  c.id,
  p.id,
  u.id,
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2018-07-28',
  'Active',
  'Prospecting', 
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
FROM degoudse.customers c
CROSS JOIN degoudse.customers p
CROSS JOIN degoudse.users u
WHERE c.name = 'P.J.G. Peeters'
  AND p.name = 'Leenders & Gielen Assurantien'
  AND u.username = 'alex.salden';

