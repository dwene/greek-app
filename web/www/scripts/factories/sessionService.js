App.service('Session', function ($rootScope, AUTH_EVENTS) {
  this.create = function (user_name, token, me) {
    this.user_name = user_name;
    this.token = token;
    this.me = me;
    this.perms = this.me.perms;
    $rootScope.$broadcast(AUTH_EVENTS.loginSuccessful);
  };
  this.destroy = function () {
    this.user_name = null;
    this.token = null;
    this.perms = null;
    this.me = null;
  };
  this.updateMe = function(){
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/get_user_directory_info', '')
        .success(function(data){
            if (!RESTService.hasErrors(data))
            {
                this.me = JSON.parse(data.data);
            }
            else
            {
                console.log('ERROR: ',data);
            }
        })
        .error(function(data) {
            console.log('Error: ' , data);
        });
  }
  return this;
})