const API_CONFIG = {
  baseUrl: localStorage.getItem('tba_api_url') || 'https://tech-bridge-api.sundaykingsley1210.workers.dev',
};

const API = {
  token: localStorage.getItem('tba_token'),

  setBaseUrl(url) {
    API_CONFIG.baseUrl = url;
    localStorage.setItem('tba_api_url', url);
  },

  setToken(t) {
    this.token = t;
    if (t) localStorage.setItem('tba_token', t);
    else localStorage.removeItem('tba_token');
  },

  async request(path, opts = {}) {
    const url = API_CONFIG.baseUrl + path;
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    const res = await fetch(url, { ...opts, headers: { ...headers, ...opts.headers } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); },
  put(path, body) { return this.request(path, { method: 'PUT', body: JSON.stringify(body) }); },
  del(path) { return this.request(path, { method: 'DELETE' }); },

  async signUp(email, password, meta = {}) {
    const data = await this.post('/api/auth/signup', { email, password, ...meta });
    this.setToken(data.token);
    return data;
  },

  async signIn(email, password) {
    const data = await this.post('/api/auth/signin', { email, password });
    this.setToken(data.token);
    return data;
  },

  async createUser(email, password, meta = {}) {
    return this.post('/api/auth/signup', { email, password, ...meta });
  },

  async me() { return this.get('/api/auth/me'); },
  signOut() { this.setToken(null); localStorage.removeItem('tba_currentUser'); },

  users: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/users' + (q ? '?' + q : '')); },
    get(id) { return API.get('/api/users/' + id); },
    update(id, data) { return API.put('/api/users/' + id, data); },
    delete(id) { return API.del('/api/users/' + id); },
  },

  applications: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/applications' + (q ? '?' + q : '')); },
    get(id) { return API.get('/api/applications/' + id); },
    create(data) { return API.post('/api/applications', data); },
    update(id, data) { return API.put('/api/applications/' + id, data); },
    delete(id) { return API.del('/api/applications/' + id); },
  },

  results: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/results' + (q ? '?' + q : '')); },
    create(data) { return API.post('/api/results', data); },
    update(data) { return API.put('/api/results', data); },
  },

  assignments: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/assignments' + (q ? '?' + q : '')); },
    create(data) { return API.post('/api/assignments', data); },
    delete(id) { return API.del('/api/assignments/' + id); },
  },

  submissions: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/submissions' + (q ? '?' + q : '')); },
    create(data) { return API.post('/api/submissions', data); },
    update(data) { return API.put('/api/submissions', data); },
  },

  examQuestions: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/exam-questions' + (q ? '?' + q : '')); },
    save(data) { return API.post('/api/exam-questions', data); },
  },

  examSubmissions: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/exam-submissions' + (q ? '?' + q : '')); },
    create(data) { return API.post('/api/exam-submissions', data); },
  },

  timetable: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/timetable' + (q ? '?' + q : '')); },
    save(data) { return API.post('/api/timetable', data); },
  },

  notifications: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/notifications' + (q ? '?' + q : '')); },
    create(data) { return API.post('/api/notifications', data); },
  },

  messages: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/messages' + (q ? '?' + q : '')); },
    create(data) { return API.post('/api/messages', data); },
    update(data) { return API.put('/api/messages', data); },
  },

  payments: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/payments' + (q ? '?' + q : '')); },
    create(data) { return API.post('/api/payments', data); },
    update(data) { return API.put('/api/payments', data); },
  },

  bankDetails: {
    list() { return API.get('/api/bank-details'); },
    create(data) { return API.post('/api/bank-details', data); },
  },

  fees: {
    list() { return API.get('/api/fees'); },
    save(data) { return API.post('/api/fees', data); },
  },

  examSchedule: {
    list() { return API.get('/api/exam-schedule'); },
    save(data) { return API.post('/api/exam-schedule', data); },
  },

  teacherResults: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/teacher-results' + (q ? '?' + q : '')); },
    save(data) { return API.post('/api/teacher-results', data); },
  },

  passwordResets: {
    list(params = {}) { const q = new URLSearchParams(params).toString(); return API.get('/api/password-resets' + (q ? '?' + q : '')); },
    create(data) { return API.post('/api/password-resets', data); },
    update(data) { return API.put('/api/password-resets', data); },
    delete(params) { const q = new URLSearchParams(params).toString(); return API.del('/api/password-resets?' + q); },
  },

  settings: {
    get(key) { return API.get('/api/settings?key=' + key); },
    save(data) { return API.post('/api/settings', data); },
  },
};
