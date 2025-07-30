-- Bosch Customer and Opportunities Import SQL
-- Generated from Excel file with 13 closed opportunities

-- Insert Bosch business categories into product_categories table
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Mobility Solutions', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Thermotechnology', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Security Solutions', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Digital Products & Services', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Industrial Manufacturing', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Research & Development', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('IT Infrastructure', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Enterprise Applications', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Smart Building', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Collaboration & UX', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('End-User Support', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Backup & Recovery', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Network Services', 'Business category from Bosch closed opportunities data', '#f97316', NOW(), NOW());

-- Insert Bosch customer
INSERT INTO degoudse.customers (name, description, "createdAt", "updatedAt") VALUES 
('Bosch', 'German multinational engineering and technology company with 13 closed opportunities totaling €13.0M', NOW(), NOW());

-- Insert Bosch closed opportunities (1 batches of up to 50 each)

-- Batch 1 of 1
INSERT INTO degoudse.opportunities (title, description, "clientId", "productId", "estimatedValue", probability, status, stage, "expectedCloseDate", "createdAt", "updatedAt") VALUES 
('IoT Connectivity - Mobility Solutions', 'Closed opportunity from Bosch data. Category: Mobility Solutions, Subcategory: IoT Connectivity, Contract expires: 2026-06-30', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 1500000, 100, 'closed_won', 'closed', '2026-06-30', NOW(), NOW()),
('MagentaSecurity - Thermotechnology', 'Closed opportunity from Bosch data. Category: Thermotechnology, Subcategory: MagentaSecurity, Contract expires: 2025-12-31', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 1200000, 100, 'closed_won', 'closed', '2025-12-31', NOW(), NOW()),
('Secure Web Gateway - Security Solutions', 'Closed opportunity from Bosch data. Category: Security Solutions, Subcategory: Secure Web Gateway, Contract expires: 2026-03-31', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 800000, 100, 'closed_won', 'closed', '2026-03-31', NOW(), NOW()),
('Open Telekom Cloud - Digital Products & Services', 'Closed opportunity from Bosch data. Category: Digital Products & Services, Subcategory: Open Telekom Cloud, Contract expires: 2026-08-15', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 1000000, 100, 'closed_won', 'closed', '2026-08-15', NOW(), NOW()),
('Industrial IoT Suite - Industrial Manufacturing', 'Closed opportunity from Bosch data. Category: Industrial Manufacturing, Subcategory: Industrial IoT Suite, Contract expires: 2027-01-01', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 600000, 100, 'closed_won', 'closed', '2027-01-01', NOW(), NOW()),
('Big Data Analytics as a Service - Research & Development', 'Closed opportunity from Bosch data. Category: Research & Development, Subcategory: Big Data Analytics as a Service, Contract expires: 2026-09-30', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 1300000, 100, 'closed_won', 'closed', '2026-09-30', NOW(), NOW()),
('SD-WAN Managed Service - IT Infrastructure', 'Closed opportunity from Bosch data. Category: IT Infrastructure, Subcategory: SD-WAN Managed Service, Contract expires: 2025-10-31', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 900000, 100, 'closed_won', 'closed', '2025-10-31', NOW(), NOW()),
('API Management Platform - Enterprise Applications', 'Closed opportunity from Bosch data. Category: Enterprise Applications, Subcategory: API Management Platform, Contract expires: 2026-02-28', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 1100000, 100, 'closed_won', 'closed', '2026-02-28', NOW(), NOW()),
('Smart Building / Smart City Solutions - Smart Building', 'Closed opportunity from Bosch data. Category: Smart Building, Subcategory: Smart Building / Smart City Solutions, Contract expires: 2026-11-15', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 700000, 100, 'closed_won', 'closed', '2026-11-15', NOW(), NOW()),
('Digital Experience (UX/UI, Testing) - Collaboration & UX', 'Closed opportunity from Bosch data. Category: Collaboration & UX, Subcategory: Digital Experience (UX/UI, Testing), Contract expires: 2026-05-20', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 1400000, 100, 'closed_won', 'closed', '2026-05-20', NOW(), NOW()),
('End-User Support & Helpdesk - End-User Support', 'Closed opportunity from Bosch data. Category: End-User Support, Subcategory: End-User Support & Helpdesk, Contract expires: 2025-09-30', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 500000, 100, 'closed_won', 'closed', '2025-09-30', NOW(), NOW()),
('Backup & Disaster Recovery - Backup & Recovery', 'Closed opportunity from Bosch data. Category: Backup & Recovery, Subcategory: Backup & Disaster Recovery, Contract expires: 2026-12-31', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 800000, 100, 'closed_won', 'closed', '2026-12-31', NOW(), NOW()),
('MPLS & IP-VPN - Network Services', 'Closed opportunity from Bosch data. Category: Network Services, Subcategory: MPLS & IP-VPN, Contract expires: 2027-03-31', (SELECT id FROM degoudse.customers WHERE name = 'Bosch' LIMIT 1), 1001, 1200000, 100, 'closed_won', 'closed', '2027-03-31', NOW(), NOW());
