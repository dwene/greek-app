App.controller('appController', ['$scope', '$interval', '$rootScope', '$timeout', '$location', '$mdSidenav', '$mdDialog', 'localStorageService', 'AuthService', 'AUTH_EVENTS', 'Organization', 'Session', 'Notifications', 'Directory', 'Updates', 'Chatter',
    function($scope, $interval, $rootScope, $timeout, $location, $mdSidenav, $mdDialog, localStorageService, AuthService, AUTH_EVENTS, Organization, Session, Notifications, Directory, Updates, Chatter) {
        var vm = this,
        notification_update_interval;
        $scope.perms = Session.perms;
        vm.me = Session.me;
        vm.subscribed = true;
        vm.session = Session;
        vm.prof_pic = 'images/defaultprofile.png';
        AuthService.cachedLogin();
        $scope.authenticated = AuthService.isAuthenticated();

        $scope.toggleSidenav = function(url){
            $mdSidenav('sidenav').toggle();
            $timeout(function(){
                $location.path(url);
            }, 500);
            
        };
        $scope.toggleNotifications = function(){
            Notifications.readAll();
            $mdSidenav('notifications').toggle();
        };

        $scope.goToNotification = function(notify){
            if (notify.type == 'CHATTERCOMMENT'){
                $scope.toggleNotifications();
                $timeout(function(){Chatter.openChatterByKey(notify.type_key)});
            }
            else if (notify.type === 'NEWEVENT'){
                $scope.toggleNotifications();
                $timeout(function(){$location.path('app/events/' + notify.type_key)})
            }
            else if(notify.link){
                $location.url(notify.link);
                $scope.toggleNotifications();
            }
        };

        $scope.showHelpdialog = function(){
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
        $scope.checkPermissions = function(perms){
            if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf(Session.perms)){
                return false;
            }
            return true;
        };

        $scope.$on('organization:updated', function() {
            if ($rootScope.color != Organization.organization.color) {
                $scope.authenticated = false;
                $rootScope.color = Organization.organization.color;
                $timeout(function() {
                    $scope.authenticated = AuthService.isAuthenticated();
                });
            }
        });

        $rootScope.$on(AUTH_EVENTS.logoutSuccess, function() {
            $scope.authenticated = false;
            if (angular.isDefined(notification_update_interval)) {
                $interval.cancel(notification_update_interval);
            }
        });

        $scope.$on('$destroy', function() {
            if (angular.isDefined(notification_update_interval)) {
                $interval.cancel(notification_update_interval);
            }
        });

        $scope.$on(AUTH_EVENTS.sessionTimeout, function() {
            $scope.authenticated = AuthService.isAuthenticated();
        });

        $scope.$on('me:updated', function(){
            vm.me = Session.me;
            vm.name = Session.me.first_name +' '+ Session.me.last_name;
            vm.email = Session.me.email;
            vm.prof_pic = Session.me.prof_pic ? Session.me.prof_pic : 'images/defaultprofile.png';
        });

        $rootScope.$on(AUTH_EVENTS.loginSuccess, function(){
            Notifications.get();
            $scope.authenticated = true;
            if (!angular.isDefined(notification_update_interval)) {
                Updates.get();
                notification_update_interval = $interval(function(){
                    Updates.get();
                }, 15000)
            }
            vm.session = Session;
            vm.perms = Session.perms;
            vm.me = Session.me;
            vm.name = Session.me.first_name +' '+ Session.me.last_name;
            vm.email = Session.me.email;
            vm.prof_pic = Session.me.prof_pic ? Session.me.prof_pic : 'images/defaultprofile.png';
            vm.council = Session.council;
            vm.leadership = Session.leadership;
            vm.member = Session.member;
        });
    }
]);