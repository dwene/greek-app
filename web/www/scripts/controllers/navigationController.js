App.controller('navigationController', function($scope, $http, $rootScope, $location, LoadScreen, Inbox, Session, Organization, AUTH_EVENTS){
        routeChange();
        this.session = Session;
        this.me = Organization.me;
        this.subscribed = true;
        this.defaultProfilePicture = '../images/defaultprofile.png';
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
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        }
    });