-- TECH-BRIDGE ACADEMY Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Users table (extends Supabase auth)
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ID Cards
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

-- 3. Results
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    term TEXT NOT NULL,
    ca1 NUMERIC DEFAULT 0,
    ca2 NUMERIC DEFAULT 0,
    exam NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    class TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    target_class TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    max_score NUMERIC DEFAULT 20,
    instructions TEXT,
    questions JSONB DEFAULT '[]',
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Assignment Submissions
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    answers JSONB DEFAULT '[]',
    score NUMERIC DEFAULT 0,
    max_score NUMERIC DEFAULT 20,
    status TEXT DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Exam Questions
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    class TEXT NOT NULL,
    term TEXT DEFAULT 'First Term',
    questions JSONB DEFAULT '[]',
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Exam Submissions
CREATE TABLE IF NOT EXISTS exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    class TEXT NOT NULL,
    term TEXT DEFAULT 'First Term',
    answers JSONB DEFAULT '[]',
    score NUMERIC DEFAULT 0,
    total_marks NUMERIC DEFAULT 60,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Timetable
CREATE TABLE IF NOT EXISTS timetable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class TEXT NOT NULL,
    day TEXT NOT NULL,
    periods JSONB DEFAULT '[]',
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_id UUID REFERENCES users(id) ON DELETE SET NULL,
    from_name TEXT,
    from_role TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_class TEXT,
    target_role TEXT DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Messages (student ↔ admin)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_id UUID REFERENCES users(id) ON DELETE CASCADE,
    from_name TEXT,
    from_role TEXT,
    to_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_name TEXT,
    student_class TEXT,
    amount NUMERIC NOT NULL,
    bank TEXT,
    teller TEXT,
    session TEXT,
    term TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Bank Details
CREATE TABLE IF NOT EXISTS bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Fee Structure
CREATE TABLE IF NOT EXISTS fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class TEXT UNIQUE NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Exam Schedule
CREATE TABLE IF NOT EXISTS exam_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class TEXT NOT NULL,
    date DATE,
    time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Applications (admission)
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    dob DATE,
    gender TEXT,
    class_applying TEXT,
    prev_school TEXT,
    parent_name TEXT,
    relationship TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    address TEXT,
    status TEXT DEFAULT 'Pending',
    date_submitted TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Teacher Results
CREATE TABLE IF NOT EXISTS teacher_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT,
    class TEXT,
    term TEXT,
    results JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read their own data, admins can read all
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can update all users" ON users FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Results policies
CREATE POLICY "Students can view own results" ON results FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view class results" ON results FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "Admin can view all results" ON results FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Teachers can insert results" ON results FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Assignments policies
CREATE POLICY "Anyone can view assignments" ON assignments FOR SELECT USING (true);
CREATE POLICY "Teachers can manage assignments" ON assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Submissions policies
CREATE POLICY "Students can view own submissions" ON submissions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers can view all submissions" ON submissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);
CREATE POLICY "Teachers can update submissions" ON submissions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Exam questions policies
CREATE POLICY "Anyone can view exam questions" ON exam_questions FOR SELECT USING (true);
CREATE POLICY "Teachers can manage exam questions" ON exam_questions FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Exam submissions policies
CREATE POLICY "Students can view own exam subs" ON exam_submissions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own exam subs" ON exam_submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers can view all exam subs" ON exam_submissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Timetable policies
CREATE POLICY "Anyone can view timetable" ON timetable FOR SELECT USING (true);
CREATE POLICY "Admin can manage timetable" ON timetable FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications policies
CREATE POLICY "Anyone can view notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Teachers can insert notifications" ON notifications FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = from_id OR auth.uid() = to_id);
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (auth.uid() = from_id);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (auth.uid() = to_id);

-- Payments policies
CREATE POLICY "Students can view own payments" ON payments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Admin can view all payments" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can update payments" ON payments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Bank details policies
CREATE POLICY "Anyone can view bank details" ON bank_details FOR SELECT USING (true);
CREATE POLICY "Admin can manage bank details" ON bank_details FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Fees policies
CREATE POLICY "Anyone can view fees" ON fees FOR SELECT USING (true);
CREATE POLICY "Admin can manage fees" ON fees FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Exam schedule policies
CREATE POLICY "Anyone can view exam schedule" ON exam_schedule FOR SELECT USING (true);
CREATE POLICY "Admin can manage exam schedule" ON exam_schedule FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Applications policies
CREATE POLICY "Anyone can view applications" ON applications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update applications" ON applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Teacher results policies
CREATE POLICY "Teachers can view own results" ON teacher_results FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Admin can view all teacher results" ON teacher_results FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Teachers can manage own results" ON teacher_results FOR ALL USING (auth.uid() = teacher_id);

-- Seed default admin user (run after creating admin account)
-- INSERT INTO users (id, email, name, role) VALUES ('your-admin-uuid', 'admin@techbridge.edu', 'Admin', 'admin');

-- Seed fee structure
INSERT INTO fees (class, amount) VALUES
('JSS 1', 45000), ('JSS 2', 45000), ('JSS 3', 50000),
('SSS 1', 55000), ('SSS 2', 55000), ('SSS 3', 60000),
('Nursery 1', 35000), ('Nursery 2', 35000),
('Primary 1', 38000), ('Primary 2', 38000), ('Primary 3', 40000),
('Primary 4', 40000), ('Primary 5', 42000), ('Primary 6', 42000)
ON CONFLICT (class) DO NOTHING;
