App.controller('inboxController', function($scope, RESTService, $rootScope, $timeout, $sce, $mdDialog, removePassedEventsFilter, Inbox){
    
    $scope.inbox = Inbox.notifications;
    $scope.archived = Inbox.hidden_notifications;
    $scope.lengths = Inbox.lengths;
	$scope.openMessageDialog = function(notify, ev){
        Inbox.selectMessage(notify);
        $mdDialog.show({
                controller: 'messageDialogController',
                templateUrl: '../views/templates/messageDialog.html',
                targetEvent: ev
        });
        //$scope.selectedNotification = notify;
        var message = notify.content.replace(/(?:\r\n|\r|\n)/g, '<br />');
        $scope.messageHTML = $sce.trustAsHtml(message);

        // $scope.selectedNotificationUser = undefined;
        // for(var i = 0; i < $scope.directory.members.length; i++){
        //     if ($scope.directory.members[i].key == notify.sender){
        //         $scope.selectedNotificationUser = $scope.directory.members[i];
        //     }
        // }
        // if ($scope.selectedNotification.new){
        //     $scope.notification_lengths.unread --;
        //     $scope.notification_lengths.read ++;
        //     $scope.selectedNotification.new = false;
        // }
        //var key = $scope.selectedNotification.key;
        Inbox.read(notify);
    }
    $scope.openNotificationModal = function(notify){
            $('#notificationModal').modal();
            $scope.selectedNotification = notify;
            var message = notify.content.replace(/(?:\r\n|\r|\n)/g, '<br />');
            $scope.messageHTML = $sce.trustAsHtml(message);
            $scope.selectedNotificationUser = undefined;
            for(var i = 0; i < $scope.directory.members.length; i++){
                if ($scope.directory.members[i].key == notify.sender){
                    $scope.selectedNotificationUser = $scope.directory.members[i];
                }
            }
            if ($scope.selectedNotification.new){
                $scope.notification_lengths.unread --;
                $scope.notification_lengths.read ++;
                $scope.selectedNotification.new = false;
            }
            $rootScope.updateNotificationBadge();
            var key = $scope.selectedNotification.key;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/seen', {'notification': key});
        }
        
    $scope.hideNotification = function(notify, domElement){
        $timeout(function(){
            notify.garbage = true;
        })
        $timeout(function(){
            var key = notify.key;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/hide', {'notification': key})
            .error(function(data) {
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/hide', {'notification': key});
            }); 
            $rootScope.hidden_notifications.unshift(notify);
            if (notify.new){
                $rootScope.notification_lengths.unread--;//#FIXME notifications_lengths.unread is not updating as soon as it is read
                notify.new = false;
                $rootScope.updateNotificationBadge();
            }
            else{
                $rootScope.notification_lengths.read--;
            }
            $rootScope.notification_lengths.hidden++;
            $rootScope.notifications.splice($scope.notifications.indexOf(notify), 1);
            if ($rootScope.notifications && $scope.current && ($scope.current.currentPage * $scope.current.maxPageNumber) == $rootScope.notifications.length && $scope.current.currentPage > 0){
            $scope.current.currentPage = $scope.current.currentPage - 1;
            if (!$scope.noMoreNotifications && !$scope.current_working && $rootScope.notifications.length < $rootScope.notification_lengths.unread + $rootScope.notification_lengths.read && $rootScope.notifications.length < 5){
            $scope.checkForMoreNotifications($scope.current.currentPage, $scope.current.maxPageNumber)
        }
        }
            if (!$scope.noMoreNotifications && !$scope.current_working && $rootScope.notifications.length < $rootScope.notification_lengths.unread + $rootScope.notification_lengths.read && $rootScope.notifications.length <= 5){
                $scope.checkForMoreNotifications($scope.current.currentPage, $scope.current.maxPageNumber);
        }
        })
    }
    
    $scope.unhideNotification = function(notify, domElement){
        $timeout(function(){
            notify.garbage = true;
        })
        $timeout(function(){
            $rootScope.notification_lengths.hidden--;
            $rootScope.notification_lengths.read++;
            var key = notify.key;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/unhide', {'notification': key})
            .error(function(data) {
                RESTService.hasErrors.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/unhide', {'notification': key});
            });
            $rootScope.notifications.unshift(notify);
            $rootScope.hidden_notifications.splice($scope.hidden_notifications.indexOf(notify), 1);
            if ($rootScope.hidden_notifications && $scope.hidden && ($scope.hidden.currentPage * $scope.hidden.maxPageNumber) == $rootScope.hidden_notifications.length && $scope.hidden.currentPage > 0){
            $scope.hidden.currentPage = $scope.hidden.currentPage - 1;
            if (!$scope.noMoreHiddens && !$scope.hidden_working && $rootScope.hidden_notifications.length < $rootScope.notification_lengths.hidden && $rootScope.hidden_notifications.length < 5){
                $scope.checkForMoreHiddenNotifications($scope.hidden.currentPage, $scope.hidden.maxPageNumber)
            }
        }
            if (!$scope.noMoreHiddens && !$scope.hidden_working && $rootScope.hidden_notifications.length < $rootScope.notification_lengths.hidden && $rootScope.hidden_notifications.length <= 5){
                $scope.checkForMoreHiddenNotifications($scope.hidden.currentPage, $scope.hidden.maxPageNumber);
            }
        })
    }
});
