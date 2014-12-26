App.controller('navigationController', function($scope, $http, $rootScope, $location, LoadScreen, Inbox, Session){
        routeChange();
        this.session = Session;
        this.subscribed = true;
        this.homeButton = function(){
            if (this.checkPermissions(MEMBER)){
                $location.url('app');
            }
            else{
                $location.url('app/directory');
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
            $rootScope.logout();
            window.location.assign("/#/login");
        }
    });