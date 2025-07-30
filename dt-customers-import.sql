-- DT Customers Data Import SQL
-- Generated from Excel file with 12 customers

-- Insert technology categories
INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'SD-WAN',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'IoT Connectivity',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'MPLS & IP-VPN',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Roaming Services',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Private Cloud',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Backup & DR',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Device Management',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Big Data Analytics',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'API Management',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Edge Computing',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Smart Building Solutions',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Hybrid Cloud',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Colocation & Data Center',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Secure Web Gateway',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'SOC as a Service',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Application Management',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'VDI',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Endpoint Protection',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'DDoS Protection',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Rail Cloud',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'IoT Analytics',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'SAP Cloud Platform',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.categories (name, description, color, created_at, updated_at) VALUES (
  'Integration Services',
  'Technology category imported from DT Customers data',
  '#2563eb',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;


-- Insert DT Technology customers
INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'Adidas',
  'DT Technology customer - Partners: 2, Total Value: €4.5M, Open Opportunities: 8',
  'A',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'Lufthansa',
  'DT Technology customer - Partners: 3, Total Value: €3.2M, Open Opportunities: 5',
  'L',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'Merck',
  'DT Technology customer - Partners: 1, Total Value: €6.1M, Open Opportunities: 12',
  'M',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'Continental',
  'DT Technology customer - Partners: 2, Total Value: €5M, Open Opportunities: 7',
  'C',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'Munich Re',
  'DT Technology customer - Partners: 1, Total Value: €7.8M, Open Opportunities: 4',
  'MR',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'Porsche',
  'DT Technology customer - Partners: 3, Total Value: €4M, Open Opportunities: 10',
  'P',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'Bayer',
  'DT Technology customer - Partners: 2, Total Value: €9.3M, Open Opportunities: 9',
  'B',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'Deutsche Bank',
  'DT Technology customer - Partners: 2, Total Value: €2.5M, Open Opportunities: 6',
  'DB',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'Daimler',
  'DT Technology customer - Partners: 1, Total Value: €8.4M, Open Opportunities: 11',
  'D',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'BASF',
  'DT Technology customer - Partners: 2, Total Value: €6.7M, Open Opportunities: 8',
  'B',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'Deutsche Bahn',
  'DT Technology customer - Partners: 3, Total Value: €3.9M, Open Opportunities: 14',
  'DB',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;

INSERT INTO degoudse.customers (name, description, initials, created_at, updated_at) VALUES (
  'SAP',
  'DT Technology customer - Partners: 2, Total Value: €5.6M, Open Opportunities: 7',
  'S',
  NOW(), NOW()
) ON CONFLICT (name) DO NOTHING;


-- Insert opportunities for DT customers
INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'SD-WAN - Adidas',
  'Technology opportunity imported from DT Customers data. Category: SD-WAN, Value: €1.8M',
  (SELECT id FROM degoudse.customers WHERE name = 'Adidas' LIMIT 1),
  1800000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'IoT Connectivity - Adidas',
  'Technology opportunity imported from DT Customers data. Category: IoT Connectivity, Value: €2.7M',
  (SELECT id FROM degoudse.customers WHERE name = 'Adidas' LIMIT 1),
  2700000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'MPLS & IP-VPN - Lufthansa',
  'Technology opportunity imported from DT Customers data. Category: MPLS & IP-VPN, Value: €1.5M',
  (SELECT id FROM degoudse.customers WHERE name = 'Lufthansa' LIMIT 1),
  1500000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'Roaming - Lufthansa',
  'Technology opportunity imported from DT Customers data. Category: Roaming, Value: €1.7M',
  (SELECT id FROM degoudse.customers WHERE name = 'Lufthansa' LIMIT 1),
  1700000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'Private Cloud - Merck',
  'Technology opportunity imported from DT Customers data. Category: Private Cloud, Value: €3.6M',
  (SELECT id FROM degoudse.customers WHERE name = 'Merck' LIMIT 1),
  3600000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'Backup & DR - Merck',
  'Technology opportunity imported from DT Customers data. Category: Backup & DR, Value: €2.5M',
  (SELECT id FROM degoudse.customers WHERE name = 'Merck' LIMIT 1),
  2500000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'IoT Connectivity - Continental',
  'Technology opportunity imported from DT Customers data. Category: IoT Connectivity, Value: €2.9M',
  (SELECT id FROM degoudse.customers WHERE name = 'Continental' LIMIT 1),
  2900000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'Device Mgmt - Continental',
  'Technology opportunity imported from DT Customers data. Category: Device Mgmt, Value: €2.1M',
  (SELECT id FROM degoudse.customers WHERE name = 'Continental' LIMIT 1),
  2100000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'Analytics - Munich Re',
  'Technology opportunity imported from DT Customers data. Category: Analytics, Value: €4.3M',
  (SELECT id FROM degoudse.customers WHERE name = 'Munich Re' LIMIT 1),
  4300000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'API Mgmt - Munich Re',
  'Technology opportunity imported from DT Customers data. Category: API Mgmt, Value: €3.5M',
  (SELECT id FROM degoudse.customers WHERE name = 'Munich Re' LIMIT 1),
  3500000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'Edge Computing - Porsche',
  'Technology opportunity imported from DT Customers data. Category: Edge Computing, Value: €1.7M',
  (SELECT id FROM degoudse.customers WHERE name = 'Porsche' LIMIT 1),
  1700000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'Smart Building - Porsche',
  'Technology opportunity imported from DT Customers data. Category: Smart Building, Value: €2.3M',
  (SELECT id FROM degoudse.customers WHERE name = 'Porsche' LIMIT 1),
  2300000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'Private Cloud - Bayer',
  'Technology opportunity imported from DT Customers data. Category: Private Cloud, Value: €5.1M',
  (SELECT id FROM degoudse.customers WHERE name = 'Bayer' LIMIT 1),
  5100000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'SWG - Deutsche Bank',
  'Technology opportunity imported from DT Customers data. Category: SWG, Value: €1M',
  (SELECT id FROM degoudse.customers WHERE name = 'Deutsche Bank' LIMIT 1),
  1000000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'SOC - Deutsche Bank',
  'Technology opportunity imported from DT Customers data. Category: SOC, Value: €1.5M',
  (SELECT id FROM degoudse.customers WHERE name = 'Deutsche Bank' LIMIT 1),
  1500000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'App Mgmt - Daimler',
  'Technology opportunity imported from DT Customers data. Category: App Mgmt, Value: €5.2M',
  (SELECT id FROM degoudse.customers WHERE name = 'Daimler' LIMIT 1),
  5200000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'VDI - Daimler',
  'Technology opportunity imported from DT Customers data. Category: VDI, Value: €3.2M',
  (SELECT id FROM degoudse.customers WHERE name = 'Daimler' LIMIT 1),
  3200000,
  0.6,
  'open',
  NOW(), NOW()
);

INSERT INTO degoudse.opportunities (title, description, client_id, estimated_value, probability, status, created_at, updated_at) VALUES (
  'API Mgmt - SAP',
  'Technology opportunity imported from DT Customers data. Category: API Mgmt, Value: €2.2M',
  (SELECT id FROM degoudse.customers WHERE name = 'SAP' LIMIT 1),
  2200000,
  0.6,
  'open',
  NOW(), NOW()
);

