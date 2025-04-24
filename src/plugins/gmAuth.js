const GM_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

const SECRET_KEY = 'xO9s1nHq7iT3cR4eT5pA6sS7wO8rD9';

const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function generateGMToken() {
  const timestamp = Date.now();
  const expiry = timestamp + TOKEN_EXPIRY;
  const dataToHash = `${SECRET_KEY}_${expiry}`;
  const hash = simpleHash(dataToHash);
  
  return {
    token: hash,
    expiry: expiry
  };
}

function validateToken(token, expiry) {
  if (!token || !expiry) return false;
  
  if (Date.now() > expiry) return false;
  
  const dataToHash = `${SECRET_KEY}_${expiry}`;
  const expectedHash = simpleHash(dataToHash);
  
  return token === expectedHash;
}

function setSecureCookie(name, value, expiryTime) {
  const expires = new Date(expiryTime).toUTCString();
  const cookieValue = encodeURIComponent(value);
  
  document.cookie = `${name}=${cookieValue}; expires=${expires}; path=/; samesite=strict`;
}

function getSecureCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

function deleteSecureCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=strict`;
}

export function saveGMAuthState(isAuthenticated) {
  localStorage.setItem('gmAuthenticated', isAuthenticated ? 'true' : 'false');
  
  if (isAuthenticated) {
    const { token, expiry } = generateGMToken();
    setSecureCookie('gmAuthToken', token, expiry);
    setSecureCookie('gmAuthExpiry', expiry.toString(), expiry);
  } else {
    deleteSecureCookie('gmAuthToken');
    deleteSecureCookie('gmAuthExpiry');
  }
}

export function checkGMAuthState() {
  const basicAuth = localStorage.getItem('gmAuthenticated') === 'true';
  if (!basicAuth) return false;
  
  const token = getSecureCookie('gmAuthToken');
  const expiry = parseInt(getSecureCookie('gmAuthExpiry') || '0');
  
  const isValidToken = validateToken(token, expiry);
  
  if (!isValidToken) {
    saveGMAuthState(false);
    return false;
  }
  
  return true;
}

export function loginGM(username, password) {
  const isValid = (username === GM_CREDENTIALS.username && 
                  password === GM_CREDENTIALS.password);
  
  if (isValid) {
    saveGMAuthState(true);
  }
  
  return isValid;
}

export function logoutGM() {
  saveGMAuthState(false);
  return true;
} 
