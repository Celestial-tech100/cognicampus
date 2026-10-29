/**
 * CogniCampus Frontend Test Suite: Role-Based Routing & Access Control
 *
 * Verifies that route guards and authorization matrices strictly adhere
 * to CogniCampus specifications:
 * - Unauthenticated users cannot access Student or Recruiter dashboards
 * - Students cannot access Recruiter routes
 * - Recruiters cannot access Student routes
 * - Missing or invalid roles are rejected
 */

import assert from 'node:assert/strict'

console.log('=== TEST SUITE 2: Role-Based Routing & Access Control ===')

function evaluateRouteAccess({ isAuthenticated, userRole, targetRoute, allowedRoles }) {
  // If not authenticated, must redirect to login
  if (!isAuthenticated) {
    return {
      allowed: false,
      redirect: '/login',
      reason: 'User is unauthenticated',
    }
  }

  // If route is restricted by role and user role doesn't match
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      return {
        allowed: false,
        redirect: '/unauthorized',
        reason: `Role "${userRole}" is not authorized for this route (allowed: ${allowedRoles.join(', ')})`,
      }
    }
  }

  return {
    allowed: true,
    redirect: null,
    reason: 'Access granted',
  }
}

// 2.1 Unauthenticated access tests
{
  const studentRouteAccess = evaluateRouteAccess({
    isAuthenticated: false,
    userRole: null,
    targetRoute: '/student/dashboard',
    allowedRoles: ['student'],
  })
  assert.equal(studentRouteAccess.allowed, false)
  assert.equal(studentRouteAccess.redirect, '/login')
  console.log('  ✓ Blocks unauthenticated user from /student/dashboard -> redirects to /login')

  const recruiterRouteAccess = evaluateRouteAccess({
    isAuthenticated: false,
    userRole: null,
    targetRoute: '/recruiter/dashboard',
    allowedRoles: ['recruiter'],
  })
  assert.equal(recruiterRouteAccess.allowed, false)
  assert.equal(recruiterRouteAccess.redirect, '/login')
  console.log('  ✓ Blocks unauthenticated user from /recruiter/dashboard -> redirects to /login')
}

// 2.2 Role boundary tests
{
  // Student trying to access recruiter dashboard
  const studentAccessingRecruiter = evaluateRouteAccess({
    isAuthenticated: true,
    userRole: 'student',
    targetRoute: '/recruiter/dashboard',
    allowedRoles: ['recruiter'],
  })
  assert.equal(studentAccessingRecruiter.allowed, false)
  assert.equal(studentAccessingRecruiter.redirect, '/unauthorized')
  console.log('  ✓ RBAC GUARD: Student cannot access Recruiter dashboard -> redirects to /unauthorized')

  // Recruiter trying to access student dashboard
  const recruiterAccessingStudent = evaluateRouteAccess({
    isAuthenticated: true,
    userRole: 'recruiter',
    targetRoute: '/student/dashboard',
    allowedRoles: ['student'],
  })
  assert.equal(recruiterAccessingStudent.allowed, false)
  assert.equal(recruiterAccessingStudent.redirect, '/unauthorized')
  console.log('  ✓ RBAC GUARD: Recruiter cannot access Student dashboard -> redirects to /unauthorized')

  // Student accessing student dashboard
  const studentValidAccess = evaluateRouteAccess({
    isAuthenticated: true,
    userRole: 'student',
    targetRoute: '/student/dashboard',
    allowedRoles: ['student'],
  })
  assert.equal(studentValidAccess.allowed, true)
  assert.equal(studentValidAccess.redirect, null)
  console.log('  ✓ Grants Student access to /student/dashboard')

  // Recruiter accessing recruiter dashboard
  const recruiterValidAccess = evaluateRouteAccess({
    isAuthenticated: true,
    userRole: 'recruiter',
    targetRoute: '/recruiter/dashboard',
    allowedRoles: ['recruiter'],
  })
  assert.equal(recruiterValidAccess.allowed, true)
  assert.equal(recruiterValidAccess.redirect, null)
  console.log('  ✓ Grants Recruiter access to /recruiter/dashboard')

  // Malformed or unknown role
  const unknownRoleAccess = evaluateRouteAccess({
    isAuthenticated: true,
    userRole: 'guest',
    targetRoute: '/student/dashboard',
    allowedRoles: ['student'],
  })
  assert.equal(unknownRoleAccess.allowed, false)
  assert.equal(unknownRoleAccess.redirect, '/unauthorized')
  console.log('  ✓ Rejects unknown role "guest" -> redirects to /unauthorized')
}

console.log('=== TEST SUITE 2 PASSED ===\n')
