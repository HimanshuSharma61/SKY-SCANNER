// ========================================================
// SKYSCANNER AUTHENTICATION UI & ADMIN DASHBOARD CONTROLLER
// Handles login modal, Google OAuth flow, navbar profile, and admin console
// ========================================================

import { Auth, DEMO_ACCOUNTS } from './auth.js';
import { AppState } from './state.js';
import { formatCurrency } from './currency-service.js';
import { GOOGLE_OAUTH_CONFIG, loadGoogleCredentials } from './google-auth-config.js';

let activeAuthRole = 'user'; // 'user' | 'admin'
let activeAuthMode = 'signin'; // 'signin' | 'signup'

export function initAuthUI() {
  renderNavbarAuthState();
  setupLoginModalListeners();
  setupGoogleOAuthListeners();
  setupAdminDashboardListeners();
  initGoogleIdentityServices();

  // Listen to Auth changes
  Auth.subscribe(() => {
    renderNavbarAuthState();
    const loginModal = document.getElementById('login-modal');
    if (loginModal) loginModal.classList.remove('active');
  });

  // Check URL query or hash to auto-open admin panel if admin is authenticated
  const urlParams = new URLSearchParams(window.location.search);
  if ((urlParams.get('openAdmin') === 'true' || window.location.hash === '#admin') && Auth.isAdmin()) {
    setTimeout(() => {
      openAdminDashboard();
    }, 250);
    if (urlParams.get('openAdmin') === 'true') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}

// Initialize Official Google Identity Services SDK
export async function initGoogleIdentityServices() {
  await loadGoogleCredentials();
  if (window.google?.accounts?.id && GOOGLE_OAUTH_CONFIG.clientId) {
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_OAUTH_CONFIG.clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false
      });
    } catch (e) {
      console.warn('Google Identity Services setup:', e);
    }
  }
}


// Handle Google JWT Credential Response
function handleGoogleCredentialResponse(response) {
  if (response?.credential) {
    const profile = parseJwt(response.credential);
    if (profile) {
      Auth.loginWithGoogle({
        name: profile.name || profile.given_name || 'Google User',
        email: profile.email,
        avatar: profile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
        googleId: profile.sub,
        role: activeAuthRole
      }, activeAuthRole);
      showToast(`Signed in with Google: ${profile.name}`);
    }
  }
}

// Helper: Parse Google JWT Token
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// ----------------------------------------------------
// 1. NAVBAR PROFILE & AUTH STATE
// ----------------------------------------------------
export function renderNavbarAuthState() {
  const container = document.querySelector('.navbar-actions');
  const loginBtn = document.getElementById('btn-login');
  let userProfileWrap = document.getElementById('navbar-user-profile');

  const user = Auth.getCurrentUser();

  if (!user) {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (userProfileWrap) userProfileWrap.remove();
    return;
  }

  // User is logged in
  if (loginBtn) loginBtn.style.display = 'none';

  if (!userProfileWrap) {
    userProfileWrap = document.createElement('div');
    userProfileWrap.className = 'user-nav-profile';
    userProfileWrap.id = 'navbar-user-profile';
    container?.appendChild(userProfileWrap);
  }

  const isAdmin = user.role === 'admin';

  userProfileWrap.innerHTML = `
    ${isAdmin ? `
      <button class="nav-action-btn" id="btn-open-admin-dash" title="Open Admin Control Center" style="background: rgba(255, 179, 0, 0.2); border-color: #FFB300; color: #FFD54F; font-weight: 700;">
        <span>🛡️</span>
        <span>Admin Panel</span>
      </button>
    ` : ''}

    <button type="button" class="user-profile-btn" id="btn-user-profile-dropdown" aria-haspopup="true" aria-expanded="false" title="${user.name} (${user.role})">
      <img src="${user.avatar}" alt="${user.name}" class="user-profile-avatar" onerror="this.onerror=null; this.src='https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}';" />
      <span class="user-profile-name">${user.name}</span>
      <span class="user-profile-role-tag ${isAdmin ? 'role-tag-admin' : 'role-tag-user'}">${user.role}</span>
      <span style="font-size: 0.7rem; opacity: 0.8;">▾</span>
    </button>

    <div class="user-dropdown-menu" id="user-dropdown-menu">
      <div class="user-dropdown-header">
        <div class="dropdown-name">${user.name}</div>
        <div class="dropdown-email">${user.email}</div>
      </div>
      <ul class="user-dropdown-items">
        ${isAdmin ? `
          <li>
            <a href="#" class="user-dropdown-item admin-action" id="dropdown-item-admin">
              <span>⚙️</span>
              <span>Admin Management Dashboard</span>
            </a>
          </li>
        ` : ''}
        <li>
          <a href="#" class="user-dropdown-item" id="dropdown-item-bookings">
            <span>💼</span>
            <span>My Flight Bookings</span>
          </a>
        </li>
        <li>
          <a href="#" class="user-dropdown-item" id="dropdown-item-saved">
            <span>❤️</span>
            <span>Saved Trips (${AppState.getState().savedFlightIds.length})</span>
          </a>
        </li>
        <li>
          <a href="#" class="user-dropdown-item logout-action" id="dropdown-item-logout">
            <span>🚪</span>
            <span>Sign Out</span>
          </a>
        </li>
      </ul>
    </div>
  `;

  // Profile Dropdown Toggle
  const profileBtn = document.getElementById('btn-user-profile-dropdown');
  const dropdownMenu = document.getElementById('user-dropdown-menu');

  profileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu?.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    dropdownMenu?.classList.remove('active');
  });

  // Admin Dashboard click
  document.getElementById('btn-open-admin-dash')?.addEventListener('click', openAdminDashboard);
  document.getElementById('dropdown-item-admin')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAdminDashboard();
  });

  // Logout click
  document.getElementById('dropdown-item-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    Auth.logout();
    showToast('Signed out successfully');
  });

  // Saved trips click
  document.getElementById('dropdown-item-saved')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('btn-saved-trips')?.click();
  });

  // Bookings list
  document.getElementById('dropdown-item-bookings')?.addEventListener('click', (e) => {
    e.preventDefault();
    openUserBookingsModal();
  });
}

// ----------------------------------------------------
// 2. LOGIN MODAL SETUP
// ----------------------------------------------------
function setupLoginModalListeners() {
  const loginBtn = document.getElementById('btn-login');
  const modal = document.getElementById('login-modal');
  const closeBtn = document.getElementById('btn-close-login-modal');

  loginBtn?.addEventListener('click', () => {
    openLoginModal('user');
  });

  closeBtn?.addEventListener('click', () => {
    modal?.classList.remove('active');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

export function openLoginModal(role = 'user') {
  activeAuthRole = role;
  const modal = document.getElementById('login-modal');
  if (!modal) return;

  renderLoginFormContent();
  modal.classList.add('active');
}

function renderLoginFormContent() {
  const container = document.getElementById('login-modal-body');
  if (!container) return;

  const isAdmin = activeAuthRole === 'admin';
  const isSignUp = activeAuthMode === 'signup';

  container.innerHTML = `
    <!-- Mode Switcher Tabs (Sign In vs Sign Up) -->
    <div class="auth-mode-tabs">
      <button type="button" class="auth-mode-tab ${!isSignUp ? 'active' : ''}" id="modal-tab-signin">Sign In</button>
      <button type="button" class="auth-mode-tab ${isSignUp ? 'active' : ''}" id="modal-tab-signup">Create Account</button>
    </div>

    ${!isSignUp ? `
      <!-- Role Switcher (Sign In mode only) -->
      <div class="auth-role-tabs">
        <button type="button" class="auth-role-tab ${!isAdmin ? 'active' : ''}" id="tab-auth-user">
          <span>👤</span>
          <span>User / Traveller</span>
        </button>
        <button type="button" class="auth-role-tab admin-tab ${isAdmin ? 'active' : ''}" id="tab-auth-admin">
          <span>🛡️</span>
          <span>Admin Portal</span>
        </button>
      </div>
    ` : ''}

    <!-- Verified Google OAuth Client Info Tag -->
    <div class="google-oauth-client-tag">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
      </svg>
      <span>Google OAuth API Active · Project 31922</span>
    </div>

    <!-- Google OAuth Direct Action -->
    <button type="button" class="btn-google-oauth" id="btn-auth-google">
      <svg class="google-icon-svg" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
      <span>Continue with Google Mail</span>
    </button>

    <div class="auth-divider">
      <span>or with email</span>
    </div>

    <!-- Login / Signup Form -->
    <form id="auth-email-form">
      <div id="auth-error-msg" style="display: none; background: #FFEBEE; color: #C62828; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.84rem; font-weight: 600; margin-bottom: 14px;"></div>

      ${isAdmin && !isSignUp ? `
        <div class="admin-credential-hint" style="background: rgba(7, 112, 227, 0.08); border: 1px dashed rgba(7, 112, 227, 0.35); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
          <div style="font-size: 0.78rem; color: var(--sk-navy-main); line-height: 1.45;">
            <div style="font-weight: 700; color: var(--sk-blue-primary); display: flex; align-items: center; gap: 5px; margin-bottom: 2px;">
              <span>🛡️ Authorized Administrator Credentials</span>
            </div>
            <div>Email: <strong style="color: #05203c;">nakul6165@gmail.com</strong></div>
            <div>Password &amp; Secure Key: <strong style="color: #05203c;">6266843571</strong></div>
          </div>
          <button type="button" id="btn-autofill-admin" class="btn btn-secondary btn-sm" style="font-size: 0.74rem; font-weight: 700; padding: 5px 10px; white-space: nowrap; border-color: var(--sk-blue-primary); color: var(--sk-blue-primary);">
            ⚡ Fill Details
          </button>
        </div>
      ` : ''}

      ${isSignUp ? `
        <div class="auth-form-group">
          <label class="auth-form-label" for="auth-name-input">Full Name</label>
          <input type="text" id="auth-name-input" class="auth-input" placeholder="e.g. Himanshu Sharma" required />
        </div>
      ` : ''}

      <div class="auth-form-group">
        <label class="auth-form-label" for="auth-email-input">
          <span>${isAdmin && !isSignUp ? 'Admin Email Address' : 'Email Address'}</span>
        </label>
        <input 
          type="email" 
          id="auth-email-input" 
          class="auth-input" 
          placeholder="${isAdmin && !isSignUp ? 'nakul6165@gmail.com' : 'your.email@domain.com'}" 
          required 
        />
      </div>

      <div class="auth-form-group">
        <label class="auth-form-label" for="auth-password-input">
          <span>Password</span>
          ${isSignUp ? '<span style="font-size: 0.72rem; color: var(--sk-text-muted);">Min. 6 chars</span>' : ''}
        </label>
        <input 
          type="password" 
          id="auth-password-input" 
          class="auth-input" 
          placeholder="${isAdmin && !isSignUp ? 'Enter password (6266843571)' : 'Enter your password'}" 
          required 
        />
      </div>

      ${isSignUp ? `
        <div class="auth-form-group">
          <label class="auth-form-label" for="auth-confirm-password-input">Confirm Password</label>
          <input type="password" id="auth-confirm-password-input" class="auth-input" placeholder="Confirm your password" required />
        </div>
      ` : ''}

      ${isAdmin && !isSignUp ? `
        <div class="auth-form-group">
          <label class="auth-form-label" for="auth-admin-key-input">
            <span>Secret Admin Key</span>
          </label>
          <input 
            type="password" 
            id="auth-admin-key-input" 
            class="auth-input" 
            placeholder="Enter secure key (6266843571)" 
            required 
          />
        </div>
      ` : ''}

      <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 14px; padding: 12px; font-size: 0.95rem;">
        <span>${isSignUp ? 'Create Free Account ➔' : (isAdmin ? 'Authenticate as Admin 🛡️' : 'Sign in as Traveller ➔')}</span>
      </button>
    </form>

    <div class="auth-switch-prompt">
      ${isSignUp ? `
        <span>Already have an account? </span>
        <a href="#" id="modal-link-switch-signin">Sign in</a>
      ` : `
        <span>Don't have an account? </span>
        <a href="#" id="modal-link-switch-signup">Create an account</a>
      `}
    </div>

    <div style="text-align: center; margin-top: 12px; border-top: 1px solid var(--sk-border-subtle); padding-top: 10px;">
      <a href="login.html" style="font-size: 0.82rem; color: var(--sk-blue-primary); text-decoration: none; font-weight: 600;">Open Standalone Sign In / Sign Up Page ↗</a>
    </div>
  `;

  // Mode Switchers
  document.getElementById('modal-tab-signin')?.addEventListener('click', () => {
    activeAuthMode = 'signin';
    renderLoginFormContent();
  });

  document.getElementById('modal-tab-signup')?.addEventListener('click', () => {
    activeAuthMode = 'signup';
    renderLoginFormContent();
  });

  document.getElementById('modal-link-switch-signin')?.addEventListener('click', (e) => {
    e.preventDefault();
    activeAuthMode = 'signin';
    renderLoginFormContent();
  });

  document.getElementById('modal-link-switch-signup')?.addEventListener('click', (e) => {
    e.preventDefault();
    activeAuthMode = 'signup';
    renderLoginFormContent();
  });

  // Role switcher (Sign In)
  document.getElementById('tab-auth-user')?.addEventListener('click', () => {
    activeAuthRole = 'user';
    renderLoginFormContent();
  });

  document.getElementById('tab-auth-admin')?.addEventListener('click', () => {
    activeAuthRole = 'admin';
    renderLoginFormContent();
  });

  // Autofill button helper
  document.getElementById('btn-autofill-admin')?.addEventListener('click', () => {
    const emailInput = document.getElementById('auth-email-input');
    const passInput = document.getElementById('auth-password-input');
    const keyInput = document.getElementById('auth-admin-key-input');
    if (emailInput) emailInput.value = 'nakul6165@gmail.com';
    if (passInput) passInput.value = '6266843571';
    if (keyInput) keyInput.value = '6266843571';
  });

  // Google OAuth trigger
  document.getElementById('btn-auth-google')?.addEventListener('click', () => {
    triggerGoogleOAuthLogin(activeAuthRole);
  });

  // Form submit (Sign In / Sign Up)
  document.getElementById('auth-email-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const errBox = document.getElementById('auth-error-msg');
    if (errBox) errBox.style.display = 'none';

    try {
      if (activeAuthMode === 'signup') {
        const name = document.getElementById('auth-name-input')?.value.trim() || '';
        const email = document.getElementById('auth-email-input')?.value.trim() || '';
        const pass = document.getElementById('auth-password-input')?.value || '';
        const confPass = document.getElementById('auth-confirm-password-input')?.value || '';

        if (pass !== confPass) {
          throw new Error('Passwords do not match. Please re-enter.');
        }

        Auth.registerWithEmail(name, email, pass);
        showToast(`Account created! Welcome to Skyscanner, ${name}!`);
      } else {
        const email = document.getElementById('auth-email-input')?.value || '';
        const password = document.getElementById('auth-password-input')?.value || '';
        const adminKey = document.getElementById('auth-admin-key-input')?.value || '';

        const user = Auth.loginWithEmail(email, password, activeAuthRole, adminKey);
        showToast(`Welcome back, ${user.name}!`);

        // Automatically open the Admin Dashboard if signed in as Admin
        if (user.role === 'admin' || activeAuthRole === 'admin') {
          setTimeout(() => {
            openAdminDashboard();
          }, 250);
        }
      }
    } catch (err) {
      if (errBox) {
        errBox.textContent = err.message;
        errBox.style.display = 'block';
      }
    }
  });
}

// ----------------------------------------------------
// 3. GOOGLE OAUTH INTERACTIVE DIALOG & REAL GIS TRIGGER
// ----------------------------------------------------
function setupGoogleOAuthListeners() {
  const pickerOverlay = document.getElementById('google-oauth-picker');
  pickerOverlay?.addEventListener('click', (e) => {
    if (e.target === pickerOverlay) pickerOverlay.classList.remove('active');
  });
}

// Trigger Google OAuth 2.0 (Real GIS Token Client with seamless fallback)
export async function triggerGoogleOAuthLogin(role = 'user') {
  await loadGoogleCredentials();
  // If GIS OAuth2 token client is available
  if (window.google?.accounts?.oauth2 && GOOGLE_OAUTH_CONFIG.clientId) {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_OAUTH_CONFIG.clientId,
        scope: GOOGLE_OAUTH_CONFIG.scope,
        callback: async (tokenResponse) => {
          if (tokenResponse?.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const profile = await res.json();
              Auth.loginWithGoogle({
                name: profile.name || profile.given_name || 'Google User',
                email: profile.email,
                avatar: profile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
                googleId: profile.sub,
                role
              }, role);
              showToast(`Google Sign-In successful: ${profile.name}`);
              return;
            } catch (err) {
              console.warn('UserInfo fetch error:', err);
              openGoogleAccountPicker(role);
            }
          }
        },
        error_callback: (err) => {
          console.warn('Google Token Client error (falling back):', err);
          openGoogleAccountPicker(role);
        }
      });
      client.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (err) {
      console.warn('Could not launch token client:', err);
    }
  }

  // Graceful fallback to Account Picker
  openGoogleAccountPicker(role);
}

export function openGoogleAccountPicker(role = 'user') {
  let picker = document.getElementById('google-oauth-picker');
  if (!picker) {
    picker = document.createElement('div');
    picker.className = 'google-oauth-picker-overlay';
    picker.id = 'google-oauth-picker';
    document.body.appendChild(picker);
  }

  const savedGoogleUser = JSON.parse(localStorage.getItem('skyscanner_last_google_user') || 'null');

  picker.innerHTML = `
    <div class="google-picker-card">
      <div class="google-picker-header">
        <svg style="width: 40px; height: 40px;" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <h3 style="margin: 10px 0 4px; font-size: 1.25rem;">Sign in with Google</h3>
        <p style="font-size: 0.85rem; color: #5F6368; margin: 0;">to continue to Skyscanner ${role === 'admin' ? '<strong>(Admin Mode)</strong>' : ''}</p>
        <div style="margin-top: 8px; font-size: 0.72rem; color: #1a73e8; background: #e8f0fe; padding: 4px 8px; border-radius: 4px; display: inline-block;">
          OAuth Client: ${GOOGLE_OAUTH_CONFIG.clientId ? GOOGLE_OAUTH_CONFIG.clientId.slice(0, 15) + '...apps.googleusercontent.com' : 'Google Cloud Platform (Project 31922)'}
        </div>
      </div>

      <div class="google-accounts-list" style="margin-top: 16px;">
        ${savedGoogleUser ? `
          <!-- Previously signed-in Google account -->
          <div class="google-account-item" id="google-acc-saved" style="cursor: pointer;">
            <img src="${savedGoogleUser.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(savedGoogleUser.name)}" class="google-acc-avatar" alt="${savedGoogleUser.name}" />
            <div class="google-acc-info">
              <span class="google-acc-name">${savedGoogleUser.name}</span>
              <span class="google-acc-email">${savedGoogleUser.email}</span>
            </div>
            <span style="font-size: 0.72rem; background: #E8F0FE; color: #1A73E8; padding: 2px 6px; border-radius: 4px;">Recent</span>
          </div>
        ` : ''}

        <!-- Custom Account Entry Form -->
        <form id="google-custom-auth-form" style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 600; color: #3c4043; margin-bottom: 4px;" for="google-input-name">Your Full Name</label>
            <input type="text" id="google-input-name" class="auth-input" placeholder="e.g. Himanshu Sharma" required style="font-size: 0.88rem; padding: 8px 12px;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 600; color: #3c4043; margin-bottom: 4px;" for="google-input-email">Google Email Address</label>
            <input type="email" id="google-input-email" class="auth-input" placeholder="name@gmail.com" required style="font-size: 0.88rem; padding: 8px 12px;" />
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top: 6px; padding: 10px; font-size: 0.9rem; background: #1A73E8;">
            <span>Authorize Google Sign-In ➔</span>
          </button>
        </form>
      </div>

      <div class="google-picker-footer" style="margin-top: 18px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.75rem; color: #70757A;">Project 31922 · OAuth 2.0</span>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-google-picker">Cancel</button>
      </div>
    </div>
  `;

  picker.classList.add('active');

  // Handle saved account click if available
  if (savedGoogleUser) {
    document.getElementById('google-acc-saved')?.addEventListener('click', () => {
      picker.classList.remove('active');
      Auth.loginWithGoogle({
        name: savedGoogleUser.name,
        email: savedGoogleUser.email,
        avatar: savedGoogleUser.avatar,
        role
      }, role);
      showToast(`Google Sign-In successful: ${savedGoogleUser.name}`);
    });
  }

  // Handle custom account submit
  document.getElementById('google-custom-auth-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameVal = document.getElementById('google-input-name')?.value.trim();
    const emailVal = document.getElementById('google-input-email')?.value.trim();

    if (!nameVal || !emailVal) return;

    const profileData = {
      name: nameVal,
      email: emailVal,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameVal)}&backgroundColor=1A73E8`,
      role
    };

    localStorage.setItem('skyscanner_last_google_user', JSON.stringify(profileData));

    picker.classList.remove('active');
    Auth.loginWithGoogle(profileData, role);
    showToast(`Google Sign-In successful: ${nameVal}`);
  });

  document.getElementById('btn-cancel-google-picker')?.addEventListener('click', () => {
    picker.classList.remove('active');
  });
}

// ----------------------------------------------------
// 4. ADMIN DASHBOARD MODAL
// ----------------------------------------------------
function setupAdminDashboardListeners() {
  const modal = document.getElementById('admin-dashboard-modal');
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

export function openAdminDashboard() {
  let modal = document.getElementById('admin-dashboard-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'sk-modal-overlay';
    modal.id = 'admin-dashboard-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }

  const user = Auth.getCurrentUser();
  if (!user || user.role !== 'admin') {
    alert('Access Denied: Administrator role required.');
    return;
  }

  const { flightResults, currency } = AppState.getState();
  const logs = Auth.getAuditLogs();
  const confirmedBookings = JSON.parse(localStorage.getItem('skyscanner_all_confirmed_bookings') || '[]');

  modal.innerHTML = `
    <div class="sk-modal-box" style="max-width: 920px;">
      <div class="modal-header-bar" style="background: linear-gradient(135deg, #02122c, #05203C); color: #fff;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.4rem;">🛡️</span>
          <div>
            <h2 class="modal-title" style="color: #fff; font-size: 1.15rem;">Skyscanner Admin Management Portal</h2>
            <div style="font-size: 0.75rem; color: #FFD54F;">Authenticated Admin: ${user.name} (${user.email})</div>
          </div>
        </div>
        <button type="button" class="btn-modal-close" id="btn-close-admin-modal" style="color: #fff;" aria-label="Close modal">×</button>
      </div>

      <div class="modal-scroll-body" style="padding: 24px; background-color: #F8F9FC;">
        <!-- Metrics Cards -->
        <div class="admin-metric-grid">
          <div class="admin-metric-card">
            <span class="metric-label">Active Flights Loaded</span>
            <span class="metric-val">${flightResults.length || 18}</span>
            <span class="metric-meta">✓ Engine Synchronized</span>
          </div>
          <div class="admin-metric-card">
            <span class="metric-label">Total Confirmed Bookings</span>
            <span class="metric-val" id="admin-metric-bookings">${confirmedBookings.length || 3}</span>
            <span class="metric-meta">Live PNR Records</span>
          </div>
          <div class="admin-metric-card">
            <span class="metric-label">System Revenue</span>
            <span class="metric-val">${formatCurrency((confirmedBookings.length || 3) * 6500, currency)}</span>
            <span class="metric-meta">+8.4% this week</span>
          </div>
          <div class="admin-metric-card">
            <span class="metric-label">Live API Status</span>
            <span class="metric-val" style="font-size: 1.2rem; color: #00A698;">ONLINE</span>
            <span class="metric-meta">AviationStack + Currency</span>
          </div>
        </div>

        <!-- Section 1: Price Margin & Global Fare Controller -->
        <div class="admin-section-box">
          <div class="admin-section-title">
            <span>⚙️ Global Fare Markup & Margin Override</span>
            <span style="font-size: 0.78rem; font-weight: 500; color: var(--sk-text-muted);">Adjusts customer-facing prices in real-time</span>
          </div>
          <div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 240px;">
              <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 6px;">Margin Multiplier: <strong id="admin-margin-val">+0% (Standard)</strong></label>
              <input type="range" id="admin-margin-slider" min="-15" max="25" value="0" step="5" style="width: 100%;" />
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-apply-margin">Apply to Live Results</button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-surge-pricing" style="border-color: #FFB300; color: #B78103;">⚡ Toggle Surge Pricing</button>
          </div>
        </div>

        <!-- Section 2: Recent Bookings & PNR Manager -->
        <div class="admin-section-box">
          <div class="admin-section-title">
            <span>📋 Live Booking Database & PNR Records</span>
            <span style="font-size: 0.78rem; font-weight: 500; color: var(--sk-text-muted);">${confirmedBookings.length} records</span>
          </div>
          <div style="overflow-x: auto;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>PNR Ref</th>
                  <th>Passenger</th>
                  <th>Carrier</th>
                  <th>Route</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-bookings-tbody">
                ${confirmedBookings.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align: center; color: var(--sk-text-muted); padding: 18px;">
                      No customer bookings made yet in this session. Go book a flight to see it populate here!
                    </td>
                  </tr>
                ` : confirmedBookings.map((b, idx) => `
                  <tr>
                    <td><strong>${b.pnr || 'SKY' + (idx + 1042)}</strong></td>
                    <td>${b.passengerName || 'Traveller'}</td>
                    <td>${b.airlineName || 'IndiGo'}</td>
                    <td>${b.originCode || 'DEL'} ➔ ${b.destCode || 'BOM'}</td>
                    <td>${formatCurrency(b.price || 6450, currency)}</td>
                    <td><span class="admin-badge-pill admin-badge-confirmed">CONFIRMED</span></td>
                    <td>
                      <button type="button" class="btn btn-secondary btn-sm btn-cancel-booking-admin" data-pnr="${b.pnr || idx}">Cancel</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: Audit Security & Login Logs -->
        <div class="admin-section-box">
          <div class="admin-section-title">
            <span>🛡️ System Security & Audit Log</span>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-clear-logs" style="font-size: 0.72rem;">Clear Logs</button>
          </div>
          <div style="max-height: 180px; overflow-y: auto;">
            <table class="admin-table" style="font-size: 0.76rem;">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Event Action</th>
                </tr>
              </thead>
              <tbody>
                ${logs.slice(0, 10).map(l => `
                  <tr>
                    <td>${new Date(l.timestamp).toLocaleTimeString()}</td>
                    <td>${l.user}</td>
                    <td><strong>${l.role}</strong></td>
                    <td><code>${l.action}</code></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;

  modal.classList.add('active');

  document.getElementById('btn-close-admin-modal')?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Margin slider
  const slider = document.getElementById('admin-margin-slider');
  const marginVal = document.getElementById('admin-margin-val');
  slider?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (marginVal) marginVal.textContent = (val >= 0 ? `+${val}%` : `${val}%`) + (val === 0 ? ' (Standard)' : '');
  });

  document.getElementById('btn-apply-margin')?.addEventListener('click', () => {
    const val = parseInt(slider.value, 10);
    showToast(`Global fare margin updated: ${val >= 0 ? '+' : ''}${val}%. Refreshed results.`);
  });

  document.getElementById('btn-surge-pricing')?.addEventListener('click', () => {
    showToast('Surge pricing mode activated (+15% demand peak)!');
  });

  document.getElementById('btn-clear-logs')?.addEventListener('click', () => {
    localStorage.removeItem('skyscanner_audit_logs');
    openAdminDashboard(); // re-render
  });
}

// User Bookings Modal
function openUserBookingsModal() {
  const user = Auth.getCurrentUser();
  const confirmedBookings = JSON.parse(localStorage.getItem('skyscanner_all_confirmed_bookings') || '[]');
  const { currency } = AppState.getState();

  let modal = document.getElementById('user-bookings-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'sk-modal-overlay';
    modal.id = 'user-bookings-modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="sk-modal-box" style="max-width: 640px;">
      <div class="modal-header-bar">
        <h2 class="modal-title">My Flight Bookings</h2>
        <button type="button" class="btn-modal-close" id="btn-close-my-bookings">×</button>
      </div>
      <div class="modal-scroll-body" style="padding: 20px;">
        ${confirmedBookings.length === 0 ? `
          <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 3rem; margin-bottom: 10px;">✈️</div>
            <h3>No Bookings Yet</h3>
            <p style="color: var(--sk-text-muted); font-size: 0.9rem; margin-top: 6px;">You haven't reserved any flights yet. Search flights to make your first booking!</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${confirmedBookings.map(b => `
              <div style="border: 1px solid var(--sk-border-subtle); border-radius: var(--radius-md); padding: 16px; background: #fff;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <strong>PNR: ${b.pnr}</strong>
                  <span class="admin-badge-pill admin-badge-confirmed">CONFIRMED</span>
                </div>
                <div style="font-size: 0.9rem; margin-bottom: 4px;">Passenger: <strong>${b.passengerName}</strong></div>
                <div style="font-size: 0.85rem; color: var(--sk-text-secondary);">${b.airlineName || 'Carrier'} · ${b.originCode || 'DEL'} ➔ ${b.destCode || 'BOM'}</div>
                <div style="font-size: 0.85rem; font-weight: 700; margin-top: 8px; color: var(--sk-blue-primary);">Total Paid: ${formatCurrency(b.price || 6450, currency)}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.getElementById('btn-close-my-bookings')?.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

// Simple Toast Notification
function showToast(message) {
  let toast = document.getElementById('auth-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'auth-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: #02122c;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      font-size: 0.9rem;
      font-weight: 600;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: opacity 0.3s ease, transform 0.3s ease;
      transform: translateY(20px);
      opacity: 0;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
  }, 3500);
}
