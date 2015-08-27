App.controller('adminController', ['$scope', 'RESTService', '$rootScope',
    function($scope, RESTService, $rootScope) {

        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/admin/v1/features_info', '')
            .success(function(data) {
                if (!RESTService.hasErrors(data)) {
                    var features = JSON.parse(data.data);
                    for (var i = 0 ; i < features.length; i++){
                        if (features[i].expires){
                            features[i].expires = momentInTimezone(features[i].expires).calendar();
                        }
                    }
                    $scope.features = features;
                } else {
                    console.log('ERROR: ', data);
                }
            })
            .error(function(data) {
                console.log('Error: ', data);
            });

        $scope.cancelSubscription = function() {
            $scope.loading = true;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/pay/cancel_subscription', '')
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        setTimeout(function() {
                            $rootScope.refreshPage();
                        }, 150);
                    } else {
                        console.log('ERROR: ', data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        }

        $scope.subscribe = function(paymentData) {
            var toSend = "";
            if (paymentData) {
                toSend = paymentData;
            }
            $scope.loading = true;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/pay/subscribe', toSend)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        setTimeout(function() {
                            $rootScope.refreshPage();
                        }, 150);
                    } else {
                        console.log('ERROR: ' + JSON.stringify(data));
                        $scope.loading = false;
                        $scope.error = JSON.stringify(data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(data));
                });
        };

        $scope.changeTheme = function(color) {

            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/auth/v1/set_colors', {
                color: $rootScope.color
            })
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {} else {
                        $scope.error = true;
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(data));
                });
        }
    }
]);