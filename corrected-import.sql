-- Import data from Excel file with correct schema
-- Processing 103 opportunities

-- Create account manager users
INSERT INTO degoudse.users (name, email, created_at, updated_at) 
VALUES ('Albrecht Bouwman', 'albrecht.bouwman@degoudse.nl', NOW(), NOW()) 
ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.users (name, email, created_at, updated_at) 
VALUES ('Alex Salden', 'alex.salden@degoudse.nl', NOW(), NOW()) 
ON CONFLICT (name) DO NOTHING;

-- Create customer entities (using basic fields available)
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('RGO Makelaars B.V.', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Tex-Mex Streetfood', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Vishandel sperling', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('TOPHOLD International B.V.', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Cronofy B.V.', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Thema Timmerwerken', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Tibben Tapijt en', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Timmerfabriek Precisie 90', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Arian Snijders', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('M Trompetter', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Brink Eibergen B.V.', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Avifit Beauty Equipment BV', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('BRN Parket B.V.', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('G.C. Lettinga', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Bruins Betonstaalvlechtbedrijf', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Van Seters Metaaltechniek', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Lasklus Nederland B.V.', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Maco Metaal B.V.', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Mulders Metaal op Maat', 'Customer created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;

-- Create partner entities
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Schouten Zekerheid Mak in Ass BV', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Zicht B.V.', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Cooperatieve Rabobank U.A.', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Klap B.V.', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Mevas BV', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Aon (v.h.Meeus)', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Meijers Assurantien', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('HDB Risicobeheer BV', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Wonen & Welzijn Assurantien BV', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Van den Berk Assurantien B.V.', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;
INSERT INTO degoudse.customers (name, description, created_at, updated_at) VALUES ('Leenders & Gielen Assurantien', 'Partner created from Excel import', NOW(), NOW()) ON CONFLICT (name) DO NOTHING;