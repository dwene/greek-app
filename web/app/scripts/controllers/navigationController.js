App.controller('navigationController', ['$scope', '$http', '$rootScope', '$mdSidenav', '$location', 'Session', 'Organization', 'Notifications', 'AUTH_EVENTS',
    function($scope, $http, $rootScope, $mdSidenav, $location, Session, Organization, Notifications, AUTH_EVENTS) {
        $scope.goToMe = function() {
            $mdSidenav('sidenav').toggle();
            $location.path('app/directory/' + Session.user_name);
        }
        this.homeButton = function() {
            if (this.checkPermissions(MEMBER)) {
                $location.path('app');
            } else {
                $location.path('app/directory');
            }
        }
        this.checkPermissions = function(perms) {
            if (PERMS_LIST.indexOf(perms) > PERMS_LIST.indexOf(Session.perms)) {
                return false;
            }
            return true;
        }
        //closes the navigation if open and an li is clicked        
        $('.navbar-brand, #mobileMenu, #mainMenu, #mobileSettings').on('click', function() {
            if ($("#mobileSettings").hasClass('in')) {
                $("#mobileSettings").collapse('hide');
            } else {
                //do nothing
            }
        });

        $scope.$on('notifications:updated', function() {
            var count = 0;
            for (var i = 0; i < Notifications.notifs.length; i++) {
                if (Notifications.notifs[i].new) {
                    count++;
                }
            }
            $scope.notification_count = count;
        });

        $scope.logout = function() {
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        }
    }
]);