-- Create all remaining 98 opportunities from Excel file

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Cronofy B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Schouten Zekerheid Mak in Ass BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Zak. Dienstverlening',
  '2024-11-11',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Thema Timmerwerken' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Bouwnijver',
  '2015-02-13',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Tibben Tapijt en' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Detailhand',
  '2019-05-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Timmerfabriek Precisie 90' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Productie',
  '2022-12-19',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Arian Snijders' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Groothand',
  '2021-01-29',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Arian Snijders' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Groothandel',
  '2021-01-29',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'M Trompetter' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Zakelijke Dienstverlening',
  '2022-10-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Brink Eibergen B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Groothandel',
  '2022-11-19',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Avifit Beauty Equipment BV' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Avifit Beauty Equipment BV' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'BRN Parket B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'G.C. Lettinga' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2024-03-14',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'J.M. von Meijenfeldt-Boter' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2024-04-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'J.W. Scheffer' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2024-07-05',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'J.W. Scheffer' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2024-09-19',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'VvE Gezelstraat 3, 3A t/m 3D' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Zicht B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2025-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Dickhoff Installaties' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Cooperatieve Rabobank U.A.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Bouwnijverhei',
  '2017-11-22',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Dickhoff Installaties' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Cooperatieve Rabobank U.A.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Bouwnijver',
  '2018-06-21',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Resu Beheer B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Cooperatieve Rabobank U.A.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2018-03-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Bakker Wijnand Vof' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Cooperatieve Rabobank U.A.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Detailhand',
  '2022-01-26',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Bakker Wijnand Vof' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Cooperatieve Rabobank U.A.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Detailhandel',
  '2022-01-26',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Slagerij Boeve' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Cooperatieve Rabobank U.A.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Detailhandel',
  '2019-06-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Tolhuis ''n Tol' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Cooperatieve Rabobank U.A.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Horeca',
  '2019-10-11',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Kindernet Deventer B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Cooperatieve Rabobank U.A.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Pers. Dienstverlening',
  '2023-12-18',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'CC Nederland B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Klap B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Groothand',
  '2019-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'PIMM Solutions B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Klap B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Detailhand',
  '2023-12-13',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'GMB (Geraedts Metaal' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2013-11-19',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Bruins Betonstaalvlechtbedrijf' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Bouwnijverhei',
  '2019-11-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Van Seters Metaaltechniek' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2019-05-07',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Lasklus Nederland B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2016-10-12',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Maco Metaal B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2017-02-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Mulders Metaal op Maat' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2017-03-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Mulders Metaal op Maat' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2017-03-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Hauwlo Zonweringen' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2017-04-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Landman Siermetaal B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2017-09-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Landman Siermetaal B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2017-09-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Ruud van Laer las en montagewerk' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2017-09-04',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Duinhouwer BV' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2018-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'TVG Las- en Montagetechniek' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2018-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Konstruktiebedrijf W. Verweij' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2018-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'AL 13 Architectural Facades' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Bouwnijver',
  '2018-04-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Alutech Arnhem' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2018-04-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'KO-MA Holding B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2018-06-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'RS-Lastechniek' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2018-11-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'RS-Lastechniek' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2018-11-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Reparatiebedrijf H. Kelderman' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2018-10-17',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'M. van Es' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2019-03-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'M. van Es' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2019-03-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Duinhouwer Onroerend Goed BV' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2019-03-10',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'R. Schouten Beheer B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2019-05-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'VR Steel' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2019-12-16',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Winters Metaaltechniek' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2023-10-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Hofmeijer Las- en' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2020-06-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Timmerman Techniek Assen B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2020-05-11',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Elektim-Techniek B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2020-05-19',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Gelderland Hekwerken B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2020-08-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Stephan Borgers' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2021-05-31',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Gartech' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2020-11-15',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Amuko Service' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2020-10-13',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Amuko Service' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2020-10-13',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'SH Vastgoed BV' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2020-11-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Van der Kroon Metaal en' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2021-04-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'De Werelth' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2021-07-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'M.Oomen techniek' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2021-08-27',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'SLAGHUIS Veelzijdig in' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2022-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'SLAGHUIS Veelzijdig in' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2022-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'W. Verweij Beheer BV' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Metaalbewerki',
  '2022-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'RBSS Vastgoed B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Persoonlijke Dienstverlening',
  '2022-03-11',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Vermeulen Ingenieursbureau B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Conversie',
  '2022-07-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Vermeulen Ingenieursbureau B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Conversie',
  '2022-07-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Cristel vd sanden Interieur' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Detailhand',
  '2022-07-22',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'AanZet Staal-Bouw-Techniek B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Bouwnijver',
  '2022-11-08',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'AanZet Holding B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Bouwnijverhei',
  '2022-11-10',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'GB Hoogwerkers B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Groothand',
  '2022-11-17',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'S. van Bergeijk Heftruck VOF' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Retsok Norg BV' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Spin Pompen BV' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Bakker Protech' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Bakker Protech' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Conversie',
  '2023-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Wildenborg Haardendesign B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Bouwnijverhei',
  '2022-12-15',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'DKM Tec' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2023-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Hinneman Engineering B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2023-05-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Lift Products' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Zakelijke Dienstverlening',
  '2023-07-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'R. Schouten Beheer BV' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2023-12-07',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Joosten Metaal' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Mevas BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Metaalbew.',
  '2024-04-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Elbouw G/E Kombinatie BV' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Aon (v.h.Meeus)' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Inventaris/Goederen Bouwnijver',
  '2023-02-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'G. Leijten' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Meijers Assurantien' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Bouwnijverhei',
  '2022-07-22',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'R Leijten' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Meijers Assurantien' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Bouwnijverhei',
  '2022-07-22',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'R Leijten' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Meijers Assurantien' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Albrecht Bouwman'),
  'Bedrijfsgebouwen Bouwnijverhei',
  '2022-07-22',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Coach 27' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'HDB Risicobeheer BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Alex Salden'),
  'Inventaris/Goederen Pers. Dienstverlening',
  '2024-05-31',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Jeanneke Bosch Vakantie' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'HDB Risicobeheer BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Alex Salden'),
  'Bedrijfsgebouwen Horeca',
  '2020-11-18',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Fidatrade BV' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Wonen & Welzijn Assurantien BV' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Alex Salden'),
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2024-11-14',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Bercx Klimaattechniek' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Van den Berk Assurantien B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Alex Salden'),
  'Inventaris/Goederen Bouwnijver',
  '2020-10-14',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Het Gouden Woud B.V.' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Van den Berk Assurantien B.V.' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Alex Salden'),
  'Bedrijfsgebouwen Horeca',
  '2023-01-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'Van den Broek Hoveniersbedrijf' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Leenders & Gielen Assurantien' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Alex Salden'),
  'Bedrijfsgebouwen Bouwnijverhei',
  '2017-05-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'G.F.J. Pijnenburg' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Leenders & Gielen Assurantien' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Alex Salden'),
  'Bedrijfsgebouwen Bouwnijverhei',
  '2018-02-01',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'LTW Leenders en HGJ Gielen' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Leenders & Gielen Assurantien' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Alex Salden'),
  'Bedrijfsgebouwen Zakelijke Dienstverlening',
  '2018-01-05',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

INSERT INTO degoudse.opportunities (
  title, client_id, product_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
) VALUES (
  'Zonnepanelen',
  (SELECT id FROM degoudse.customers WHERE name = 'P.J.G. Peeters' LIMIT 1),
  1,
  (SELECT id FROM degoudse.customers WHERE name = 'Leenders & Gielen Assurantien' LIMIT 1),
  (SELECT id FROM degoudse.users WHERE name = 'Alex Salden'),
  'Bedrijfsgebouwen Verhuur onroerend goed',
  '2018-07-28',
  'Active',
  'Prospecting',
  'New Business',
  75,
  50000,
  NOW(),
  NOW()
);

