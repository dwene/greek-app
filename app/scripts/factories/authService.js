App.factory('AuthService', ['$http', 'Session', '$location', '$q', 'RESTService', '$rootScope', 'AUTH_EVENTS', 'localStorageService', 'Directory', 'Events', 'Tags', 'Polls', 'Links', 'Organization', 'Chatter',
    function($http, Session, $location, $q, RESTService, $rootScope, AUTH_EVENTS, localStorageService, Directory, Events, Tags, Polls, Links, Organization, Chatter) {
        var authService = {};
        var loginAttempted = false;

        authService.login = function(credentials) {
            $rootScope.passwordChanged = false;
            return RESTService
                .post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/login', credentials)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        console.log('login success!!!!');
                        var parsed_data = JSON.parse(data.data);
                        var creds = {
                            USER_NAME: credentials.user_name.toLowerCase(),
                            TOKEN: parsed_data.token
                        };
                        Directory.destroy();
                        Events.destroy();
                        Links.destroy();
                        Organization.destroy();
                        Chatter.destroy();
                        localStorageService.set('credentials', creds);
                        Session.create(creds.USER_NAME, creds.TOKEN, parsed_data.me);
                        Organization.set(parsed_data.organization);
                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                        return credentials.user_name;
                    }
                })
                .error(function(res) {})
        };
        authService.loginAttempted = function() {
            return loginAttempted;
        }
        authService.destroy = function() {
            localStorageService.remove('credentials');
        }
        authService.cachedLogin = function() {
            var deferred = $q.defer();
            if (authService.isAuthenticated()) {
                deferred.resolve();
            } else {
                var creds = localStorageService.get('credentials');
                var to_send = {};
                if (creds) {
                    to_send.user_name = creds.USER_NAME;
                    to_send.token = creds.TOKEN;
                    data = JSON.stringify('');
                }
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/token_login', to_send)
                    .success(function(data) {
                        // console.log('cached login. am I authenticated?', authService.isAuthenticated());
                        // console.log('data', data);
                        loginAttempted = true;
                        if (!authService.isAuthenticated()) {
                            if (!RESTService.hasErrors(data)) {
                                console.log('CACHED LOGIN SUCCESS');
                                var parsed_data = JSON.parse(data.data);
                                Session.create(to_send.user_name, to_send.token, parsed_data.me);
                                Organization.set(parsed_data.organization);
                            } else {
                                console.log('cached login failed.');
                                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                            }
                        }
                        loginAttempted = true;
                        deferred.resolve();
                    })
                    .error(function() {
                        console.log('cached login failed.');
                        loginAttempted = true;
                        deferred.resolve();
                        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                    })
            }
            return deferred.promise;
        }
        authService.token_login = function(user, token) {
            var to_send = {
                user_name: user,
                token: token,
                data: JSON.stringify('')
            };
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/token_login', to_send)
                .success(function(data) {
                    loginAttempted = true;
                    if (!authService.isAuthenticated()) {
                        if (!RESTService.hasErrors(data)) {
                            Session.create(user, token, JSON.parse(data.data).me);
                            var creds = {
                                USER_NAME: user,
                                TOKEN: token
                            };
                            localStorageService.set('credentials', creds);
                            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                        } else {
                            console.log('cached login failed.');
                            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                        }
                    }
                    loginAttempted = true;
                    deferred.resolve();
                })
                .error(function() {
                    console.log('cached login failed.');
                    loginAttempted = true;
                    deferred.resolve();
                    $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                })
        }
        authService.isAuthenticated = function() {
            return !!Session.user_name;
        };

        authService.isAuthorized = function(_perms) {
            return (authService.isAuthenticated() &&
                !(PERMS_LIST.indexOf(_perms) > PERMS_LIST.indexOf(Session.perms)));
        };

        return authService;
    }
])