-- First, create the account manager user if not exists
INSERT INTO degoudse.users (username, name, email, created_at, updated_at)
VALUES ('albrecht.bouwman', 'Albrecht Bouwman', 'albrecht.bouwman@degoudse.nl', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Create customers from the Excel data
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at)
VALUES 
  ('RGO Makelaars B.V.', 'Business', 'Real Estate', 'Medium', 'Customer created from Excel import', NOW(), NOW()),
  ('Tex-Mex Streetfood', 'Business', 'Food Service', 'Small', 'Customer created from Excel import', NOW(), NOW()),
  ('Vishandel sperling', 'Business', 'Food Service', 'Small', 'Customer created from Excel import', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create the partner
INSERT INTO degoudse.customers (name, type, industry, size, description, created_at, updated_at)
VALUES ('Schouten Zekerheid Mak in Ass BV', 'Partner', 'Insurance', 'Large', 'Partner created from Excel import', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Get IDs for the relationships
WITH user_ids AS (
  SELECT id as account_manager_id FROM degoudse.users WHERE username = 'albrecht.bouwman'
),
customer_ids AS (
  SELECT id, name FROM degoudse.customers WHERE name IN (
    'RGO Makelaars B.V.', 'Tex-Mex Streetfood', 'Vishandel sperling'
  )
),
partner_ids AS (
  SELECT id as partner_id FROM degoudse.customers WHERE name = 'Schouten Zekerheid Mak in Ass BV'
)

-- Create opportunities with relationships
INSERT INTO degoudse.opportunities (
  title, client_id, partner_id, account_manager_id, insurance_description, 
  start_date, status, stage, type, probability, estimated_value, 
  created_at, updated_at
)
SELECT 
  'Zonnepanelen' as title,
  c.id as client_id,
  p.partner_id,
  u.account_manager_id,
  CASE 
    WHEN c.name = 'RGO Makelaars B.V.' THEN 'Inventaris/Goederen Zak. Dienstverlening'
    WHEN c.name = 'Tex-Mex Streetfood' THEN 'Inventaris/Goederen Horeca'
    WHEN c.name = 'Vishandel sperling' THEN 'Inventaris/Goederen Groothand'
  END as insurance_description,
  CASE 
    WHEN c.name = 'RGO Makelaars B.V.' THEN DATE '1900-01-01' + INTERVAL '43525 days'
    WHEN c.name = 'Tex-Mex Streetfood' THEN DATE '1900-01-01' + INTERVAL '44099 days'
    WHEN c.name = 'Vishandel sperling' THEN DATE '1900-01-01' + INTERVAL '44378 days'
  END as start_date,
  'Active' as status,
  'Prospecting' as stage,
  'New Business' as type,
  75 as probability,
  50000 as estimated_value,
  NOW() as created_at,
  NOW() as updated_at
FROM customer_ids c
CROSS JOIN partner_ids p
CROSS JOIN user_ids u;