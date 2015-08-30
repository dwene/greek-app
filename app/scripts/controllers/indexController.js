App.controller('indexController', ['$scope', 'RESTService', '$timeout', '$mdSidenav', '$mdDialog', '$location', 'AUTH_EVENTS', 'Organization', 'Session', 'Notifications', 'Chatter',
  function($scope, RESTService, $timeout, $mdSidenav, $mdDialog, $location, AUTH_EVENTS, Organization, Session, Notifications, Chatter) {
        $scope.notifications = Notifications.notifs;
        $scope.item = Organization.me;
        $scope.perms = Session.perms;
        $scope.me = Session.me;
        $scope.subscribed = true;
        $scope.session = Session;
        $scope.prof_pic = 'images/defaultprofile.png';
        $scope.$on(AUTH_EVENTS.loginSuccess, function(){
            $scope.session = Session;
            $scope.perms = Session.perms;
            $scope.me = Session.me;
            $scope.name = Session.me.first_name +' '+ Session.me.last_name;
            $scope.email = Session.me.email;
            $scope.prof_pic = Session.me.prof_pic ? Session.me.prof_pic : 'images/defaultprofile.png';
        });
        $scope.$on('me:updated', function(){
            $scope.me = Session.me;
            $scope.name = Session.me.first_name +' '+ Session.me.last_name;
            $scope.email = Session.me.email;
            $scope.prof_pic = Session.me.prof_pic ? Session.me.prof_pic : 'images/defaultprofile.png';
        });
        $scope.$on('notifications:updated', function(){
            $scope.notifications = Notifications.notifs;
        });
        $scope.toggleSidenav = function(url){
            $mdSidenav('sidenav').toggle();
            if (url){
                $timeout(function(){$location.url(url);}, 500);
            }

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
	}
]);
