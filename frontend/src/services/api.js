import axios from 'axios'

/**
 * Base Axios instance configured for CogniCampus FastAPI backend endpoints.
 * Base URL is read from VITE_API_BASE_URL with development fallback to http://127.0.0.1:8000.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Attach Bearer Token to outgoing requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cognicampus_token')
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: Normalize errors across status codes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Network / Connection Refused (Backend down or unreachable)
    if (!error.response) {
      return Promise.reject({
        status: 0,
        isNetworkError: true,
        message: 'Unable to connect to the CogniCampus server. Please ensure the backend is running at ' + API_BASE_URL + '.',
        fieldErrors: null,
      })
    }

    const { status, data } = error.response
    let message = 'An unexpected error occurred. Please try again.'
    let fieldErrors = null

    // 2. HTTP 422 - FastAPI / Pydantic validation errors
    if (status === 422 && data) {
      if (Array.isArray(data.detail)) {
        // Collect field names and validation messages
        fieldErrors = {}
        const errorDetails = data.detail.map((err) => {
          const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : err.loc
          if (field) {
            fieldErrors[field] = err.msg
          }
          return `${field}: ${err.msg}`
        })
        message = `Validation Error: ${errorDetails.join(', ')}`
      } else if (typeof data.detail === 'string') {
        message = data.detail
      }
    }
    // 3. HTTP 400 - Bad Request
    else if (status === 400) {
      message = data?.detail || data?.message || 'Invalid request. Please check the entered information.'
    }
    // 4. HTTP 401 - Unauthorized (Invalid credentials or expired session)
    else if (status === 401) {
      message = data?.detail || 'Invalid email or password. Please try again.'
    }
    // 5. HTTP 403 - Forbidden (Insufficient role permissions)
    else if (status === 403) {
      message = data?.detail || 'Access denied. You do not have permission to access this resource.'
    }
    // 6. HTTP 404 - Endpoint or resource not found
    else if (status === 404) {
      message = data?.detail || 'The requested endpoint was not found on the backend server.'
    }
    // 7. HTTP 500+ - Server internal error
    else if (status >= 500) {
      message = 'Internal server error. The server encountered a problem processing your request. Please try again later.'
    } else if (data?.detail) {
      message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
    }

    return Promise.reject({
      status,
      isNetworkError: false,
      message,
      fieldErrors,
      raw: data,
    })
  }
)

export default api
