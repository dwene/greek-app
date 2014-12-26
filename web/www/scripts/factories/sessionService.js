App.service('Session', function ($rootScope, AUTH_EVENTS) {
  this.create = function (user_name, token, perms) {
    this.user_name = user_name;
    this.token = token;
    this.perms = perms;
    $rootScope.$broadcast(AUTH_EVENTS.loginSuccessful);
  };
  this.destroy = function () {
    this.user_name = null;
    this.token = null;
    this.perms = null;
  };
  return this;
})