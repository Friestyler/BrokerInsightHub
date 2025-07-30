-- Product Categories Integration SQL
-- Generated from Excel file with 46 entries across 11 main categories

-- First, clear existing categories to prevent duplicates
DELETE FROM degoudse.product_categories WHERE description LIKE '%Deutsche Telekom%' OR description LIKE '%T-Systems%';

-- Insert main product categories
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Connectivity & Network', 'Connectivity & Network category with 6 subcategories. Primary providers: Deutsche Telekom, T-Systems', '#3b82f6', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Cloud & Hosting', 'Cloud & Hosting category with 5 subcategories. Primary providers: Deutsche Telekom, T-Systems', '#10b981', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Security', 'Security category with 6 subcategories. Primary providers: T-Systems, Deutsche Telekom', '#f59e0b', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Unified Communications', 'Unified Communications category with 4 subcategories. Primary providers: Deutsche Telekom, T-Systems', '#ef4444', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('IoT & M2M', 'IoT & M2M category with 4 subcategories. Primary providers: Deutsche Telekom, T-Systems', '#8b5cf6', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Digital & Application', 'Digital & Application category with 4 subcategories. Primary providers: T-Systems, Deutsche Telekom', '#06b6d4', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Analytics & AI', 'Analytics & AI category with 4 subcategories. Primary providers: Deutsche Telekom, T-Systems', '#84cc16', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Managed Services', 'Managed Services category with 3 subcategories. Primary providers: T-Systems, Deutsche Telekom', '#f97316', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Industry Solutions', 'Industry Solutions category with 4 subcategories. Primary providers: T-Systems, Deutsche Telekom', '#ec4899', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Digital Workplace', 'Digital Workplace category with 3 subcategories. Primary providers: Deutsche Telekom, T-Systems', '#6366f1', NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, created_at, updated_at) VALUES 
('Payment & FinTech', 'Payment & FinTech category with 3 subcategories. Primary providers: Deutsche Telekom, T-Systems', '#14b8a6', NOW(), NOW());

-- Insert subcategories with parent relationships
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('MPLS & IP-VPN', 'Subcategory under Connectivity & Network. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('SD-WAN', 'Subcategory under Connectivity & Network. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Carrier Ethernet', 'Subcategory under Connectivity & Network. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Mobile Data Plans (MagentaMobil Business, IoT SIM)', 'Subcategory under Connectivity & Network. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Roaming Services', 'Subcategory under Connectivity & Network. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Fiber & FTTH', 'Subcategory under Connectivity & Network. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Connectivity & Network' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Public Cloud (Open Telekom Cloud, Azure Stack)', 'Subcategory under Cloud & Hosting. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Cloud & Hosting' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Cloud & Hosting' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Private Cloud', 'Subcategory under Cloud & Hosting. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Cloud & Hosting' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Cloud & Hosting' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Hybrid Cloud Solutions', 'Subcategory under Cloud & Hosting. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Cloud & Hosting' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Cloud & Hosting' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Colocation & Data Center', 'Subcategory under Cloud & Hosting. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Cloud & Hosting' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Cloud & Hosting' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Backup & Disaster Recovery', 'Subcategory under Cloud & Hosting. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Cloud & Hosting' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Cloud & Hosting' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Managed Firewall', 'Subcategory under Security. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('DDoS Protection', 'Subcategory under Security. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Secure Web Gateway', 'Subcategory under Security. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Security Operations Center (SOC as a Service)', 'Subcategory under Security. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Endpoint Protection (MagentaSecurity)', 'Subcategory under Security. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Identity & Access Management', 'Subcategory under Security. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Security' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('SIP Trunking & VoIP', 'Subcategory under Unified Communications. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Unified Communications' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Unified Communications' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Hosted PBX', 'Subcategory under Unified Communications. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Unified Communications' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Unified Communications' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Contact Center as a Service', 'Subcategory under Unified Communications. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Unified Communications' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Unified Communications' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Collaboration Platforms (e.g. Teams, Webex)', 'Subcategory under Unified Communications. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Unified Communications' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Unified Communications' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('IoT Connectivity (NB-IoT, LTE-M)', 'Subcategory under IoT & M2M. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'IoT & M2M' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'IoT & M2M' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Device Management Platform', 'Subcategory under IoT & M2M. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'IoT & M2M' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'IoT & M2M' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Industry 4.0 Solutions (Predictive Maintenance)', 'Subcategory under IoT & M2M. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'IoT & M2M' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'IoT & M2M' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Smart Building / Smart City Solutions', 'Subcategory under IoT & M2M. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'IoT & M2M' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'IoT & M2M' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Application Development & DevOps', 'Subcategory under Digital & Application. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Digital & Application' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Digital & Application' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('API Management', 'Subcategory under Digital & Application. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Digital & Application' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Digital & Application' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Integration Services (ESB, iPaaS)', 'Subcategory under Digital & Application. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Digital & Application' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Digital & Application' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Digital Experience (UX/UI, Testing)', 'Subcategory under Digital & Application. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Digital & Application' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Digital & Application' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Big Data Analytics', 'Subcategory under Analytics & AI. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Analytics & AI' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Analytics & AI' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('AI & Machine Learning Services', 'Subcategory under Analytics & AI. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Analytics & AI' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Analytics & AI' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('IoT Analytics', 'Subcategory under Analytics & AI. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Analytics & AI' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Analytics & AI' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Real-time Data Streaming', 'Subcategory under Analytics & AI. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Analytics & AI' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Analytics & AI' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Infrastructure Management', 'Subcategory under Managed Services. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Managed Services' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Managed Services' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Application Management', 'Subcategory under Managed Services. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Managed Services' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Managed Services' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('End-User Support & Helpdesk', 'Subcategory under Managed Services. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Managed Services' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Managed Services' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Automotive Cloud', 'Subcategory under Industry Solutions. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Industry Solutions' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Industry Solutions' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Rail Cloud', 'Subcategory under Industry Solutions. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Industry Solutions' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Industry Solutions' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Energy & Utilities (Smart Grid)', 'Subcategory under Industry Solutions. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Industry Solutions' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Industry Solutions' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Healthcare Solutions', 'Subcategory under Industry Solutions. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Industry Solutions' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Industry Solutions' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Virtual Desktop Infrastructure (VDI)', 'Subcategory under Digital Workplace. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Digital Workplace' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Digital Workplace' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Device as a Service (DaaS)', 'Subcategory under Digital Workplace. Providers: Deutsche Telekom, T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Digital Workplace' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Digital Workplace' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Mobile Device Management (MDM)', 'Subcategory under Digital Workplace. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Digital Workplace' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Digital Workplace' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Payment Gateway', 'Subcategory under Payment & FinTech. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Payment & FinTech' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Payment & FinTech' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Mobile Identity & Authentication', 'Subcategory under Payment & FinTech. Providers: Deutsche Telekom', (SELECT color FROM degoudse.product_categories WHERE name = 'Payment & FinTech' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Payment & FinTech' LIMIT 1), NOW(), NOW());
INSERT INTO degoudse.product_categories (name, description, color, parent_id, created_at, updated_at) VALUES 
('Financial Services Platforms', 'Subcategory under Payment & FinTech. Providers: T-Systems', (SELECT color FROM degoudse.product_categories WHERE name = 'Payment & FinTech' LIMIT 1), (SELECT id FROM degoudse.product_categories WHERE name = 'Payment & FinTech' LIMIT 1), NOW(), NOW());
