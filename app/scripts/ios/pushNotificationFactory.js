App.factory('Links', ['RESTService', '$rootScope', 'AUTH_EVENTS',   
    function(RESTService, $rootScope, AUTH_EVENTS) {
        var pushNotifiation;
        $rootScope.$on(AUTH_EVENTS.loginSuccess, function(){
            document.addEventListener("deviceready", function(){
                pushNotification = window.plugins.pushNotification;
                pushNotification.register(
                    tokenHandler,
                    errorHandler,
                    {
                        "badge":"true",
                        "sound":"true",
                        "alert":"true",
                        "ecb":"onNotificationAPN"
                    });
            });
            function tokenHandler (result) {
                // Your iOS push server needs to know the token before it can push to this device
                // here is where you might want to send it the token for later use.
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/set_iphone_token',result)
                .success(function(data){
                })
                .error(function(data){
                    alert('Push Registration failed :(');
                });
            }
            function errorHandler (error) {
                alert('error = ' + error);
            }
        });
    }
]);
