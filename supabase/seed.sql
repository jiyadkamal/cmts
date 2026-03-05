-- =============================================
-- CMTS Seed Data for Supabase
-- Run this SQL in Supabase SQL Editor AFTER schema.sql
-- =============================================

-- Seed Users
INSERT INTO users (id, name, email, role, department, phone, avatar, status, joined_at) VALUES
(1, 'John Administrator', 'admin@cmts.com', 'Admin', 'Management', '+1 (555) 100-1001', 'JA', 'Active', '2023-01-15'),
(2, 'Sarah Engineer', 'sarah@cmts.com', 'Engineer', 'Engineering', '+1 (555) 100-1002', 'SE', 'Active', '2023-03-20'),
(3, 'Mike Contractor', 'mike@cmts.com', 'Contractor', 'Construction', '+1 (555) 100-1003', 'MC', 'Active', '2023-06-10'),
(4, 'Emily Client', 'emily@cmts.com', 'Client', 'External', '+1 (555) 100-1004', 'EC', 'Active', '2024-01-05'),
(5, 'David Wilson', 'david.w@cmts.com', 'Engineer', 'Engineering', '+1 (555) 100-1005', 'DW', 'Active', '2023-09-15'),
(6, 'Lisa Thompson', 'lisa.t@cmts.com', 'Contractor', 'Construction', '+1 (555) 100-1006', 'LT', 'Active', '2024-02-28');

-- Seed Projects
INSERT INTO projects (id, name, description, client, location, start_date, end_date, budget, status, progress, priority, manager, milestones, created_at) VALUES
(1, 'Downtown Office Tower', 'A 45-story commercial office building with modern amenities and sustainable design features.', 'Metro Development Corp', 'Downtown District, City Center', '2024-01-15', '2026-06-30', 45000000, 'In Progress', 35, 'High', 'Sarah Engineer', '[{"id":1,"name":"Foundation Complete","date":"2024-04-15","status":"Completed"},{"id":2,"name":"Structure Framework","date":"2024-10-30","status":"Completed"},{"id":3,"name":"Exterior Facade","date":"2025-03-15","status":"In Progress"},{"id":4,"name":"Interior Fit-out","date":"2025-09-30","status":"Pending"},{"id":5,"name":"Final Inspection","date":"2026-05-15","status":"Pending"}]', '2024-01-10T08:00:00Z'),
(2, 'Riverside Luxury Apartments', 'Premium residential complex featuring 200 luxury apartments with river views and exclusive amenities.', 'Riverside Realty LLC', 'Waterfront Avenue, Riverside', '2024-03-01', '2025-12-31', 28000000, 'In Progress', 52, 'High', 'Sarah Engineer', '[{"id":1,"name":"Site Preparation","date":"2024-04-01","status":"Completed"},{"id":2,"name":"Foundation & Basement","date":"2024-07-15","status":"Completed"},{"id":3,"name":"Structural Work","date":"2024-12-01","status":"Completed"},{"id":4,"name":"MEP Installation","date":"2025-05-30","status":"In Progress"},{"id":5,"name":"Interior Finishing","date":"2025-10-15","status":"Pending"}]', '2024-02-20T09:30:00Z'),
(3, 'Central Hospital Expansion', 'Major expansion of the existing hospital facility including a new emergency wing and diagnostic center.', 'City Healthcare Authority', 'Medical District, Central Zone', '2024-06-01', '2026-08-31', 62000000, 'In Progress', 22, 'Critical', 'John Administrator', '[{"id":1,"name":"Design Approval","date":"2024-05-15","status":"Completed"},{"id":2,"name":"Demolition Phase","date":"2024-08-30","status":"Completed"},{"id":3,"name":"New Foundation","date":"2025-01-15","status":"In Progress"},{"id":4,"name":"Building Structure","date":"2025-08-30","status":"Pending"},{"id":5,"name":"Medical Equipment Install","date":"2026-06-30","status":"Pending"}]', '2024-05-01T10:00:00Z'),
(4, 'Green Valley Shopping Mall', 'Modern retail complex with sustainable features, underground parking, and entertainment facilities.', 'Valley Retail Group', 'Green Valley, Suburban District', '2023-09-15', '2025-03-31', 35000000, 'In Progress', 78, 'Medium', 'Sarah Engineer', '[{"id":1,"name":"Land Acquisition","date":"2023-08-01","status":"Completed"},{"id":2,"name":"Underground Parking","date":"2024-03-15","status":"Completed"},{"id":3,"name":"Main Structure","date":"2024-09-30","status":"Completed"},{"id":4,"name":"Tenant Fit-out","date":"2025-01-30","status":"In Progress"},{"id":5,"name":"Grand Opening Prep","date":"2025-03-15","status":"Pending"}]', '2023-09-01T08:30:00Z'),
(5, 'Highway Bridge Renovation', 'Critical infrastructure project to renovate and strengthen the main highway bridge.', 'Department of Transportation', 'Interstate Highway 45', '2024-04-01', '2024-11-30', 12000000, 'Completed', 100, 'Critical', 'John Administrator', '[{"id":1,"name":"Traffic Diversion","date":"2024-04-15","status":"Completed"},{"id":2,"name":"Deck Removal","date":"2024-06-01","status":"Completed"},{"id":3,"name":"Structural Repair","date":"2024-08-15","status":"Completed"},{"id":4,"name":"New Deck Installation","date":"2024-10-30","status":"Completed"},{"id":5,"name":"Final Testing","date":"2024-11-20","status":"Completed"}]', '2024-03-15T07:00:00Z');

-- Reset sequence for projects
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- Seed Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, assignee, assignee_id, due_date, estimated_hours, created_at) VALUES
(1, 1, 'Install curtain wall system - Floor 15-20', 'Complete installation of aluminum and glass curtain wall system for floors 15 through 20.', 'In Progress', 'High', 'Mike Contractor', 3, '2025-02-15', 240, '2025-01-05T09:00:00Z'),
(2, 1, 'MEP rough-in Floor 10-15', 'Complete mechanical, electrical, and plumbing rough-in work for designated floors.', 'Todo', 'High', 'Sarah Engineer', 2, '2025-02-28', 180, '2025-01-06T10:30:00Z'),
(3, 1, 'Elevator shaft construction', 'Complete construction of main elevator shafts and install guide rails.', 'Completed', 'Critical', 'Mike Contractor', 3, '2025-01-10', 320, '2024-12-01T08:00:00Z'),
(4, 1, 'Fire safety system installation', 'Install fire suppression system including sprinklers, alarms, and emergency lighting.', 'Todo', 'Critical', 'Sarah Engineer', 2, '2025-03-30', 400, '2025-01-08T11:00:00Z'),
(5, 2, 'Plumbing installation - Building A', 'Complete all plumbing work for Building A including water supply and drainage systems.', 'In Progress', 'High', 'Mike Contractor', 3, '2025-02-20', 280, '2025-01-02T08:30:00Z'),
(6, 2, 'Window installation - All buildings', 'Install energy-efficient windows throughout the residential complex.', 'Todo', 'Medium', 'Mike Contractor', 3, '2025-03-15', 200, '2025-01-07T09:00:00Z'),
(7, 2, 'Landscaping design finalization', 'Finalize landscape design including garden areas, walkways, and water features.', 'Completed', 'Low', 'Sarah Engineer', 2, '2025-01-15', 40, '2024-12-20T14:00:00Z'),
(8, 3, 'Foundation reinforcement', 'Reinforce existing foundation to support new wing structure.', 'In Progress', 'Critical', 'Mike Contractor', 3, '2025-02-28', 360, '2025-01-03T07:30:00Z'),
(9, 3, 'Temporary facilities setup', 'Set up temporary patient care facilities during construction phase.', 'Completed', 'Critical', 'Sarah Engineer', 2, '2024-12-30', 120, '2024-12-01T10:00:00Z'),
(10, 4, 'Food court ventilation system', 'Install commercial-grade ventilation system for the food court area.', 'In Progress', 'High', 'Mike Contractor', 3, '2025-02-10', 160, '2025-01-04T08:00:00Z'),
(11, 4, 'Parking lot lighting installation', 'Install LED lighting system throughout the underground parking facility.', 'Completed', 'Medium', 'Mike Contractor', 3, '2025-01-20', 80, '2024-12-15T09:30:00Z'),
(12, 4, 'Signage and wayfinding installation', 'Install all interior and exterior signage including digital directories.', 'Todo', 'Medium', 'Sarah Engineer', 2, '2025-03-01', 60, '2025-01-09T11:30:00Z');

-- Reset sequence for tasks
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));

-- Seed Materials
INSERT INTO materials (id, name, category, unit, quantity, min_stock, max_stock, unit_price, supplier, project_id, location, last_updated, created_at) VALUES
(1, 'Structural Steel Beams', 'Steel', 'tons', 450, 100, 600, 1200, 'MetalWorks Inc.', 1, 'Warehouse A', '2025-01-10T08:00:00Z', '2024-01-15T08:00:00Z'),
(2, 'Ready-Mix Concrete', 'Concrete', 'cubic yards', 280, 50, 400, 150, 'ConcretePro Ltd.', 1, 'On-site Storage', '2025-01-12T09:30:00Z', '2024-01-20T10:00:00Z'),
(3, 'Glass Panels (Tempered)', 'Glass', 'panels', 85, 100, 300, 450, 'ClearView Glass Co.', 1, 'Warehouse B', '2025-01-08T14:00:00Z', '2024-03-10T11:00:00Z'),
(4, 'Copper Piping (2 inch)', 'Plumbing', 'feet', 3200, 500, 5000, 12, 'PlumbSupply Inc.', 2, 'Warehouse A', '2025-01-11T10:00:00Z', '2024-04-05T09:00:00Z'),
(5, 'Electrical Wiring (12 AWG)', 'Electrical', 'feet', 8500, 2000, 12000, 2.5, 'ElectroSupply Corp.', 2, 'Warehouse C', '2025-01-09T15:30:00Z', '2024-04-15T08:30:00Z'),
(6, 'Cement Bags (50kg)', 'Concrete', 'bags', 2800, 500, 4000, 8, 'BuildMart Supplies', 3, 'On-site Storage', '2025-01-13T11:00:00Z', '2024-06-10T07:00:00Z'),
(7, 'Medical-Grade Flooring', 'Flooring', 'sq ft', 4500, 1000, 8000, 18, 'HealthBuild Materials', 3, 'Warehouse D', '2025-01-07T16:00:00Z', '2024-07-20T10:30:00Z'),
(8, 'Aluminum Frames', 'Aluminum', 'pieces', 45, 50, 200, 280, 'AlumCraft Industries', 4, 'Warehouse B', '2025-01-06T12:00:00Z', '2024-02-28T09:00:00Z'),
(9, 'LED Light Fixtures', 'Electrical', 'units', 320, 100, 500, 85, 'BrightLight Solutions', 4, 'Warehouse C', '2025-01-10T13:45:00Z', '2024-08-15T11:00:00Z'),
(10, 'Insulation Panels', 'Insulation', 'sq ft', 12000, 3000, 20000, 4.5, 'ThermoShield Inc.', 1, 'Warehouse A', '2025-01-14T08:30:00Z', '2024-05-20T10:00:00Z');

-- Reset sequence for materials
SELECT setval('materials_id_seq', (SELECT MAX(id) FROM materials));

-- Seed Budgets
INSERT INTO budgets (id, project_id, category, description, amount, date, vendor, status, created_at) VALUES
(1, 1, 'Materials', 'Structural steel purchase - Phase 1', 2400000, '2024-02-15', 'MetalWorks Inc.', 'Paid', '2024-02-15T10:00:00Z'),
(2, 1, 'Labor', 'Foundation crew - January wages', 185000, '2024-01-31', 'Internal', 'Paid', '2024-01-31T17:00:00Z'),
(3, 1, 'Equipment', 'Tower crane rental - 6 months', 420000, '2024-03-01', 'HeavyLift Rentals', 'Paid', '2024-03-01T09:00:00Z'),
(4, 1, 'Materials', 'Glass curtain wall panels', 1850000, '2024-08-20', 'ClearView Glass Co.', 'Paid', '2024-08-20T11:30:00Z'),
(5, 2, 'Materials', 'Concrete and foundation supplies', 890000, '2024-04-10', 'ConcretePro Ltd.', 'Paid', '2024-04-10T08:00:00Z'),
(6, 2, 'Labor', 'Plumbing contractors - Q3', 245000, '2024-09-30', 'AquaFlow Plumbing', 'Paid', '2024-09-30T16:00:00Z'),
(7, 2, 'Permits', 'Building permits and inspections', 125000, '2024-03-15', 'City Planning Dept.', 'Paid', '2024-03-15T14:00:00Z'),
(8, 3, 'Materials', 'Medical-grade materials procurement', 3200000, '2024-07-01', 'HealthBuild Materials', 'Paid', '2024-07-01T10:00:00Z'),
(9, 3, 'Equipment', 'Specialized construction equipment', 780000, '2024-06-15', 'MediConstruct Equipment', 'Paid', '2024-06-15T09:30:00Z'),
(10, 4, 'Materials', 'Interior finishing materials', 1450000, '2024-11-01', 'RetailBuild Supplies', 'Paid', '2024-11-01T11:00:00Z'),
(11, 4, 'Labor', 'HVAC installation team', 320000, '2024-12-15', 'CoolAir Systems', 'Pending', '2024-12-15T15:00:00Z'),
(12, 1, 'Consulting', 'Structural engineering consultation', 175000, '2024-05-10', 'StructurePro Consulting', 'Paid', '2024-05-10T10:30:00Z');

-- Reset sequence for budgets
SELECT setval('budgets_id_seq', (SELECT MAX(id) FROM budgets));
