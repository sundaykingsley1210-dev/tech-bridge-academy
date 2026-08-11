// Supabase Configuration for TECH-BRIDGE ACADEMY
// Replace these values with your actual Supabase project credentials

const SUPABASE_URL = 'https://ljhritlqicnlppwcoijw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3DWixMg6ElVnJD08vOQJAA_-2Y0Pate';

// Initialize Supabase client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Helper: get current user from Supabase auth
async function getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper: sign up with email/password
async function signUp(email, password, metadata = {}) {
    if (!supabase) throw new Error('Supabase not initialized');
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
    });
    if (error) throw error;
    return data;
}

// Helper: sign in with email/password
async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase not initialized');
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
}

// Helper: sign out
async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
}

// Helper: database operations
async function dbInsert(table, data) {
    const { data: result, error } = await supabase.from(table).insert(data).select();
    if (error) throw error;
    return result;
}

async function dbSelect(table, filters = {}) {
    let query = supabase.from(table).select('*');
    for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function dbUpdate(table, filters, updates) {
    let query = supabase.from(table).update(updates);
    for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
    }
    const { data, error } = await query.select();
    if (error) throw error;
    return data;
}

async function dbDelete(table, filters) {
    let query = supabase.from(table).delete();
    for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
    }
    const { error } = await query;
    if (error) throw error;
}
