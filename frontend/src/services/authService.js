import api from './api'

/**
 * CogniCampus Authentication Service
 * Communicates with the FastAPI backend authentication endpoints.
 *
 * Primary endpoints:
 * - Login: POST /token (OAuth2PasswordRequestForm urlencoded: username, password)
 * - Registration: POST /register (JSON: full_name, email, password, role, cgpa, branch, skills)
 */

const TOKEN_KEY = 'cognicampus_token'
const USER_KEY = 'cognicampus_user'

/**
 * Safely decodes JWT payload claims without cryptographic verification.
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

    const formData = new URLSearchParams()
    formData.append('username', trimmedEmail)
    formData.append('password', password)

    let response
    try {
      response = await api.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    } catch (err) {
      if (err.status === 404 || err.status === 422) {
        try {
          response = await api.post('/api/v1/auth/login', {
            email: trimmedEmail,
            password,
          })
        } catch {
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

    let role = data.role || data.user?.role
    if (!role) {
      const claims = parseJwtClaims(token)
      role = claims?.role || claims?.user_role || claims?.sub_role
    }

    const normalizedRole = role ? String(role).toLowerCase() : null
    if (normalizedRole !== 'student' && normalizedRole !== 'recruiter' && normalizedRole !== 'admin') {
      throw {
        status: 403,
        message: `Authenticated user has an unsupported or missing role: "${role || 'unassigned'}". Access restricted.`,
      }
    }

    const userProfile = {
      email: trimmedEmail,
      role: normalizedRole,
      fullName: data.full_name || data.user?.full_name || trimmedEmail.split('@')[0],
      id: data.user?.id || data.user_id,
    }

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem('token', token)
    localStorage.setItem(USER_KEY, JSON.stringify(userProfile))

    return {
      token,
      role: normalizedRole,
      user: userProfile,
    }
  },

  /**
   * Register a new Student or Recruiter account with profile attributes.
   */
  async register({ fullName, email, password, role, cgpa, branch, skills }) {
    const normalizedRole = String(role).toLowerCase().trim()

    if (normalizedRole !== 'student' && normalizedRole !== 'recruiter') {
      throw {
        status: 400,
        message: 'Invalid role selection. Only Student and Recruiter accounts can be created.',
      }
    }

    const payload = {
      full_name: (fullName || '').trim(),
      fullName: (fullName || '').trim(),
      email: email.trim(),
      password,
      role: normalizedRole,
      cgpa: normalizedRole === 'student' ? parseFloat(cgpa) || 7.5 : 0.0,
      branch: normalizedRole === 'student' ? (branch || 'Computer Science') : 'Not Specified',
      skills: normalizedRole === 'student' ? (skills || 'Python, SQL') : 'None',
    }

    let response
    try {
      response = await api.post('/register', payload)
    } catch (err) {
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
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token')
    const userStr = localStorage.getItem(USER_KEY)

    if (!token || !userStr) {
      return null
    }

    try {
      const user = JSON.parse(userStr)
      if (!user?.role) return null

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
    localStorage.removeItem('token')
    localStorage.removeItem(USER_KEY)
  },
}
