App.factory('RESTService', ['$http', 'Session', 'AUTH_EVENTS', '$rootScope',
    function($http, Session, AUTH_EVENTS, $rootScope) {
        var dataFactory = {};

        dataFactory.packageContent = function(_data) {
            var out = {
                user_name: Session.user_name,
                token: Session.token,
                data: JSON.stringify(_data)
            };
            return out;
        };
        dataFactory.post = function(url, data, extras) {

            console.log(('post called: ' + url.toString()), data);
            return $http.post(url, dataFactory.packageContent(data), extras);
        };
        dataFactory.hasErrors = function(received_data) {
            var response = received_data;
            if (response) {
                if (received_data.error == 'TOKEN_EXPIRED' || received_data.error == 'BAD_TOKEN' || received_data.error == 'BAD_FIRST_TOKEN') {
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    return true;
                } else if (response.error == '') {
                    return false;
                }
                console.log('ERROR: ', response.error);
                return true;
            }
        };
        return dataFactory;
    }
]);