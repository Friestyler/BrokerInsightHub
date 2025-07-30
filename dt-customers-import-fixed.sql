-- DT Customers Data Import SQL - Fixed Schema
-- Generated from Excel file with 12 customers

-- Insert technology categories into product_categories table
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('SD-WAN', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('IoT Connectivity', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('MPLS & IP-VPN', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Roaming Services', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Private Cloud', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Backup & DR', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Device Management', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Analytics', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('API Management', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Edge Computing', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Smart Building', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Application Management', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('VDI', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('SWG', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('SOC', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Business Intelligence', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('SAP Cloud Platform', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Integration Services', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Machine Learning', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Hybrid Cloud', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Security Operations', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Data Center', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW()),
('Workplace Management', 'Technology category imported from DT Customers data', '#2563eb', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert DT Technology customers
INSERT INTO degoudse.customers (name, description, initials, "createdAt", "updatedAt") VALUES 
('Adidas', 'DT Technology customer - Partners: 2, Total Value: €4.5M, Open Opportunities: 8', 'ADI', NOW(), NOW()),
('Lufthansa', 'DT Technology customer - Partners: 3, Total Value: €3.2M, Open Opportunities: 5', 'LUF', NOW(), NOW()),
('Merck', 'DT Technology customer - Partners: 1, Total Value: €6.1M, Open Opportunities: 12', 'MER', NOW(), NOW()),
('Continental', 'DT Technology customer - Partners: 2, Total Value: €5M, Open Opportunities: 7', 'CON', NOW(), NOW()),
('Munich Re', 'DT Technology customer - Partners: 4, Total Value: €7.8M, Open Opportunities: 4', 'MRE', NOW(), NOW()),
('Porsche', 'DT Technology customer - Partners: 3, Total Value: €4.7M, Open Opportunities: 9', 'POR', NOW(), NOW()),
('Bayer', 'DT Technology customer - Partners: 2, Total Value: €6.3M, Open Opportunities: 6', 'BAY', NOW(), NOW()),
('Deutsche Bank', 'DT Technology customer - Partners: 5, Total Value: €8.2M, Open Opportunities: 3', 'DBK', NOW(), NOW()),
('Daimler', 'DT Technology customer - Partners: 3, Total Value: €5.5M, Open Opportunities: 8', 'DAI', NOW(), NOW()),
('BASF', 'DT Technology customer - Partners: 4, Total Value: €7.1M, Open Opportunities: 5', 'BAS', NOW(), NOW()),
('Deutsche Bahn', 'DT Technology customer - Partners: 2, Total Value: €4.9M, Open Opportunities: 10', 'DBN', NOW(), NOW()),
('SAP', 'DT Technology customer - Partners: 1, Total Value: €5.6M, Open Opportunities: 7', 'SAP', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert opportunities for DT customers
INSERT INTO degoudse.opportunities (title, description, "clientId", "estimatedValue", probability, status, "createdAt", "updatedAt") VALUES 
('SD-WAN - Adidas', 'Technology opportunity imported from DT Customers data. Category: SD-WAN, Value: €1.8M', (SELECT id FROM degoudse.customers WHERE name = 'Adidas' LIMIT 1), 1800000, 60, 'open', NOW(), NOW()),
('IoT Connectivity - Adidas', 'Technology opportunity imported from DT Customers data. Category: IoT Connectivity, Value: €2.7M', (SELECT id FROM degoudse.customers WHERE name = 'Adidas' LIMIT 1), 2700000, 60, 'open', NOW(), NOW()),
('MPLS & IP-VPN - Lufthansa', 'Technology opportunity imported from DT Customers data. Category: MPLS & IP-VPN, Value: €1.5M', (SELECT id FROM degoudse.customers WHERE name = 'Lufthansa' LIMIT 1), 1500000, 60, 'open', NOW(), NOW()),
('Roaming - Lufthansa', 'Technology opportunity imported from DT Customers data. Category: Roaming, Value: €1.7M', (SELECT id FROM degoudse.customers WHERE name = 'Lufthansa' LIMIT 1), 1700000, 60, 'open', NOW(), NOW()),
('Private Cloud - Merck', 'Technology opportunity imported from DT Customers data. Category: Private Cloud, Value: €3.6M', (SELECT id FROM degoudse.customers WHERE name = 'Merck' LIMIT 1), 3600000, 60, 'open', NOW(), NOW()),
('Backup & DR - Merck', 'Technology opportunity imported from DT Customers data. Category: Backup & DR, Value: €2.5M', (SELECT id FROM degoudse.customers WHERE name = 'Merck' LIMIT 1), 2500000, 60, 'open', NOW(), NOW()),
('Device Mgmt - Continental', 'Technology opportunity imported from DT Customers data. Category: Device Mgmt, Value: €2.1M', (SELECT id FROM degoudse.customers WHERE name = 'Continental' LIMIT 1), 2100000, 60, 'open', NOW(), NOW()),
('Analytics - Continental', 'Technology opportunity imported from DT Customers data. Category: Analytics, Value: €2.9M', (SELECT id FROM degoudse.customers WHERE name = 'Continental' LIMIT 1), 2900000, 60, 'open', NOW(), NOW()),
('API Mgmt - Munich Re', 'Technology opportunity imported from DT Customers data. Category: API Mgmt, Value: €4.3M', (SELECT id FROM degoudse.customers WHERE name = 'Munich Re' LIMIT 1), 4300000, 60, 'open', NOW(), NOW()),
('Edge Computing - Munich Re', 'Technology opportunity imported from DT Customers data. Category: Edge Computing, Value: €1.7M', (SELECT id FROM degoudse.customers WHERE name = 'Munich Re' LIMIT 1), 1700000, 60, 'open', NOW(), NOW()),
('Smart Building - Munich Re', 'Technology opportunity imported from DT Customers data. Category: Smart Building, Value: €1.8M', (SELECT id FROM degoudse.customers WHERE name = 'Munich Re' LIMIT 1), 1800000, 60, 'open', NOW(), NOW()),
('App Mgmt - Porsche', 'Technology opportunity imported from DT Customers data. Category: App Mgmt, Value: €2.3M', (SELECT id FROM degoudse.customers WHERE name = 'Porsche' LIMIT 1), 2300000, 60, 'open', NOW(), NOW()),
('VDI - Porsche', 'Technology opportunity imported from DT Customers data. Category: VDI, Value: €2.4M', (SELECT id FROM degoudse.customers WHERE name = 'Porsche' LIMIT 1), 2400000, 60, 'open', NOW(), NOW()),
('SWG - Bayer', 'Technology opportunity imported from DT Customers data. Category: SWG, Value: €1M', (SELECT id FROM degoudse.customers WHERE name = 'Bayer' LIMIT 1), 1000000, 60, 'open', NOW(), NOW()),
('SOC - Bayer', 'Technology opportunity imported from DT Customers data. Category: SOC, Value: €1.5M', (SELECT id FROM degoudse.customers WHERE name = 'Bayer' LIMIT 1), 1500000, 60, 'open', NOW(), NOW()),
('App Mgmt - Bayer', 'Technology opportunity imported from DT Customers data. Category: App Mgmt, Value: €2.9M', (SELECT id FROM degoudse.customers WHERE name = 'Bayer' LIMIT 1), 2900000, 60, 'open', NOW(), NOW()),
('VDI - Daimler', 'Technology opportunity imported from DT Customers data. Category: VDI, Value: €0.8M', (SELECT id FROM degoudse.customers WHERE name = 'Daimler' LIMIT 1), 800000, 60, 'open', NOW(), NOW()),
('Private Cloud - BASF', 'Technology opportunity imported from DT Customers data. Category: Private Cloud, Value: €4.1M', (SELECT id FROM degoudse.customers WHERE name = 'BASF' LIMIT 1), 4100000, 60, 'open', NOW(), NOW()),
('API Mgmt - SAP', 'Technology opportunity imported from DT Customers data. Category: API Mgmt, Value: €2.2M', (SELECT id FROM degoudse.customers WHERE name = 'SAP' LIMIT 1), 2200000, 60, 'open', NOW(), NOW());