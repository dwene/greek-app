App.controller('forgotPasswordController', ['$scope', 'RESTService', '$rootScope',
    function($scope, RESTService, $rootScope) {
        routeChange();
        $scope.sentEmail = false;
        $scope.reset = function(input) {
            $scope.gettingnewPassword = 'pending';

            function validEmail(v) {
                var r = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
                return (v.match(r) == null) ? false : true;
            }
            if (validEmail(input)) {
                to_send = {
                    email: input,
                    user_name: ''
                };
            } else {
                to_send = {
                    email: '',
                    user_name: input.toLowerCase()
                };
            }
            console.log(to_send);
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/forgot_password', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        if (data.data == 'OK') {
                            $scope.sentEmail = true;
                            $scope.gettingnewPassword = 'done';
                        } else {
                            $scope.returned_choices = JSON.parse(data.data);
                            $scope.showList = true;
                        }
                        $scope.gettingnewPassword = 'done';
                    } else {
                        $scope.emailFailed = true;
                        $scope.gettingnewPassword = 'broken';
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                    $scope.emailFailed = true;
                });
        }
    }
]);