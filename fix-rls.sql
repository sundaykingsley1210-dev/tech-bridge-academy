-- FIX RLS + SCHEMA: Bypass Supabase Auth, allow all operations with anon key
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Fix users table: remove FK to auth.users, add password column
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Disable RLS on ALL tables (we manage auth at application level)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE id_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE results DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE timetable DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_results DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (they reference auth.uid() which no longer works)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admin can update all users" ON users;

DROP POLICY IF EXISTS "Students can view own results" ON results;
DROP POLICY IF EXISTS "Teachers can view class results" ON results;
DROP POLICY IF EXISTS "Admin can view all results" ON results;
DROP POLICY IF EXISTS "Teachers can insert results" ON results;

DROP POLICY IF EXISTS "Anyone can view assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can manage assignments" ON assignments;

DROP POLICY IF EXISTS "Students can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Students can insert own submissions" ON submissions;
DROP POLICY IF EXISTS "Teachers can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Teachers can update submissions" ON submissions;

DROP POLICY IF EXISTS "Anyone can view exam questions" ON exam_questions;
DROP POLICY IF EXISTS "Teachers can manage exam questions" ON exam_questions;

DROP POLICY IF EXISTS "Students can view own exam subs" ON exam_submissions;
DROP POLICY IF EXISTS "Students can insert own exam subs" ON exam_submissions;
DROP POLICY IF EXISTS "Teachers can view all exam subs" ON exam_submissions;

DROP POLICY IF EXISTS "Anyone can view timetable" ON timetable;
DROP POLICY IF EXISTS "Admin can manage timetable" ON timetable;

DROP POLICY IF EXISTS "Anyone can view notifications" ON notifications;
DROP POLICY IF EXISTS "Teachers can insert notifications" ON notifications;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

DROP POLICY IF EXISTS "Students can view own payments" ON payments;
DROP POLICY IF EXISTS "Students can insert own payments" ON payments;
DROP POLICY IF EXISTS "Admin can view all payments" ON payments;
DROP POLICY IF EXISTS "Admin can update payments" ON payments;

DROP POLICY IF EXISTS "Anyone can view bank details" ON bank_details;
DROP POLICY IF EXISTS "Admin can manage bank details" ON bank_details;

DROP POLICY IF EXISTS "Anyone can view fees" ON fees;
DROP POLICY IF EXISTS "Admin can manage fees" ON fees;

DROP POLICY IF EXISTS "Anyone can view exam schedule" ON exam_schedule;
DROP POLICY IF EXISTS "Admin can manage exam schedule" ON exam_schedule;

DROP POLICY IF EXISTS "Anyone can view applications" ON applications;
DROP POLICY IF EXISTS "Anyone can insert applications" ON applications;
DROP POLICY IF EXISTS "Admin can update applications" ON applications;

DROP POLICY IF EXISTS "Teachers can view own results" ON teacher_results;
DROP POLICY IF EXISTS "Admin can view all teacher results" ON teacher_results;
DROP POLICY IF EXISTS "Teachers can manage own results" ON teacher_results;
