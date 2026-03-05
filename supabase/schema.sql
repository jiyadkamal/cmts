-- =============================================
-- CMTS Database Schema for Supabase
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- Projects table
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    client TEXT,
    location TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    status TEXT DEFAULT 'Planning',
    progress INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'Medium',
    manager TEXT,
    milestones JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Todo',
    priority TEXT DEFAULT 'Medium',
    assignee TEXT,
    assignee_id INTEGER,
    due_date DATE,
    estimated_hours INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials table
CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 100,
    unit_price DECIMAL(10,2),
    supplier TEXT,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    location TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets (expenses) table
CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    category TEXT,
    description TEXT,
    amount DECIMAL(15,2),
    date DATE,
    vendor TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'Client',
    department TEXT,
    phone TEXT,
    avatar TEXT,
    status TEXT DEFAULT 'Active',
    joined_at DATE DEFAULT CURRENT_DATE
);

-- =============================================
-- Row Level Security (RLS) - Enable for all tables
-- For now, allow all authenticated and anonymous access
-- =============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (can be refined later)
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on materials" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on budgets" ON budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);
