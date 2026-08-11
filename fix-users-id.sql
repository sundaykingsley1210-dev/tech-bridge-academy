-- FIX: Change users.id from INTEGER to UUID
-- Run this in Supabase SQL Editor if you get "invalid input syntax for type integer" error

-- Step 1: Drop dependent tables first
DROP TABLE IF EXISTS id_cards CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exam_submissions CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bank_details CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS exam_schedule CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS teacher_results CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;

-- Step 2: Drop and recreate users table with correct UUID type
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    class TEXT,
    gender TEXT,
    subject TEXT,
    phone TEXT,
    address TEXT,
    profile_pic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Recreate all dependent tables
CREATE TABLE IF NOT EXISTS id_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    gender TEXT,
    position TEXT,
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_name TEXT,
    class TEXT,
    subject TEXT,
    ca1 NUMERIC,
    ca2 NUMERIC,
    exam NUMERIC,
    total NUMERIC,
    grade TEXT,
    term TEXT,
    session TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    class TEXT,
    teacher_id UUID REFERENCES users(id),
    teacher_name TEXT,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id),
    student_name TEXT,
    content TEXT,
    file_url TEXT,
    score NUMERIC,
    status TEXT DEFAULT 'submitted',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_questions (
    id TEXT PRIMARY KEY,
    subject TEXT,
    class TEXT,
    term TEXT,
    questions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    student_name TEXT,
    class TEXT,
    subject TEXT,
    term TEXT,
    answers JSONB,
    score NUMERIC,
    total_questions NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetable (
    id TEXT PRIMARY KEY,
    class TEXT,
    day TEXT,
    periods JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    message TEXT,
    target_class TEXT,
    target_role TEXT,
    from_name TEXT,
    from_role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_id UUID REFERENCES users(id),
    from_name TEXT,
    from_role TEXT,
    to_id UUID REFERENCES users(id),
    to_name TEXT,
    content TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    student_name TEXT,
    class TEXT,
    amount NUMERIC,
    description TEXT,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT,
    account_name TEXT,
    account_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class TEXT UNIQUE,
    amount NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_schedule (
    id TEXT PRIMARY KEY,
    class TEXT,
    subject TEXT,
    date TEXT,
    time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    phone TEXT,
    previous_school TEXT,
    class_applied TEXT,
    status TEXT DEFAULT 'pending',
    date_submitted TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_results (
    id TEXT PRIMARY KEY,
    teacher_id UUID REFERENCES users(id),
    class TEXT,
    subject TEXT,
    results JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    role TEXT,
    name TEXT,
    email TEXT,
    status TEXT DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Enable RLS and create policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (simple policy)
CREATE POLICY "Allow all for authenticated" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON id_cards FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON results FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON assignments FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON submissions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON applications FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON password_resets FOR ALL USING (true);

-- Step 5: Seed fee data
INSERT INTO fees (class, amount) VALUES
('Nursery 1', 45000), ('Nursery 2', 45000),
('Primary 1', 50000), ('Primary 2', 50000), ('Primary 3', 50000),
('Primary 4', 55000), ('Primary 5', 55000), ('Primary 6', 55000),
('JSS 1', 60000), ('JSS 2', 60000), ('JSS 3', 65000),
('SSS 1', 70000), ('SSS 2', 70000), ('SSS 3', 75000)
ON CONFLICT (class) DO NOTHING;
