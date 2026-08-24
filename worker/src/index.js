export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response;
      if (path.startsWith('/api/auth/')) response = await handleAuth(request, env);
      else if (path.startsWith('/api/users')) response = await handleUsers(request, env);
      else if (path.startsWith('/api/applications')) response = await handleApplications(request, env);
      else if (path.startsWith('/api/results')) response = await handleResults(request, env);
      else if (path.startsWith('/api/assignments')) response = await handleAssignments(request, env);
      else if (path.startsWith('/api/submissions')) response = await handleSubmissions(request, env);
      else if (path.startsWith('/api/exam-questions')) response = await handleExamQuestions(request, env);
      else if (path.startsWith('/api/exam-submissions')) response = await handleExamSubmissions(request, env);
      else if (path.startsWith('/api/timetable')) response = await handleTimetable(request, env);
      else if (path.startsWith('/api/notifications')) response = await handleNotifications(request, env);
      else if (path.startsWith('/api/messages')) response = await handleMessages(request, env);
      else if (path.startsWith('/api/payments')) response = await handlePayments(request, env);
      else if (path.startsWith('/api/bank-details')) response = await handleBankDetails(request, env);
      else if (path.startsWith('/api/fees')) response = await handleFees(request, env);
      else if (path.startsWith('/api/exam-schedule')) response = await handleExamSchedule(request, env);
      else if (path.startsWith('/api/teacher-results')) response = await handleTeacherResults(request, env);
      else if (path.startsWith('/api/password-resets')) response = await handlePasswordResets(request, env);
      else if (path.startsWith('/api/settings')) response = await handleSettings(request, env);
      else return new Response('Not Found', { status: 404, headers: corsHeaders });

      const newHeaders = new Headers(response.headers);
      for (const [k, v] of Object.entries(corsHeaders)) newHeaders.set(k, v);
      return new Response(response.body, { status: response.status, headers: newHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function genId() {
  return crypto.randomUUID();
}

function hashPassword(pw) {
  let hash = 0;
  for (let i = 0; i < pw.length; i++) {
    const char = pw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

function verifyPassword(pw, stored) {
  if (stored.startsWith('h_')) return hashPassword(pw) === stored;
  return pw === stored;
}

function createToken(user, secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  }));
  const sig = btoa(secret + '.' + header + '.' + payload);
  return header + '.' + payload + '.' + sig;
}

function verifyToken(request, secret) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Date.now()) return null;
    const expectedSig = btoa(secret + '.' + parts[0] + '.' + parts[1]);
    if (parts[2] !== expectedSig) return null;
    return payload;
  } catch {
    return null;
  }
}

function getBody(request) {
  return request.json();
}

function getPathId(path, prefix) {
  const rest = path.slice(prefix.length);
  const parts = rest.split('/').filter(Boolean);
  return parts[0] || null;
}

function getQuery(url) {
  const params = {};
  for (const [k, v] of url.searchParams) params[k] = v;
  return params;
}

async function handleAuth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (path === '/api/auth/signup' && method === 'POST') {
    const body = await getBody(request);
    const { email, password, name, role, class: cls, subject, phone } = body;
    if (!email || !password) return json({ error: 'Email and password required' }, 400);
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) return json({ error: 'Email already registered' }, 400);
    const id = genId();
    await env.DB.prepare('INSERT INTO users (id, email, name, password, role, class, subject, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(id, email, name || email.split('@')[0], hashPassword(password), role || 'student', cls || null, subject || null, phone || null).run();
    const user = { id, email, name: name || email.split('@')[0], role: role || 'student', class: cls || null, subject: subject || null, phone: phone || null };
    const token = createToken(user, env.JWT_SECRET);
    return json({ user, token });
  }

  if (path === '/api/auth/signin' && method === 'POST') {
    const body = await getBody(request);
    const { email, password } = body;
    if (!email || !password) return json({ error: 'Email and password required' }, 400);
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user || !verifyPassword(password, user.password)) return json({ error: 'Invalid email or password' }, 401);
    const { password: _, ...safeUser } = user;
    const token = createToken(safeUser, env.JWT_SECRET);
    return json({ user: safeUser, token });
  }

  if (path === '/api/auth/me' && method === 'GET') {
    const payload = verifyToken(request, env.JWT_SECRET);
    if (!payload) return json({ error: 'Unauthorized' }, 401);
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.sub).first();
    if (!user) return json({ error: 'User not found' }, 404);
    const { password: _, ...safeUser } = user;
    return json({ user: safeUser });
  }

  return json({ error: 'Not found' }, 404);
}

async function handleUsers(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET' && path === '/api/users') {
    let sql = 'SELECT id, email, name, role, class, gender, subject, phone, address, profile_pic, dob, created_at FROM users WHERE 1=1';
    const params = [];
    if (query.role) { sql += ' AND role = ?'; params.push(query.role); }
    if (query.class) { sql += ' AND class = ?'; params.push(query.class); }
    if (query.id) { sql += ' AND id = ?'; params.push(query.id); }
    if (query.email) { sql += ' AND email = ?'; params.push(query.email); }
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  const id = getPathId(path, '/api/users/');
  if (!id) return json({ error: 'Invalid path' }, 400);

  if (method === 'GET') {
    const user = await env.DB.prepare('SELECT id, email, name, role, class, gender, subject, phone, address, profile_pic, dob, created_at FROM users WHERE id = ?').bind(id).first();
    if (!user) return json({ error: 'Not found' }, 404);
    return json(user);
  }

  if (method === 'PUT') {
    const body = await getBody(request);
    const fields = [];
    const params = [];
    for (const [k, v] of Object.entries(body)) {
      if (k === 'id' || k === 'created_at') continue;
      if (k === 'password' && v) { fields.push('password = ?'); params.push(hashPassword(v)); }
      else { fields.push(`${k} = ?`); params.push(v); }
    }
    if (fields.length === 0) return json({ error: 'No fields to update' }, 400);
    params.push(id);
    await env.DB.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
    return json({ success: true });
  }

  if (method === 'DELETE') {
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleApplications(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET' && path === '/api/applications') {
    let sql = 'SELECT * FROM applications WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    if (query.id) { sql += ' AND id = ?'; params.push(query.id); }
    if (query.student_email) { sql += ' AND student_email = ?'; params.push(query.student_email); }
    sql += ' ORDER BY date_submitted DESC';
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST' && path === '/api/applications') {
    const body = await getBody(request);
    const id = body.id || genId();
    const ref = body.ref_number || ('TBA' + Date.now().toString(36).toUpperCase());
    const b = (v) => v === undefined ? null : v;
    await env.DB.prepare('INSERT OR REPLACE INTO applications (id, ref_number, first_name, last_name, gender, dob, class_applying, class_applied, prev_school, previous_school, parent_name, parent_occupation, relationship, parent_phone, parent_email, address, student_email, student_password, name, email, phone, status, date_submitted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))').bind(id, ref, b(body.first_name), b(body.last_name), b(body.gender), b(body.dob), b(body.class_applying), b(body.class_applied), b(body.prev_school), b(body.previous_school), b(body.parent_name), b(body.parent_occupation), b(body.relationship), b(body.parent_phone), b(body.parent_email), b(body.address), b(body.student_email), b(body.student_password), b(body.name), b(body.email), b(body.phone), b(body.status) || 'Pending').run();
    return json({ id, ref_number: ref });
  }

  const id = getPathId(path, '/api/applications/');
  if (!id) return json({ error: 'Invalid path' }, 400);

  if (method === 'GET') {
    const app = await env.DB.prepare('SELECT * FROM applications WHERE id = ?').bind(id).first();
    if (!app) return json({ error: 'Not found' }, 404);
    return json(app);
  }

  if (method === 'PUT') {
    const body = await getBody(request);
    const fields = [];
    const params = [];
    for (const [k, v] of Object.entries(body)) {
      if (k === 'id') continue;
      fields.push(`${k} = ?`);
      params.push(v);
    }
    params.push(id);
    await env.DB.prepare(`UPDATE applications SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
    return json({ success: true });
  }

  if (method === 'DELETE') {
    await env.DB.prepare('DELETE FROM applications WHERE id = ?').bind(id).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleResults(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    let sql = 'SELECT * FROM results WHERE 1=1';
    const params = [];
    if (query.student_id) { sql += ' AND student_id = ?'; params.push(query.student_id); }
    if (query.class) { sql += ' AND class = ?'; params.push(query.class); }
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT INTO results (id, student_id, student_name, class, subject, term, session, grade, ca1, ca2, exam, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, body.student_id, body.student_name, body.class, body.subject, body.term, body.session, body.grade, body.ca1, body.ca2, body.exam, body.total).run();
    return json({ id });
  }

  if (method === 'PUT') {
    const body = await getBody(request);
    const id = body.id;
    if (!id) return json({ error: 'id required' }, 400);
    const fields = [];
    const params = [];
    for (const [k, v] of Object.entries(body)) {
      if (k === 'id') continue;
      fields.push(`${k} = ?`);
      params.push(v);
    }
    params.push(id);
    await env.DB.prepare(`UPDATE results SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleAssignments(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    let sql = 'SELECT * FROM assignments WHERE 1=1';
    const params = [];
    if (query.teacher_id) { sql += ' AND teacher_id = ?'; params.push(query.teacher_id); }
    if (query.class) { sql += ' AND class = ?'; params.push(query.class); }
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT INTO assignments (id, title, description, subject, class, teacher_id, teacher_name, deadline, questions, max_score, instructions, target_class, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, body.title, body.description, body.subject, body.class, body.teacher_id, body.teacher_name, body.deadline, body.questions ? JSON.stringify(body.questions) : null, body.max_score || 20, body.instructions, body.target_class, body.status || 'Active').run();
    return json({ id });
  }

  const id = getPathId(path, '/api/assignments/');
  if (id && method === 'DELETE') {
    await env.DB.prepare('DELETE FROM assignments WHERE id = ?').bind(id).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleSubmissions(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    let sql = 'SELECT * FROM submissions WHERE 1=1';
    const params = [];
    if (query.student_id) { sql += ' AND student_id = ?'; params.push(query.student_id); }
    if (query.assignment_id) { sql += ' AND assignment_id = ?'; params.push(query.assignment_id); }
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT INTO submissions (id, assignment_id, student_id, student_name, content, file_url, answers, score, max_score, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))').bind(id, body.assignment_id, body.student_id, body.student_name, body.content, body.file_url, body.answers ? JSON.stringify(body.answers) : null, body.score, body.max_score, body.status || 'submitted').run();
    return json({ id });
  }

  if (method === 'PUT') {
    const body = await getBody(request);
    const id = body.id;
    if (!id) return json({ error: 'id required' }, 400);
    const fields = [];
    const params = [];
    for (const [k, v] of Object.entries(body)) {
      if (k === 'id') continue;
      fields.push(`${k} = ?`);
      params.push(v);
    }
    params.push(id);
    await env.DB.prepare(`UPDATE submissions SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleExamQuestions(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    let sql = 'SELECT * FROM exam_questions WHERE 1=1';
    const params = [];
    if (query.subject) { sql += ' AND subject = ?'; params.push(query.subject); }
    if (query.class) { sql += ' AND class = ?'; params.push(query.class); }
    if (query.term) { sql += ' AND term = ?'; params.push(query.term); }
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST' || method === 'PUT') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT OR REPLACE INTO exam_questions (id, subject, class, term, questions, teacher_id) VALUES (?, ?, ?, ?, ?, ?)').bind(id, body.subject, body.class, body.term, body.questions ? JSON.stringify(body.questions) : null, body.teacher_id).run();
    return json({ id });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleExamSubmissions(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    let sql = 'SELECT * FROM exam_submissions WHERE 1=1';
    const params = [];
    if (query.student_id) { sql += ' AND student_id = ?'; params.push(query.student_id); }
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT INTO exam_submissions (id, student_id, student_name, class, subject, term, answers, score, total_marks, total_questions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, body.student_id, body.student_name, body.class, body.subject, body.term, body.answers ? JSON.stringify(body.answers) : null, body.score, body.total_marks, body.total_questions).run();
    return json({ id });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleTimetable(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    let sql = 'SELECT * FROM timetable WHERE 1=1';
    const params = [];
    if (query.class) { sql += ' AND class = ?'; params.push(query.class); }
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST' || method === 'PUT') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT OR REPLACE INTO timetable (id, class, day, periods, teacher_id) VALUES (?, ?, ?, ?, ?)').bind(id, body.class, body.day, body.periods ? JSON.stringify(body.periods) : null, body.teacher_id).run();
    return json({ id });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleNotifications(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    let sql = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    if (query.target_role) { sql += ' AND target_role = ?'; params.push(query.target_role); }
    if (query.target_class) { sql += ' AND (target_class IS NULL OR target_class = ?)'; params.push(query.target_class); }
    sql += ' ORDER BY created_at DESC';
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT INTO notifications (id, from_id, from_name, from_role, title, message, target_class, target_role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(id, body.from_id, body.from_name, body.from_role, body.title, body.message, body.target_class, body.target_role || 'student').run();
    return json({ id });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleMessages(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    let sql = 'SELECT * FROM messages WHERE 1=1';
    const params = [];
    if (query.from_id) { sql += ' AND from_id = ?'; params.push(query.from_id); }
    if (query.to_id) { sql += ' AND to_id = ?'; params.push(query.to_id); }
    if (query.id) { sql += ' AND id = ?'; params.push(query.id); }
    if (query.user_id) { sql += ' AND (from_id = ? OR to_id = ?)'; params.push(query.user_id, query.user_id); }
    sql += ' ORDER BY created_at DESC';
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT INTO messages (id, from_id, to_id, from_name, from_role, to_name, subject, message, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, body.from_id, body.to_id, body.from_name, body.from_role, body.to_name, body.subject, body.message, body.content).run();
    return json({ id });
  }

  if (method === 'PUT') {
    const body = await getBody(request);
    const id = body.id;
    if (!id) return json({ error: 'id required' }, 400);
    const fields = [];
    const params = [];
    for (const [k, v] of Object.entries(body)) {
      if (k === 'id') continue;
      fields.push(`${k} = ?`);
      params.push(v);
    }
    params.push(id);
    await env.DB.prepare(`UPDATE messages SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handlePayments(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    let sql = 'SELECT * FROM payments WHERE 1=1';
    const params = [];
    if (query.student_id) { sql += ' AND student_id = ?'; params.push(query.student_id); }
    sql += ' ORDER BY submitted_at DESC';
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT INTO payments (id, student_id, student_name, student_class, class, amount, bank, teller, session, term, description, receipt_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, body.student_id, body.student_name, body.student_class, body.class, body.amount, body.bank, body.teller, body.session, body.term, body.description, body.receipt_url, body.status || 'pending').run();
    return json({ id });
  }

  if (method === 'PUT') {
    const body = await getBody(request);
    const id = body.id;
    if (!id) return json({ error: 'id required' }, 400);
    const fields = [];
    const params = [];
    for (const [k, v] of Object.entries(body)) {
      if (k === 'id') continue;
      fields.push(`${k} = ?`);
      params.push(v);
    }
    params.push(id);
    await env.DB.prepare(`UPDATE payments SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleBankDetails(request, env) {
  const url = new URL(request.url);
  const method = request.method;

  if (method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM bank_details ORDER BY created_at DESC').all();
    return json(results);
  }

  if (method === 'POST') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT INTO bank_details (id, bank_name, account_name, account_number) VALUES (?, ?, ?, ?)').bind(id, body.bank_name, body.account_name, body.account_number).run();
    return json({ id });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleFees(request, env) {
  const url = new URL(request.url);
  const method = request.method;

  if (method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM fees').all();
    return json(results);
  }

  if (method === 'POST' || method === 'PUT') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT OR REPLACE INTO fees (id, class, amount) VALUES (?, ?, ?)').bind(id, body.class, body.amount).run();
    return json({ id });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleExamSchedule(request, env) {
  const url = new URL(request.url);
  const method = request.method;

  if (method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM exam_schedule').all();
    return json(results);
  }

  if (method === 'POST' || method === 'PUT') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT OR REPLACE INTO exam_schedule (id, class, subject, date, time) VALUES (?, ?, ?, ?, ?)').bind(id, body.class, body.subject, body.date, body.time).run();
    return json({ id });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleTeacherResults(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    let sql = 'SELECT * FROM teacher_results WHERE 1=1';
    const params = [];
    if (query.teacher_id) { sql += ' AND teacher_id = ?'; params.push(query.teacher_id); }
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST' || method === 'PUT') {
    const body = await getBody(request);
    const id = body.id || genId();
    await env.DB.prepare('INSERT OR REPLACE INTO teacher_results (id, teacher_id, class, subject, term, results) VALUES (?, ?, ?, ?, ?, ?)').bind(id, body.teacher_id, body.class, body.subject, body.term, body.results ? JSON.stringify(body.results) : null).run();
    return json({ id });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handlePasswordResets(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    let sql = 'SELECT * FROM password_resets WHERE 1=1';
    const params = [];
    if (query.email) { sql += ' AND email = ?'; params.push(query.email); }
    if (query.role) { sql += ' AND role = ?'; params.push(query.role); }
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    sql += ' ORDER BY requested_at DESC';
    const stmt = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
    const { results } = await stmt.all();
    return json(results);
  }

  if (method === 'POST') {
    const body = await getBody(request);
    const id = body.id || ('RST' + Date.now().toString(36).toUpperCase());
    await env.DB.prepare('INSERT INTO password_resets (id, role, name, email, status, requested_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))').bind(id, body.role, body.name, body.email, body.status || 'pending').run();
    return json({ id });
  }

  if (method === 'PUT') {
    const body = await getBody(request);
    const id = body.id;
    if (!id) return json({ error: 'id required' }, 400);
    const fields = [];
    const params = [];
    for (const [k, v] of Object.entries(body)) {
      if (k === 'id') continue;
      fields.push(`${k} = ?`);
      params.push(v);
    }
    params.push(id);
    await env.DB.prepare(`UPDATE password_resets SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
    return json({ success: true });
  }

  if (method === 'DELETE') {
    const id = query.id;
    const email = query.email;
    if (id) await env.DB.prepare('DELETE FROM password_resets WHERE id = ?').bind(id).run();
    else if (email) await env.DB.prepare('DELETE FROM password_resets WHERE email = ?').bind(email).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleSettings(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const query = getQuery(url);

  if (method === 'GET') {
    if (query.key) {
      const setting = await env.DB.prepare('SELECT * FROM settings WHERE key = ?').bind(query.key).first();
      return json(setting || {});
    }
    const { results } = await env.DB.prepare('SELECT * FROM settings').all();
    return json(results);
  }

  if (method === 'POST' || method === 'PUT') {
    const body = await getBody(request);
    await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind(body.key, body.value).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}
