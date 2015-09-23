App.controller('navigationController', ['$scope', '$http', '$rootScope', '$mdSidenav', '$mdDialog', '$location', '$timeout', 'Session', 'Organization', 'Notifications', 'AUTH_EVENTS', 'Chatter', 'RESTService',
    function($scope, $http, $rootScope, $mdSidenav, $mdDialog, $location, $timeout, Session, Organization, Notifications, AUTH_EVENTS, Chatter, RESTService) {
        var vm = this;
        vm.toggleSidenav = function(url){
            $mdSidenav('sidenav').toggle();
            $timeout(function(){
                $location.path(url);
            }, 500); 
        };

        vm.toggleNotifications = function(){
            Notifications.readAll();
            $mdSidenav('notifications').toggle();
        };

        vm.goToNotification = function(notify){
            if (notify.type == 'CHATTERCOMMENT'){
                vm.toggleNotifications();
                $timeout(function(){Chatter.openChatterByKey(notify.type_key)});
            }
            else if (notify.type === 'NEWEVENT'){
                vm.toggleNotifications();
                $timeout(function(){$location.path('app/events/' + notify.type_key)})
            }
            else if(notify.link){
                $location.url(notify.link);
                vm.toggleNotifications();
            }
        };

        vm.showHelpdialog = function(){
            $mdDialog.show({
                    controller: ('helpDialogController', ['$scope', '$mdDialog', helpDialogController]),
                    templateUrl: 'views/templates/helpDialog.html'
            });
        };

        function helpDialogController($scope, $mdDialog){
            $scope.message = '';
            $scope.sendHelpMessage = function(){
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/report_error', $scope.message)
                .success(function(){console.log('success');})
                .error(function(){console.log('error');});
                $scope.message = '';
                $mdDialog.hide();
            };
            $scope.hide = function(){
                $mdDialog.hide();
            };
        }

        vm.goToMe = function() {
            $mdSidenav('sidenav').toggle();
            $location.path('app/directory/' + Session.user_name);
        };

        vm.homeButton = function() {
            if (Session.member) {
                $location.path('app');
            } else {
                $location.path('app/directory');
            }
        };

        vm.logout = function() {
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        };

        $scope.$on('notifications:updated', function() {
            var count = 0;
            for (var i = 0; i < Notifications.notifs.length; i++) {
                if (Notifications.notifs[i].new) {
                    count++;
                }
            }
            vm.notification_count = count;
            vm.notifications = Notifications.notifs;
        });
    }
]);