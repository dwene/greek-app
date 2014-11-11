    App.controller('adminController', function($scope, $http, Load, $rootScope) {
        routeChange();
        $rootScope.requirePermissions(COUNCIL);
        Load.then(function(){
            loadSubscriptionInfo();
            function loadSubscriptionInfo(){
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/pay/subscription_info', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.subscription = JSON.parse(data.data);
                        $scope.subscription_raw = data.data;
                        $scope.loading = false;
                        $scope.pay = {};
                    }
                    else{
                        console.log('ERROR: ',data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            }
            $scope.cancelSubscription = function(){
                $scope.loading = true;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/pay/cancel_subscription', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        setTimeout(function(){$rootScope.refreshPage();}, 150);
                    }
                    else{
                        console.log('ERROR: ',data);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                });
            }
            
            $scope.subscribe = function(paymentData){
                var toSend = "";
                if (paymentData){
                    toSend = paymentData;
                }
                $scope.loading = true;
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/pay/subscribe', packageForSending(toSend))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                        setTimeout(function(){$rootScope.refreshPage();}, 150);
                    }
                    else{
                        console.log('ERROR: '+JSON.stringify(data));
                        $scope.loading = false;
                        $scope.error = JSON.stringify(data);}
                })
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(data));
                });
            };
            
            $scope.changeTheme = function(number){
                
                $rootScope.setColor('color'+number);
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/auth/set_colors', packageForSending({color: $rootScope.color}))
                .success(function(data){
                    if (!checkResponseErrors(data))
                    {
                    }
                    else{
                        $scope.error = true;    
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + JSON.stringify(data));
                });
            }
            
        });
	});