App.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});

App.constant('USER_ROLES', {
    all: '*',
    council: 'council',
    leadership: 'leadership',
    member: 'member',
    alumni: 'alumni'
});