// Supabase Configuration for TECH-BRIDGE ACADEMY

const SUPABASE_URL = 'https://ljhritlqicnlppwcoijw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3DWixMg6ElVnJD08vOQJAA_-2Y0Pate';

// Initialize Supabase client
let supabase = null;
function initSupabase() {
    try {
        if (window.supabase && window.supabase.createClient) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else if (window.createClient) {
            supabase = window.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch(e) {
        console.error('Supabase init error:', e);
    }
}
initSupabase();

// Retry init if CDN loads late
setTimeout(initSupabase, 1000);
setTimeout(initSupabase, 3000);
setTimeout(initSupabase, 5000);

// Helper: sign up with email/password
async function signUp(email, password, metadata = {}) {
    if (!supabase) {
        initSupabase();
        if (!supabase) throw new Error('Supabase not initialized. Check your internet connection and refresh the page.');
    }
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
    if (!supabase) {
        initSupabase();
        if (!supabase) throw new Error('Supabase not initialized. Check your internet connection and refresh the page.');
    }
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

// Helper: get current user from Supabase auth
async function getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
