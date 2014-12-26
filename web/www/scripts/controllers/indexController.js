App.controller('indexController', function($scope, RESTService, $rootScope, $timeout, $mdSidenav, $mdDialog, AUTH_EVENTS, Organization, Inbox, Session) {
        $scope.item = Organization.me;

        $scope.$on(AUTH_EVENTS.loginSuccess, function(){
            $scope.perms = Session.perms;
        });
        $scope.$on('notifications:updated', function(){
            $scope.notificationLength = Inbox.getLengths();
        });
        $scope.sendHelpMessage = function(isValid, content){
            console.log('I am getting submitted');
            if(isValid){
                $scope.sendingHelp='pending';
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/report_error', content)
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
        $scope.logout = function(){
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        }
	});