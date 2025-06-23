-- Creating customers
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Bart De Smet', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Sofie Peeters', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Tom Vermeulen', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Elke Janssens', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Wim Claes', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Anke De Wilde', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Koen Maes', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Lien Van den Broeck', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Pieter Declercq', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Karen De Cock', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Jens Van Damme', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Sara Michiels', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Bram Willems', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Nathalie Goossens', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Kurt Van der Linden', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Els Vandenberghe', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Dieter De Vos', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Isabelle Wauters', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Jonas Desmet', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Tine Dierickx', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Gert Bogaert', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Inge Van Acker', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Frederik Vandenbroucke', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Lien D’Haese', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Raf Moerman', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('IP Nexia', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('ALLOcloud', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('ITAF', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('MIXvoip', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Intellinet', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Voys', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('LIZY', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Zetes Industries', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Intermodalics', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Sirris', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Agoria', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Anju Life Sciences Software', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.customers (name, created_at, updated_at, environment_id) 
VALUES ('Cenexi', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;

-- Creating partners
INSERT INTO baloise.partners (name, created_at, updated_at, environment_id) 
VALUES ('Induver', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.partners (name, created_at, updated_at, environment_id) 
VALUES ('Van Breda', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.partners (name, created_at, updated_at, environment_id) 
VALUES ('Hermans Financial Agents', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.partners (name, created_at, updated_at, environment_id) 
VALUES ('Concordia NV', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.partners (name, created_at, updated_at, environment_id) 
VALUES ('Helix Verzekeringen', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;
INSERT INTO baloise.partners (name, created_at, updated_at, environment_id) 
VALUES ('BARBUSS', NOW(), NOW(), 'baloise')
ON CONFLICT (name) DO NOTHING;

-- Creating opportunities with relationships
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Bart De Smet',
  (SELECT id FROM baloise.customers WHERE name = 'Bart De Smet' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Induver' LIMIT 1),
  'Negotiation',
  75,
  100000,
  75000,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Sofie Peeters',
  (SELECT id FROM baloise.customers WHERE name = 'Sofie Peeters' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Induver' LIMIT 1),
  'Negotiation',
  75,
  100000,
  75000,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Tom Vermeulen',
  (SELECT id FROM baloise.customers WHERE name = 'Tom Vermeulen' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Induver' LIMIT 1),
  'Negotiation',
  75,
  100000,
  75000,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Elke Janssens',
  (SELECT id FROM baloise.customers WHERE name = 'Elke Janssens' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Induver' LIMIT 1),
  'Negotiation',
  75,
  100000,
  75000,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Wim Claes',
  (SELECT id FROM baloise.customers WHERE name = 'Wim Claes' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Van Breda' LIMIT 1),
  'Negotiation',
  75,
  100000,
  75000,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Anke De Wilde',
  (SELECT id FROM baloise.customers WHERE name = 'Anke De Wilde' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Van Breda' LIMIT 1),
  'Negotiation',
  75,
  100000,
  75000,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Koen Maes',
  (SELECT id FROM baloise.customers WHERE name = 'Koen Maes' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Van Breda' LIMIT 1),
  'Negotiation',
  75,
  100000,
  75000,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Lien Van den Broeck',
  (SELECT id FROM baloise.customers WHERE name = 'Lien Van den Broeck' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Negotiation',
  75,
  70000,
  52500,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Pieter Declercq',
  (SELECT id FROM baloise.customers WHERE name = 'Pieter Declercq' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Negotiation',
  75,
  60000,
  45000,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Karen De Cock',
  (SELECT id FROM baloise.customers WHERE name = 'Karen De Cock' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Negotiation',
  75,
  70000,
  52500,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Jens Van Damme',
  (SELECT id FROM baloise.customers WHERE name = 'Jens Van Damme' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Negotiation',
  75,
  60000,
  45000,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Sara Michiels',
  (SELECT id FROM baloise.customers WHERE name = 'Sara Michiels' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Negotiation',
  75,
  60000,
  45000,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Bram Willems',
  (SELECT id FROM baloise.customers WHERE name = 'Bram Willems' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Negotiation',
  75,
  58000,
  43500,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Einde termijn IPT - Nathalie Goossens',
  (SELECT id FROM baloise.customers WHERE name = 'Nathalie Goossens' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Negotiation',
  75,
  56000,
  42000,
  'Life Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Langetermijn sparen  - Kurt Van der Linden',
  (SELECT id FROM baloise.customers WHERE name = 'Kurt Van der Linden' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Qualified Lead',
  50,
  54000,
  27000,
  'Savings Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Langetermijn sparen  - Els Vandenberghe',
  (SELECT id FROM baloise.customers WHERE name = 'Els Vandenberghe' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Qualified Lead',
  50,
  52000,
  26000,
  'Savings Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Langetermijn sparen  - Dieter De Vos',
  (SELECT id FROM baloise.customers WHERE name = 'Dieter De Vos' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Qualified Lead',
  50,
  50000,
  25000,
  'Savings Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Langetermijn sparen  - Isabelle Wauters',
  (SELECT id FROM baloise.customers WHERE name = 'Isabelle Wauters' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Qualified Lead',
  50,
  48000,
  24000,
  'Savings Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Langetermijn sparen  - Jonas Desmet',
  (SELECT id FROM baloise.customers WHERE name = 'Jonas Desmet' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Qualified Lead',
  50,
  46000,
  23000,
  'Savings Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Langetermijn sparen  - Tine Dierickx',
  (SELECT id FROM baloise.customers WHERE name = 'Tine Dierickx' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Qualified Lead',
  50,
  44000,
  22000,
  'Savings Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Langetermijn sparen  - Gert Bogaert',
  (SELECT id FROM baloise.customers WHERE name = 'Gert Bogaert' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Qualified Lead',
  50,
  42000,
  21000,
  'Savings Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Langetermijn sparen  - Inge Van Acker',
  (SELECT id FROM baloise.customers WHERE name = 'Inge Van Acker' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Qualified Lead',
  50,
  40000,
  20000,
  'Savings Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Langetermijn sparen  - Frederik Vandenbroucke',
  (SELECT id FROM baloise.customers WHERE name = 'Frederik Vandenbroucke' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Qualified Lead',
  50,
  38000,
  19000,
  'Savings Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Langetermijn sparen  - Lien D’Haese',
  (SELECT id FROM baloise.customers WHERE name = 'Lien D’Haese' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Qualified Lead',
  50,
  36000,
  18000,
  'Savings Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'Langetermijn sparen  - Raf Moerman',
  (SELECT id FROM baloise.customers WHERE name = 'Raf Moerman' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Hermans Financial Agents' LIMIT 1),
  'Qualified Lead',
  50,
  34000,
  17000,
  'Savings Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering  - IP Nexia',
  (SELECT id FROM baloise.customers WHERE name = 'IP Nexia' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Concordia NV' LIMIT 1),
  'Proposal Sent',
  60,
  5000,
  3000,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering - ALLOcloud',
  (SELECT id FROM baloise.customers WHERE name = 'ALLOcloud' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Helix Verzekeringen' LIMIT 1),
  'Proposal Sent',
  60,
  10000,
  6000,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering  - ITAF',
  (SELECT id FROM baloise.customers WHERE name = 'ITAF' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Concordia NV' LIMIT 1),
  'Proposal Sent',
  60,
  4000,
  2400,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering - MIXvoip',
  (SELECT id FROM baloise.customers WHERE name = 'MIXvoip' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Helix Verzekeringen' LIMIT 1),
  'Proposal Sent',
  60,
  2000,
  1200,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering  - Intellinet',
  (SELECT id FROM baloise.customers WHERE name = 'Intellinet' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'BARBUSS' LIMIT 1),
  'Proposal Sent',
  60,
  6000,
  3600,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering - Voys',
  (SELECT id FROM baloise.customers WHERE name = 'Voys' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Helix Verzekeringen' LIMIT 1),
  'Proposal Sent',
  60,
  3600,
  2160,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering  - LIZY',
  (SELECT id FROM baloise.customers WHERE name = 'LIZY' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Concordia NV' LIMIT 1),
  'Proposal Sent',
  60,
  3000,
  1800,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering - Zetes Industries',
  (SELECT id FROM baloise.customers WHERE name = 'Zetes Industries' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Helix Verzekeringen' LIMIT 1),
  'Proposal Sent',
  60,
  2400,
  1440,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering  - Intermodalics',
  (SELECT id FROM baloise.customers WHERE name = 'Intermodalics' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Helix Verzekeringen' LIMIT 1),
  'Proposal Sent',
  60,
  1800,
  1080,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering - Sirris',
  (SELECT id FROM baloise.customers WHERE name = 'Sirris' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'BARBUSS' LIMIT 1),
  'Proposal Sent',
  60,
  1200,
  720,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering  - Agoria',
  (SELECT id FROM baloise.customers WHERE name = 'Agoria' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'BARBUSS' LIMIT 1),
  'Proposal Sent',
  60,
  1000,
  600,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering - Anju Life Sciences Software',
  (SELECT id FROM baloise.customers WHERE name = 'Anju Life Sciences Software' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Concordia NV' LIMIT 1),
  'Proposal Sent',
  60,
  4000,
  2400,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);
INSERT INTO baloise.opportunities (
  title, customer_id, partner_id, stage, probability, 
  estimated_value, weighted_value, insurance_type, 
  created_at, updated_at, environment_id
) VALUES (
  'cyberverzekering  - Cenexi',
  (SELECT id FROM baloise.customers WHERE name = 'Cenexi' LIMIT 1),
  (SELECT id FROM baloise.partners WHERE name = 'Helix Verzekeringen' LIMIT 1),
  'Proposal Sent',
  60,
  7000,
  4200,
  'Cyber Insurance',
  NOW(),
  NOW(),
  'baloise'
);

-- Summary: 38 opportunities, 38 customers, 6 partners
