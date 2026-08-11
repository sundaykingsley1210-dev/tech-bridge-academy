// TECH-BRIDGE ACADEMY - Supabase Database Helpers
// All database operations go through this file

const DB = {

    // ==================== AUTH ====================
    async signUp(email, password, metadata = {}) {
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: metadata }
        });
        if (error) throw error;
        return data;
    },

    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async signOut() {
        await supabase.auth.signOut();
    },

    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // ==================== USERS ====================
    async createUser(userData) {
        const { data, error } = await supabase.from('users').insert(userData).select();
        if (error) throw error;
        return data[0];
    },

    async getUserProfile(userId) {
        const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
        if (error) throw error;
        return data;
    },

    async updateUserProfile(userId, updates) {
        const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select();
        if (error) throw error;
        return data[0];
    },

    async getAllStudents() {
        const { data, error } = await supabase.from('users').select('*').eq('role', 'student');
        if (error) throw error;
        return data;
    },

    async getStudentsByClass(cls) {
        const { data, error } = await supabase.from('users').select('*').eq('role', 'student').eq('class', cls);
        if (error) throw error;
        return data;
    },

    async getAllTeachers() {
        const { data, error } = await supabase.from('users').select('*').eq('role', 'teacher');
        if (error) throw error;
        return data;
    },

    // ==================== ID CARDS ====================
    async getIdCard(userId) {
        const { data, error } = await supabase.from('id_cards').select('*').eq('user_id', userId).maybeSingle();
        if (error) throw error;
        return data;
    },

    async saveIdCard(cardData) {
        const existing = await this.getIdCard(cardData.user_id);
        if (existing) {
            const { data, error } = await supabase.from('id_cards').update(cardData).eq('user_id', cardData.user_id).select();
            if (error) throw error;
            return data[0];
        } else {
            const { data, error } = await supabase.from('id_cards').insert(cardData).select();
            if (error) throw error;
            return data[0];
        }
    },

    // ==================== RESULTS ====================
    async getStudentResults(studentId) {
        const { data, error } = await supabase.from('results').select('*').eq('student_id', studentId);
        if (error) throw error;
        return data;
    },

    async getClassResults(cls) {
        const { data, error } = await supabase.from('results').select('*').eq('class', cls);
        if (error) throw error;
        return data;
    },

    async addResult(result) {
        const { data, error } = await supabase.from('results').insert(result).select();
        if (error) throw error;
        return data[0];
    },

    async updateResult(id, updates) {
        const { data, error } = await supabase.from('results').update(updates).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    // ==================== ASSIGNMENTS ====================
    async getAssignments() {
        const { data, error } = await supabase.from('assignments').select('*');
        if (error) throw error;
        return data;
    },

    async getTeacherAssignments(teacherId) {
        const { data, error } = await supabase.from('assignments').select('*').eq('teacher_id', teacherId);
        if (error) throw error;
        return data;
    },

    async createAssignment(assignment) {
        const { data, error } = await supabase.from('assignments').insert(assignment).select();
        if (error) throw error;
        return data[0];
    },

    async deleteAssignment(id) {
        const { error } = await supabase.from('assignments').delete().eq('id', id);
        if (error) throw error;
    },

    // ==================== SUBMISSIONS ====================
    async getStudentSubmissions(studentId) {
        const { data, error } = await supabase.from('submissions').select('*').eq('student_id', studentId);
        if (error) throw error;
        return data;
    },

    async getAssignmentSubmissions(assignmentId) {
        const { data, error } = await supabase.from('submissions').select('*').eq('assignment_id', assignmentId);
        if (error) throw error;
        return data;
    },

    async submitAssignment(submission) {
        const { data, error } = await supabase.from('submissions').insert(submission).select();
        if (error) throw error;
        return data[0];
    },

    async gradeSubmission(id, score) {
        const { data, error } = await supabase.from('submissions').update({ score, status: 'graded' }).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    // ==================== EXAM QUESTIONS ====================
    async getExamQuestions(subject, cls, term) {
        const { data, error } = await supabase.from('exam_questions').select('*').eq('subject', subject).eq('class', cls).eq('term', term).maybeSingle();
        if (error) throw error;
        return data;
    },

    async saveExamQuestions(examData) {
        const { data, error } = await supabase.from('exam_questions').upsert(examData, { onConflict: 'id' }).select();
        if (error) throw error;
        return data[0];
    },

    // ==================== EXAM SUBMISSIONS ====================
    async getStudentExamSubmissions(studentId) {
        const { data, error } = await supabase.from('exam_submissions').select('*').eq('student_id', studentId);
        if (error) throw error;
        return data;
    },

    async submitExam(examData) {
        const { data, error } = await supabase.from('exam_submissions').insert(examData).select();
        if (error) throw error;
        return data[0];
    },

    // ==================== TIMETABLE ====================
    async getTimetable(cls) {
        const { data, error } = await supabase.from('timetable').select('*').eq('class', cls);
        if (error) throw error;
        return data;
    },

    async saveTimetable(timetableData) {
        const { data, error } = await supabase.from('timetable').upsert(timetableData, { onConflict: 'id' }).select();
        if (error) throw error;
        return data;
    },

    // ==================== NOTIFICATIONS ====================
    async getNotifications(targetClass, targetRole) {
        let query = supabase.from('notifications').select('*');
        if (targetClass) query = query.or('target_class.is.null,target_class.eq.' + targetClass);
        if (targetRole) query = query.eq('target_role', targetRole);
        query = query.order('created_at', { ascending: false });
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async sendNotification(notif) {
        const { data, error } = await supabase.from('notifications').insert(notif).select();
        if (error) throw error;
        return data[0];
    },

    // ==================== MESSAGES ====================
    async getMessages(userId) {
        const { data, error } = await supabase.from('messages').select('*').or('from_id.eq.' + userId + ',to_id.eq.' + userId).order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async sendMessage(msg) {
        const { data, error } = await supabase.from('messages').insert(msg).select();
        if (error) throw error;
        return data[0];
    },

    async markMessageRead(id) {
        const { data, error } = await supabase.from('messages').update({ read: true }).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    // ==================== PAYMENTS ====================
    async getStudentPayments(studentId) {
        const { data, error } = await supabase.from('payments').select('*').eq('student_id', studentId);
        if (error) throw error;
        return data;
    },

    async getAllPayments() {
        const { data, error } = await supabase.from('payments').select('*').order('submitted_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async submitPayment(payment) {
        const { data, error } = await supabase.from('payments').insert(payment).select();
        if (error) throw error;
        return data[0];
    },

    async updatePaymentStatus(id, status) {
        const { data, error } = await supabase.from('payments').update({ status }).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    // ==================== BANK DETAILS ====================
    async getBankDetails() {
        const { data, error } = await supabase.from('bank_details').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async saveBankDetails(details) {
        const { data, error } = await supabase.from('bank_details').insert(details).select();
        if (error) throw error;
        return data[0];
    },

    // ==================== FEES ====================
    async getFees() {
        const { data, error } = await supabase.from('fees').select('*');
        if (error) throw error;
        return data;
    },

    async updateFee(cls, amount) {
        const { data, error } = await supabase.from('fees').update({ amount }).eq('class', cls).select();
        if (error) throw error;
        return data[0];
    },

    // ==================== EXAM SCHEDULE ====================
    async getExamSchedule() {
        const { data, error } = await supabase.from('exam_schedule').select('*');
        if (error) throw error;
        return data;
    },

    async saveExamSchedule(schedule) {
        const { data, error } = await supabase.from('exam_schedule').upsert(schedule, { onConflict: 'id' }).select();
        if (error) throw error;
        return data;
    },

    // ==================== APPLICATIONS ====================
    async getApplications() {
        const { data, error } = await supabase.from('applications').select('*').order('date_submitted', { ascending: false });
        if (error) throw error;
        return data;
    },

    async submitApplication(app) {
        const { data, error } = await supabase.from('applications').insert(app).select();
        if (error) throw error;
        return data[0];
    },

    async updateApplicationStatus(id, status) {
        const { data, error } = await supabase.from('applications').update({ status }).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    // ==================== TEACHER RESULTS ====================
    async getTeacherResults(teacherId) {
        const { data, error } = await supabase.from('teacher_results').select('*').eq('teacher_id', teacherId);
        if (error) throw error;
        return data;
    },

    async saveTeacherResults(results) {
        const { data, error } = await supabase.from('teacher_results').upsert(results, { onConflict: 'id' }).select();
        if (error) throw error;
        return data;
    }
};
