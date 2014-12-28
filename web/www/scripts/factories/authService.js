App.factory('AuthService', function ($http, Session, LoadScreen, $location, $q, RESTService, $rootScope, AUTH_EVENTS) {
  var authService = {};
  var loginAttempted = false;
  
  authService.login = function (credentials) {
    console.log('credentials', credentials);
    return RESTService
      .post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/login', credentials)
      .success(function (data) {
        if (!RESTService.hasErrors(data)){
            var parsed_data = JSON.parse(data.data);
            console.log('Parsed Data in Login', parsed_data);
            $.cookie(USER_NAME, credentials.user_name.toLowerCase(), {expires: new Date(parsed_data.expires)});
            $.cookie(TOKEN, parsed_data.token, {expires: new Date(parsed_data.expires)});
            Session.create(credentials.user_name, parsed_data.token, parsed_data.me);
            return credentials.user_name;
        }
      })
      .error(function (res) {
      })
  };
  authService.loginAttempted = function(){
    return loginAttempted;
  }
  authService.cachedLogin = function(){
    var deferred = $q.defer();
    if (authService.isAuthenticated()){
        deferred.resolve();
    }
    else{
        var to_send = {user_name:$.cookie(USER_NAME), token: $.cookie(TOKEN), data: JSON.stringify('')};
        console.log('what cached login is sending', to_send);
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/token_login', to_send)
            .success(function(data){
              // console.log('cached login. am I authenticated?', authService.isAuthenticated());
              // console.log('data', data);
              loginAttempted = true;
              if (!authService.isAuthenticated()){
                if (!RESTService.hasErrors(data)) { 
                      console.log('CACHED LOGIN SUCCESS');
                      Session.create($.cookie(USER_NAME),$.cookie(TOKEN), JSON.parse(data.data).me);
                      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                }
                else{
                    console.log('cached login failed.');
                    $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                }
              }
                loginAttempted = true;
                deferred.resolve();
            })
            .error(function(){
                console.log('cached login failed.');
                loginAttempted = true;
                deferred.resolve();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            })
    }
        return deferred.promise;
  }

  authService.isAuthenticated = function () {
    return !!Session.user_name;
  };
 
  authService.isAuthorized = function (_perms) {
    return (authService.isAuthenticated() &&
      !(PERMS_LIST.indexOf(_perms) > PERMS_LIST.indexOf(Session.perms)));
  };

  return authService;
})