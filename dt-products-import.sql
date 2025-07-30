-- Insert Deutsche Telekom/T-Systems products

-- Connectivity & Network products
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2000, 'MagentaMobil Business (Mobile Plans)', 'Product from Deutsche Telekom in Connectivity & Network category', 'Deutsche Telekom', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2001, 'MagentaEINS Business (Fixed + Mobile Bundle)', 'Product from Deutsche Telekom in Connectivity & Network category', 'Deutsche Telekom', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2002, 'Telekom SD-WAN', 'Product from Deutsche Telekom, T-Systems in Connectivity & Network category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2003, 'Telekom MPLS & IP-VPN', 'Product from Deutsche Telekom, T-Systems in Connectivity & Network category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2004, 'Telekom Fiber & FTTH', 'Product from Deutsche Telekom in Connectivity & Network category', 'Deutsche Telekom', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2005, 'Telekom Roaming Services', 'Product from Deutsche Telekom in Connectivity & Network category', 'Deutsche Telekom', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2006, 'Telekom Connectivity Hub', 'Product from Deutsche Telekom, T-Systems in Connectivity & Network category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2007, 'Telekom IoT Connectivity (NB-IoT, LTE-M)', 'Product from Deutsche Telekom in Connectivity & Network category', 'Deutsche Telekom', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2008, 'T-Systems Mobile Connect', 'Product from Deutsche Telekom in Connectivity & Network category', 'Deutsche Telekom', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

-- Cloud & Hosting products
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2009, 'MagentaCloud (Backup & File Sync)', 'Product from Deutsche Telekom, T-Systems in Cloud & Hosting category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2010, 'Open Telekom Cloud', 'Product from Deutsche Telekom, T-Systems in Cloud & Hosting category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2011, 'Telekom Public Cloud (Azure Stack)', 'Product from Deutsche Telekom, T-Systems in Cloud & Hosting category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2012, 'Telekom Private Cloud', 'Product from T-Systems in Cloud & Hosting category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2013, 'Telekom Hybrid Cloud Suite', 'Product from Deutsche Telekom, T-Systems in Cloud & Hosting category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2014, 'Telekom Colocation & Data Center Services', 'Product from Deutsche Telekom, T-Systems in Cloud & Hosting category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2015, 'T-Systems Automotive Cloud', 'Product from T-Systems in Cloud & Hosting category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2016, 'T-Systems Rail Cloud', 'Product from T-Systems in Cloud & Hosting category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2017, 'T-Systems Media Cloud', 'Product from T-Systems in Cloud & Hosting category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2018, 'T-Systems Postal Cloud', 'Product from T-Systems in Cloud & Hosting category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2019, 'T-Systems Cloud Reselling', 'Product from Deutsche Telekom, T-Systems in Cloud & Hosting category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

-- Security products
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2020, 'MagentaSecurity (Endpoint Protection)', 'Product from Deutsche Telekom in Security category', 'Deutsche Telekom', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2021, 'MagentaSecure Workspace (Secure Web Gateway)', 'Product from Deutsche Telekom, T-Systems in Security category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2022, 'T-Systems Managed Firewall', 'Product from T-Systems in Security category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

-- Unified Communications products
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2023, 'T-Systems Voice Platform', 'Product from T-Systems in Unified Communications category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

-- IoT & M2M products
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2024, 'Telekom IoT Platform', 'Product from Deutsche Telekom, T-Systems in IoT & M2M category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2025, 'Telekom Device Management', 'Product from Deutsche Telekom in IoT & M2M category', 'Deutsche Telekom', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2026, 'T-Systems Smart Mobility', 'Product from T-Systems in IoT & M2M category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2027, 'T-Systems Industry 4.0 Suite', 'Product from T-Systems in IoT & M2M category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2028, 'T-Systems Smarter Cities Platform', 'Product from T-Systems in IoT & M2M category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

-- Digital & Application products
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2029, 'T-Systems Application Management', 'Product from T-Systems in Digital & Application category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2030, 'Telekom API Management', 'Product from Deutsche Telekom, T-Systems in Digital & Application category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

-- Analytics & AI products
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2031, 'Telekom Real-time Data Streaming', 'Product from Deutsche Telekom, T-Systems in Analytics & AI category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2032, 'Telekom Big Data Analytics', 'Product from Deutsche Telekom, T-Systems in Analytics & AI category', 'Deutsche Telekom, T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

-- Managed Services products
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2033, 'T-Systems Infrastructure Management', 'Product from T-Systems in Managed Services category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

-- Industry Solutions products
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2034, 'T-Systems Energy Solutions', 'Product from T-Systems in Industry Solutions category', 'T-Systems', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

-- Payment & FinTech products
INSERT INTO degoudse.products (id, name, description, provider, created_at, updated_at) VALUES (2035, 'Telekom Payment Gateway', 'Product from Deutsche Telekom in Payment & FinTech category', 'Deutsche Telekom', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
