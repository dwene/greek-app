App.controller('navigationController', function($scope, $http, $rootScope, $location, LoadScreen, Inbox, Session, Organization, Notifications, AUTH_EVENTS){
        routeChange();
        // this.session = Session;
        // this.me = Session.me;
        // this.subscribed = true;
        // $scope.prof_pic = '../images/defaultprofile.png';
        // if (Session.me){
        //     $scope.prof_pic = Session.me.prof_pic;
        // }
        // $rootScope.$on(AUTH_EVENTS.loginSuccess, function(){
        //     this.session = Session;
        //     this.me = Session.me;
        //     this.subscribed = true;
        //     $scope.prof_pic = Session.me.prof_pic;
        //     $scope.name = Session.me.first_name +' '+ Session.me.last_name;
        // });
        this.homeButton = function(){
            if (this.checkPermissions(MEMBER)){
                $location.path('app');
            }
            else{
                $location.path('app/directory');
            }
        }
        this.checkPermissions = function(perms){
            if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf(Session.perms)){
                return false;
            }
            return true;   
        }
        //closes the navigation if open and an li is clicked        
        $('.navbar-brand, #mobileMenu, #mainMenu, #mobileSettings').on('click', function(){
            if( $("#mobileSettings").hasClass('in') ){
                     $("#mobileSettings").collapse('hide');
            }
            else{
            //do nothing
            }
        });
        
        $scope.$on('notifications:updated', function(){
            var count = 0;
            for (var i = 0; i < Notifications.notifs.length; i++){
                if (Notifications.notifs[i].new){
                    count++;
                }
            }
            $scope.notification_count = count;
        });

        $scope.logout = function(){
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        }
    });