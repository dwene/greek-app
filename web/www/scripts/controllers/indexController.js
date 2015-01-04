App.controller('indexController', function($scope, RESTService, $rootScope, $timeout, $mdSidenav, $mdDialog, AUTH_EVENTS, Organization, Inbox, Session) {
        $scope.item = Organization.me;
        $scope.perms = Session.perms;
        $scope.me = Session.me;
        $scope.subscribed = true;
        $scope.session = Session;
        $scope.prof_pic = '../images/defaultprofile.png';
        $scope.$on(AUTH_EVENTS.loginSuccess, function(){
            $scope.session = Session;
            $scope.perms = Session.perms;
            $scope.me = Session.me;
            $scope.name = Session.me.first_name +' '+ Session.me.last_name;
            $scope.email = Session.me.email;
            $scope.prof_pic = Session.me.prof_pic ? Session.me.prof_pic : '../images/defaultprofile.png';
        })
        $scope.$on('notifications:updated', function(){
            $scope.notificationLength = Inbox.getLengths();
        });
        $scope.sendHelpMessage = function(isValid, content){
            console.log('I am getting submitted');
            if(isValid){
                $scope.sendingHelp='pending';
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/report_error', content)
                .success(function(){console.log('success');
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
        $scope.toggleNotifications = function(){
            $mdSidenav('notifications').toggle();
        }
        $scope.showHelpdialog = function(){
            $mdDialog.show({
                    controller: 'dialogController',
                    templateUrl: '../views/templates/helpDialog.html'
            });
        }
        $scope.checkPermissions = function(perms){
            if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf(Session.perms)){
                return false;
            }
            return true;   
        }
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