   
console.log('hi i am the index controller');
App.controller('indexController', function($scope, $http, LoadScreen, $rootScope, $timeout, $mdSidenav, $mdDialog) {
        $scope.homeButton = function(){
            if ($rootScope.checkAlumni()){
                window.location.assign('#/app/directory/members');
            }
            else{
                window.location.assign('#/app/home');
            }
        }
        $scope.sendHelpMessage = function(isValid, content){
            console.log('I am getting submitted');
            if(isValid){
                $scope.sendingHelp='pending';
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/report_error', packageForSending(content))
                .success(function(){console.log('success');
//                $('#helpModal').modal('hide');
                $scope.helpMessage.$setPristine();
                $scope.message={};
                $scope.sendingHelp='done';
                })
                .error(function(){console.log('error');
                $scope.sendingHelp='broken';})
            }
            else{
            //do nothing
            }
        }
        $scope.toggleSidenav = function(){
            $mdSidenav('sidenav').toggle();
        }
        $scope.showHelpdialog = function(){
            $mdDialog.show({
                    controller: 'dialogController',
                    templateUrl: '../views/templates/helpDialog.html'
            });
        }

	});

// App.controller('dialogController', function dialogController($scope, $http, LoadScreen, $rootScope, $timeout, $mdSidenav, $mdDialog) {
//             $scope.sendHelpMessage = function(isValid, content){
//                 console.log('I am getting submitted');
//                 if(isValid){
//                     $scope.sendingHelp='pending';
//                     $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/report_error', packageForSending(content))
//                     .success(function(){console.log('success');
//                     $scope.helpMessage.$setPristine();
//                     $scope.message={};
//                     $scope.sendingHelp='done';
//                     $mdDialog.hide();
//                     })
//                     .error(function(){console.log('error');
//                     $scope.sendingHelp='broken';})
//                 }
//                 else{
//                 //do nothing
//                 }
//             }
// });