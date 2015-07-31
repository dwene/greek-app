App.controller('paymentController', ['$scope', 'RESTService', '$rootScope',
    function($scope, RESTService, $rootScope) {
        routeChange();
        //skip payment page right now
        $scope.pay = {};
        $scope.submitPayment = function() {

            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/pay/subscribe', $scope.pay)
                .success(function(data) {
                    if (!RESTService(data)) {
                        $location.path("app");
                    } else
                        console.log('ERROR: ' + JSON.stringify(data));
                })
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(data));
                });
        };
    }
]);