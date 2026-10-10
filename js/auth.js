// ========================================================
// SKYSCANNER AUTHENTICATION & ROLE MANAGEMENT MODULE
// Supports: User Login, Admin Login, Google OAuth, Email Login
// ========================================================

const AUTH_STORAGE_KEY = 'skyscanner_auth_user';
const AUDIT_STORAGE_KEY = 'skyscanner_audit_logs';
const BOOKINGS_STORAGE_KEY = 'skyscanner_all_bookings';

// Pre-seeded demo credentials
export const DEMO_ACCOUNTS = {
  user: {
    email: 'user@skyscanner.demo',
    password: 'user123',
    name: 'Himanshu Sharma',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    provider: 'email'
  },
  admin: {
    email: 'admin@skyscanner.demo',
    password: 'admin123',
    adminKey: 'SKY-ADMIN-2026',
    name: 'Admin Controller',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    provider: 'system'
  }
};

class AuthService {
  constructor() {
    this.currentUser = this.loadUser();
    this.listeners = [];
  }

  loadUser() {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.currentUser));
  }

  logAudit(action, details = {}) {
    try {
      const logs = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
      logs.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        user: this.currentUser?.email || 'Anonymous',
        role: this.currentUser?.role || 'Guest',
        action,
        details
      });
      // Keep last 100 logs
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.warn('Could not record audit log:', e);
    }
  }

  getAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  // Login with standard Email / Password (User or Admin)
  loginWithEmail(email, password, role = 'user', adminKey = '') {
    const cleanEmail = email.trim().toLowerCase();

    if (role === 'admin') {
      // Validate Admin
      if (cleanEmail === DEMO_ACCOUNTS.admin.email && password === DEMO_ACCOUNTS.admin.password) {
        if (adminKey && adminKey !== DEMO_ACCOUNTS.admin.adminKey) {
          throw new Error('Invalid Secret Admin Key.');
        }
        return this.setUserSession(DEMO_ACCOUNTS.admin);
      }
      // Allow custom admin if correct secret key provided
      if (adminKey === 'SKY-ADMIN-2026' || adminKey === 'ADMIN123') {
        const adminUser = {
          email: cleanEmail,
          name: cleanEmail.split('@')[0].toUpperCase() + ' (Admin)',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          provider: 'email-admin'
        };
        return this.setUserSession(adminUser);
      }
      throw new Error('Invalid Admin credentials or incorrect Secret Admin Key (Demo Key: SKY-ADMIN-2026).');
    }

    // Regular User
    if (cleanEmail === DEMO_ACCOUNTS.user.email && password === DEMO_ACCOUNTS.user.password) {
      return this.setUserSession(DEMO_ACCOUNTS.user);
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }

    if (!password || password.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    // Dynamic User Registration / Login
    const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const newUser = {
      email: cleanEmail,
      name: formattedName,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=0770E3`,
      provider: 'email'
    };

    return this.setUserSession(newUser);
  }

  // Register New Account
  registerWithEmail(name, email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Please enter your full name (at least 2 characters).');
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters for security.');
    }

    const newUser = {
      email: cleanEmail,
      name: cleanName,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=0770E3`,
      provider: 'email-registration'
    };

    this.logAudit('USER_REGISTERED', { email: cleanEmail, name: cleanName });
    return this.setUserSession(newUser);
  }

  // Google OAuth Login Integration
  loginWithGoogle(googleProfile = null, targetRole = 'user') {
    const role = targetRole === 'admin' ? 'admin' : 'user';

    const userObj = googleProfile || {
      email: role === 'admin' ? 'admin.travel@gmail.com' : 'himanshu.traveller@gmail.com',
      name: role === 'admin' ? 'Himanshu (Lead Admin)' : 'Himanshu Sharma',
      role: role,
      avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIq8x4G-google-profile-sample=s96-c',
      provider: 'google',
      googleId: 'goog_' + Date.now()
    };

    return this.setUserSession(userObj);
  }

  // Quick Demo Login (1-click helper)
  quickDemoLogin(role = 'user') {
    if (role === 'admin') {
      return this.setUserSession(DEMO_ACCOUNTS.admin);
    }
    return this.setUserSession(DEMO_ACCOUNTS.user);
  }

  setUserSession(user) {
    this.currentUser = {
      ...user,
      lastLogin: new Date().toISOString()
    };
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    } catch {}

    this.logAudit('USER_LOGIN', {
      email: this.currentUser.email,
      role: this.currentUser.role,
      provider: this.currentUser.provider
    });

    this.notify();
    return this.currentUser;
  }

  logout() {
    const prev = this.currentUser;
    this.currentUser = null;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}

    if (prev) {
      this.logAudit('USER_LOGOUT', { email: prev.email, role: prev.role });
    }

    this.notify();
  }
}

export const Auth = new AuthService();
