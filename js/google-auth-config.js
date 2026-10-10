// Google OAuth 2.0 Dynamic Configuration
// Credentials are securely read at runtime from google-credentials.json or localStorage

const getStoredClientId = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('skyscanner_google_client_id') || '';
  }
  return '';
};

const getStoredClientSecret = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('skyscanner_google_client_secret') || '';
  }
  return '';
};

export const GOOGLE_OAUTH_CONFIG = {
  clientId: getStoredClientId(),
  clientSecret: getStoredClientSecret(),
  projectId: '31922',
  scope: 'email profile openid',
  redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
};

// Asynchronously load Google credentials from local config if not yet cached in localStorage
export async function loadGoogleCredentials() {
  if (GOOGLE_OAUTH_CONFIG.clientId) {
    return GOOGLE_OAUTH_CONFIG;
  }

  try {
    const res = await fetch('./google-credentials.json');
    if (res.ok) {
      const data = await res.json();
      if (data?.clientId) {
        GOOGLE_OAUTH_CONFIG.clientId = data.clientId;
        if (data.clientSecret) GOOGLE_OAUTH_CONFIG.clientSecret = data.clientSecret;
        if (data.projectId) GOOGLE_OAUTH_CONFIG.projectId = data.projectId;

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('skyscanner_google_client_id', data.clientId);
          if (data.clientSecret) {
            localStorage.setItem('skyscanner_google_client_secret', data.clientSecret);
          }
        }
      }
    }
  } catch (err) {
    console.info('Google credentials dynamic loader:', err.message);
  }

  return GOOGLE_OAUTH_CONFIG;
}

// Auto-trigger load on script evaluation
loadGoogleCredentials();
