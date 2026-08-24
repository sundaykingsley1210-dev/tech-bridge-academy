CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student','teacher','admin')),
  class TEXT,
  gender TEXT,
  subject TEXT,
  phone TEXT,
  address TEXT,
  profile_pic TEXT,
  dob TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  ref_number TEXT,
  first_name TEXT,
  last_name TEXT,
  gender TEXT,
  dob TEXT,
  class_applying TEXT,
  class_applied TEXT,
  prev_school TEXT,
  previous_school TEXT,
  parent_name TEXT,
  parent_occupation TEXT,
  relationship TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  address TEXT,
  student_email TEXT,
  student_password TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'Pending',
  date_submitted TEXT DEFAULT (datetime('now')),
  admitted_at TEXT,
  approved_at TEXT
);

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  student_name TEXT,
  class TEXT,
  subject TEXT,
  term TEXT,
  session TEXT,
  grade TEXT,
  ca1 REAL,
  ca2 REAL,
  exam REAL,
  total REAL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  class TEXT,
  teacher_id TEXT,
  teacher_name TEXT,
  deadline TEXT,
  questions TEXT,
  max_score REAL DEFAULT 20,
  instructions TEXT,
  target_class TEXT,
  status TEXT DEFAULT 'Active',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT,
  student_id TEXT,
  student_name TEXT,
  content TEXT,
  file_url TEXT,
  answers TEXT,
  score REAL,
  max_score REAL,
  status TEXT DEFAULT 'submitted',
  created_at TEXT DEFAULT (datetime('now')),
  submitted_at TEXT
);

CREATE TABLE IF NOT EXISTS exam_questions (
  id TEXT PRIMARY KEY,
  subject TEXT,
  class TEXT,
  term TEXT,
  questions TEXT,
  teacher_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exam_submissions (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  student_name TEXT,
  class TEXT,
  subject TEXT,
  term TEXT,
  answers TEXT,
  score REAL,
  total_marks REAL,
  total_questions REAL,
  submitted_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS timetable (
  id TEXT PRIMARY KEY,
  class TEXT,
  day TEXT,
  periods TEXT,
  teacher_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  from_id TEXT,
  from_name TEXT,
  from_role TEXT,
  title TEXT,
  message TEXT,
  target_class TEXT,
  target_role TEXT DEFAULT 'student',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  from_id TEXT,
  to_id TEXT,
  from_name TEXT,
  from_role TEXT,
  to_name TEXT,
  subject TEXT,
  message TEXT,
  content TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  student_name TEXT,
  student_class TEXT,
  class TEXT,
  amount REAL,
  bank TEXT,
  teller TEXT,
  session TEXT,
  term TEXT,
  description TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bank_details (
  id TEXT PRIMARY KEY,
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fees (
  id TEXT PRIMARY KEY,
  class TEXT UNIQUE,
  amount REAL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exam_schedule (
  id TEXT PRIMARY KEY,
  class TEXT,
  subject TEXT,
  date TEXT,
  time TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS teacher_results (
  id TEXT PRIMARY KEY,
  teacher_id TEXT,
  class TEXT,
  subject TEXT,
  term TEXT,
  results TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  role TEXT,
  name TEXT,
  email TEXT,
  status TEXT DEFAULT 'pending',
  requested_at TEXT DEFAULT (datetime('now')),
  approved_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
