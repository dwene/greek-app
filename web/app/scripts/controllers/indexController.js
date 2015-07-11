App.controller('indexController', function($scope, RESTService, $rootScope, $timeout, $mdSidenav, $mdDialog, $location, AUTH_EVENTS, Organization, Inbox, Session, Notifications) {
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
        $rootScope.$on('me:updated', function(){
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
           console.log(notify);
           if (notify.type == 'CHATTERCOMMENT'){
             $location.url('app/home/'+notify.key+'');
             $scope.toggleNotifications();
          }
           if(notify.link){
            console.log('Going to notification link', notify.link);
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
        // $scope.logout = function(){
        //     $scope.$emit(AUTH_EVENTS.logoutSuccess);
        //     console.log('Im logging out');
        //     $.removeCookie(USER_NAME);
        //     $.removeCookie(TOKEN);
        //     $.removeCookie(PERMS);
        //     Session.destroy();
        //     console.log('Am I authenticated after destroying session?', AuthService.isAuthenticated());
        //     $.removeCookie('FORM_INFO_EMPTY');
        //     $rootScope.directory = {};
        //     $rootScope.me = undefined;
        //     $rootScope.polls = undefined;
        //     $rootScope.perms = undefined;
        //     $rootScope.events = undefined;
        //     $rootScope.notifications = undefined;
        //     $rootScope.hidden_notifications = undefined;
        //     $rootScope.updateNotificationBadge();
        //     console.log('location', $location.path());
        //     if ($location.path() != 'login'){
        //         $location.path('login');
        //     }
        // }
	});
