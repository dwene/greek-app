    App.controller('paymentController', function($scope, $http, $rootScope) {
        routeChange();
        //skip payment page right now
        $scope.pay = {};
        $scope.submitPayment = function(){
            
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/pay/subscribe', packageForSending($scope.pay))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    window.location.assign("#/app");
                }
                else
                    console.log('ERROR: '+JSON.stringify(data));
            })
            .error(function(data) {
                console.log('Error: ' + JSON.stringify(data));
            }); 
        };
    });