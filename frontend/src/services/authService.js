import api from './api'

/**
 * CogniCampus Authentication Service
 * Communicates with the FastAPI backend authentication endpoints.
 *
 * Primary endpoints:
 * - Login: POST /token (OAuth2PasswordRequestForm urlencoded: username, password)
 * - Registration: POST /register (JSON: full_name, email, password, role)
 *
 * Security Considerations:
 * - Passwords are NEVER stored, cached, or logged.
 * - Browser localStorage is used for Bearer token storage only because the backend
 *   uses token-based auth rather than HttpOnly cookies. Note: In production, HttpOnly
 *   secure cookies are recommended to prevent XSS exposure.
 * - Role claims are verified against trusted backend responses.
 */

const TOKEN_KEY = 'cognicampus_token'
const USER_KEY = 'cognicampus_user'

/**
 * Safely decodes JWT payload claims without cryptographic verification (verification happens on backend).
 * Used only as a fallback to extract backend-issued role claims if not present at top level.
 */
function parseJwtClaims(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(decodeURIComponent(escape(window.atob(payload))))
    return decoded
  } catch {
    return null
  }
}

export const authService = {
  /**
   * Log in user using credentials.
   * Sends application/x-www-form-urlencoded matching FastAPI OAuth2PasswordRequestForm.
   *
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token: string, role: string, user: any }>}
   */
  async login({ email, password }) {
    const trimmedEmail = email.trim()

    // Build standard OAuth2 form-encoded data
    const formData = new URLSearchParams()
    formData.append('username', trimmedEmail)
    formData.append('password', password)

    let response
    try {
      // First try standard FastAPI /token with OAuth2 form-data
      response = await api.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    } catch (err) {
      // If /token returns 404 or 422, try alternate JSON format or /api/v1/auth/login if applicable
      if (err.status === 404 || err.status === 422) {
        try {
          response = await api.post('/api/v1/auth/login', {
            email: trimmedEmail,
            password,
          })
        } catch {
          // Re-throw initial normalized error
          throw err
        }
      } else {
        throw err
      }
    }

    const data = response.data
    const token = data.access_token || data.token
    if (!token) {
      throw {
        status: 500,
        message: 'Backend response did not contain an access token.',
      }
    }

    // Determine role from backend response or JWT claims
    let role = data.role || data.user?.role
    if (!role) {
      const claims = parseJwtClaims(token)
      role = claims?.role || claims?.user_role || claims?.sub_role
    }

    // Validate extracted role against trusted roles
    const normalizedRole = role ? String(role).toLowerCase() : null
    if (normalizedRole !== 'student' && normalizedRole !== 'recruiter') {
      throw {
        status: 403,
        message: `Authenticated user has an unsupported or missing role: "${role || 'unassigned'}". Access to dashboards is restricted.`,
      }
    }

    const userProfile = {
      email: trimmedEmail,
      role: normalizedRole,
      fullName: data.user?.full_name || data.full_name || '',
      id: data.user?.id || data.user_id,
    }

    // Persist session
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userProfile))

    return {
      token,
      role: normalizedRole,
      user: userProfile,
    }
  },

  /**
   * Register a new Student or Recruiter account.
   *
   * @param {{ fullName: string, email: string, password: string, role: string }} userData
   * @returns {Promise<any>}
   */
  async register({ fullName, email, password, role }) {
    const normalizedRole = String(role).toLowerCase().trim()

    // Strict client security guard: NEVER permit Admin registration via public portal
    if (normalizedRole !== 'student' && normalizedRole !== 'recruiter') {
      throw {
        status: 400,
        message: 'Invalid role selection. Only Student and Recruiter accounts can be created.',
      }
    }

    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      password,
      role: normalizedRole,
    }

    let response
    try {
      response = await api.post('/register', payload)
    } catch (err) {
      // If /register is 404, check /api/v1/auth/register fallback
      if (err.status === 404) {
        response = await api.post('/api/v1/auth/register', payload)
      } else {
        throw err
      }
    }

    return response.data
  },

  /**
   * Retrieve active stored session from localStorage.
   */
  getStoredAuth() {
    const token = localStorage.getItem(TOKEN_KEY)
    const userStr = localStorage.getItem(USER_KEY)

    if (!token || !userStr) {
      return null
    }

    try {
      const user = JSON.parse(userStr)
      if (!user?.role) return null

      // Check token expiration if JWT
      const claims = parseJwtClaims(token)
      if (claims?.exp && claims.exp * 1000 < Date.now()) {
        this.logout()
        return null
      }

      return {
        token,
        user,
        role: user.role,
      }
    } catch {
      this.logout()
      return null
    }
  },

  /**
   * Clear all authentication tokens and state from browser storage.
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
