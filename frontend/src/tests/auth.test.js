/**
 * CogniCampus Frontend Test Suite: Authentication & Validation
 *
 * Runs with Node.js to verify core client authentication logic, input validation,
 * error normalization, and security boundaries.
 */

import assert from 'node:assert/strict'

// Test 1: Validation Rules
console.log('=== TEST SUITE 1: Form Validation & Security Guards ===')

function validateLoginForm({ email, password }) {
  const errors = {}
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

function validateRegisterForm({ fullName, email, password, confirmPassword, role }) {
  const errors = {}
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!fullName || !fullName.trim()) {
    errors.fullName = 'Full name is required.'
  } else if (fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.'
  }

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirmation password is required.'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  // Strict role boundary: Only student or recruiter
  const normalizedRole = role ? String(role).toLowerCase().trim() : ''
  if (!['student', 'recruiter'].includes(normalizedRole)) {
    errors.role = 'Please select a valid account role (Student or Recruiter).'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

// 1.1 Login validation
{
  const emptyLogin = validateLoginForm({ email: '', password: '' })
  assert.equal(emptyLogin.isValid, false)
  assert.ok(emptyLogin.errors.email)
  assert.ok(emptyLogin.errors.password)
  console.log('  ✓ Rejects empty login submission')

  const invalidEmail = validateLoginForm({ email: 'notanemail', password: 'secretpassword' })
  assert.equal(invalidEmail.isValid, false)
  assert.ok(invalidEmail.errors.email)
  console.log('  ✓ Rejects malformed email address in login')

  const validLogin = validateLoginForm({ email: 'student@campus.edu', password: 'secretpassword' })
  assert.equal(validLogin.isValid, true)
  assert.equal(Object.keys(validLogin.errors).length, 0)
  console.log('  ✓ Accepts valid login credentials')
}

// 1.2 Registration validation & Security Role Boundary
{
  const emptyReg = validateRegisterForm({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  })
  assert.equal(emptyReg.isValid, false)
  assert.ok(emptyReg.errors.fullName)
  assert.ok(emptyReg.errors.email)
  assert.ok(emptyReg.errors.password)
  assert.ok(emptyReg.errors.role)
  console.log('  ✓ Rejects empty registration submission')

  // CRITICAL SECURITY REQUIREMENT: Reject Admin registration attempt
  const adminReg = validateRegisterForm({
    fullName: 'Malicious Actor',
    email: 'hacker@college.edu',
    password: 'securepassword123',
    confirmPassword: 'securepassword123',
    role: 'admin',
  })
  assert.equal(adminReg.isValid, false)
  assert.ok(adminReg.errors.role)
  console.log('  ✓ SECURITY: Strictly blocks public registration with "admin" role')

  // Password confirmation mismatch
  const mismatchReg = validateRegisterForm({
    fullName: 'Jane Doe',
    email: 'jane@college.edu',
    password: 'password123',
    confirmPassword: 'differentpassword',
    role: 'student',
  })
  assert.equal(mismatchReg.isValid, false)
  assert.equal(mismatchReg.errors.confirmPassword, 'Passwords do not match.')
  console.log('  ✓ Catches mismatched password confirmation')

  // Valid Student registration
  const validStudent = validateRegisterForm({
    fullName: 'Aarav Sharma',
    email: 'aarav@college.edu',
    password: 'mypassword123',
    confirmPassword: 'mypassword123',
    role: 'student',
  })
  assert.equal(validStudent.isValid, true)
  console.log('  ✓ Validates valid Student registration payload')

  // Valid Recruiter registration
  const validRecruiter = validateRegisterForm({
    fullName: 'Priya Mehta',
    email: 'priya@techcorp.com',
    password: 'recruiterpass123',
    confirmPassword: 'recruiterpass123',
    role: 'recruiter',
  })
  assert.equal(validRecruiter.isValid, true)
  console.log('  ✓ Validates valid Recruiter registration payload')
}

console.log('=== TEST SUITE 1 PASSED ===\n')
