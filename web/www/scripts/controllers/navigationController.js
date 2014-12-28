App.controller('navigationController', function($scope, $http, $rootScope, $location, LoadScreen, Inbox, Session, Organization, AUTH_EVENTS){
        routeChange();
        this.session = Session;
        this.me = Session.me;
        this.subscribed = true;
        $scope.prof_pic = '../images/defaultprofile.png';
        if (Session.me){
            $scope.prof_pic = Session.me.prof_pic;
        }
        $rootScope.$on(AUTH_EVENTS.loginSuccess, function(){
            this.session = Session;
            this.me = Session.me;
            this.subscribed = true;
            $scope.prof_pic = Session.me.prof_pic;
            console.log('I got my prof_pic', $scope.prof_pic);
            $scope.name = Session.me.first_name +' '+ Session.me.last_name;
        });
        this.homeButton = function(){
            if (this.checkPermissions(MEMBER)){
                $location.path('app');
            }
            else{
                $location.path('app/directory');
            }
        }
        this.checkPermissions = function(perms){
            if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf(this.session.perms)){
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
            $scope.notification_count = Inbox.getLengths().unread;
        });

        $scope.logout = function(){
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        }
    });