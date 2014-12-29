App.controller('inboxController', function($scope, RESTService, $rootScope, $timeout, $sce, $mdDialog, removePassedEventsFilter, Inbox){
    //Inbox.checkServer();
    Inbox.get();
    $scope.inbox = Inbox.data;
    $scope.archivedLength = 10;
    $scope.messagesLength = 10;
    console.log('scope.inbox', Inbox);
    if ($scope.inbox){
        if ($scope.inbox.messages != null){
            $scope.showInbox;
        }
    }
    $scope.$on('inbox:updated', function(){
        $scope.inbox = Inbox.data;
        $scope.showInbox = true;
    })
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

    $scope.increaseArchivedLength = function(){
        if ($scope.archivedLength >= $scope.inbox.archived.length){
            if ($scope.inbox.archived.length < $scope.inbox.lengths.archived){
                loadMoreArchived();
            }
            else{
                return;
            }
        }
        else{
            $scope.archivedLength = ( $scope.archivedLength + 8 ) > $scope.inbox.lengths.archived ? $scope.inbox.lengths.archived : $scope.archivedLength + 8;
        }
    }


    $scope.increaseMessagesLength = function(){
        console.log('increase messages length called');
        if ($scope.messagesLength >= $scope.inbox.messages.length){
            if ($scope.inbox.messages.length < ($scope.inbox.lengths.unread + $scope.inbox.lengths.read)){
                loadMoreMessages();
            }
            else{
                return;
            }
        }
        else{
            $scope.messagesLength = ( $scope.messagesLength + 8 ) > ($scope.inbox.lengths.unread + $scope.inbox.lengths.read) ? ($scope.inbox.lengths.unread + $scope.inbox.lengths.read) : $scope.archivedLength + 8;
        }
    }

    $scope.archive = function(notification){
        for (var i = 0; i < $scope.inbox.messages.length; i++){
            if ($scope.inbox.messages[i].key == notification.key){
                if ($scope.inbox.messages[i].new){
                    $scope.inbox.messages[i].new = false;
                    $scope.inbox.lengths.unread--;
                }
                else{
                    $scope.inbox.lengths.read--;
                }
                $scope.inbox.archived.append(inbox.messages[i]);
                $scope.inbox.messages.splice(i, 1);
                $scope.inbox.lengths.hidden++;
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/hide', {'notification': notification.key})
                Inbox.update($scope.inbox);
                return;
            }
        }
    }

    $scope.unarchive = function(notification){
        for (var i = 0; i < $scope.inbox.archived.length; i++){
            if ($scope.inbox.archived[i].key == notification.key){
                $scope.inbox.messages.append(inbox.archived[i]);
                $scope.inbox.archived.splice(i, 1);
                $scope.inbox.lengths.hidden--;
                $scope.inbox.lengths.read++;
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/unhide', {'notification': notification.key});
                Inbox.update($scope.inbox);
                return;
            }
        }
    }

    function loadMoreArchived(){
        if ($scope.loadingArchived){
            return;
        }
        if ($scope.inbox.archived){
            if ($scope.inbox.lengths.archived == $scope.inbox.archived.length){
                console.log('we have loaded all archived messages');
                return;
            }
            else{
                $scope.loadingArchived = true;
                console.log('Im doing the rest call for load more archived', $scope.inbox.archived.length);
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/more_hidden', $scope.inbox.archived.length)
                .success(function(data){
                    if (!RESTService.hasErrors(data))
                    {
                        var new_messages = JSON.parse(data.data);
                        var all_messages = $scope.inbox.archived.concat($scope.inbox.messages);
                        for (var i = 0; i < new_messages.length; i++){
                            var add = true;
                            for (var j = 0; j < all_messages.length; j++){
                                if (all_messages[j].key == new_messages[i].key){
                                    add = false;
                                    break;
                                }
                            }
                            if (add){$scope.inbox.archived.push(new_messages[i]);}
                        }
                        Inbox.update($scope.inbox);
                    }
                    else{
                        console.log('ERROR: ',data);
                    }
                    $scope.loadingArchived = false;
                })
                .error(function(data) {
                    $scope.loadingArchived = false;
                    console.log('Error: ' , data);
                }); 
            }
        }
    }

    function loadMoreMessages(){
        if ($scope.loadingMessages){
            return;
        }
        console.log('load more messages called');
        if ($scope.inbox.messages){
            if (($scope.inbox.lengths.unread + $scope.inbox.lengths.read) >= $scope.inbox.messages.length){
                return;
            }
            else{
                $scope.loadingMessages = true;
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/more_notifications', $scope.inbox.messages.length)
                .success(function(data){
                    if (!RESTService.hasErrors(data))
                    {
                        var new_messages = JSON.parse(data.data);
                        var all_messages = $scope.inbox.archived.concat($scope.inbox.messages);
                        for (var i = 0; i < new_messages.length; i++){
                            var add = true;
                            for (var j = 0; j < all_messages.length; j++){
                                if (all_messages[j].key == new_messages[i].key){
                                    add = false;
                                    break;
                                }
                            }
                            if (add){$scope.inbox.messages.push(new_messages[i]);}
                        }
                    }
                    else{
                        console.log('ERROR: ',data);
                    }
                    $scope.loadingMessages = false;
                })
                .error(function(data) {
                    $scope.loadingMessages = true;
                    console.log('Error: ' , data);
                }); 
            }
        }
    }
});








//     $scope.openNotificationModal = function(notify){
//             $('#notificationModal').modal();
//             $scope.selectedNotification = notify;
//             var message = notify.content.replace(/(?:\r\n|\r|\n)/g, '<br />');
//             $scope.messageHTML = $sce.trustAsHtml(message);
//             $scope.selectedNotificationUser = undefined;
//             for(var i = 0; i < $scope.directory.members.length; i++){
//                 if ($scope.directory.members[i].key == notify.sender){
//                     $scope.selectedNotificationUser = $scope.directory.members[i];
//                 }
//             }
//             if ($scope.selectedNotification.new){
//                 $scope.notification_lengths.unread --;
//                 $scope.notification_lengths.read ++;
//                 $scope.selectedNotification.new = false;
//             }
//             $rootScope.updateNotificationBadge();
//             var key = $scope.selectedNotification.key;
//             RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/seen', {'notification': key});
//         }
        
//     $scope.hideNotification = function(notify, domElement){
//         $timeout(function(){
//             notify.garbage = true;
//         })
//         $timeout(function(){
//             var key = notify.key;
//             RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/hide', {'notification': key})
//             .error(function(data) {
//                 RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/hide', {'notification': key});
//             }); 
//             $rootScope.hidden_notifications.unshift(notify);
//             if (notify.new){
//                 $rootScope.notification_lengths.unread--;//#FIXME notifications_lengths.unread is not updating as soon as it is read
//                 notify.new = false;
//                 $rootScope.updateNotificationBadge();
//             }
//             else{
//                 $rootScope.notification_lengths.read--;
//             }
//             $rootScope.notification_lengths.hidden++;
//             $rootScope.notifications.splice($scope.notifications.indexOf(notify), 1);
//             if ($rootScope.notifications && $scope.current && ($scope.current.currentPage * $scope.current.maxPageNumber) == $rootScope.notifications.length && $scope.current.currentPage > 0){
//             $scope.current.currentPage = $scope.current.currentPage - 1;
//             if (!$scope.noMoreNotifications && !$scope.current_working && $rootScope.notifications.length < $rootScope.notification_lengths.unread + $rootScope.notification_lengths.read && $rootScope.notifications.length < 5){
//             $scope.checkForMoreNotifications($scope.current.currentPage, $scope.current.maxPageNumber)
//         }
//         }
//             if (!$scope.noMoreNotifications && !$scope.current_working && $rootScope.notifications.length < $rootScope.notification_lengths.unread + $rootScope.notification_lengths.read && $rootScope.notifications.length <= 5){
//                 $scope.checkForMoreNotifications($scope.current.currentPage, $scope.current.maxPageNumber);
//         }
//         })
//     }
    
//     $scope.unhideNotification = function(notify, domElement){
//         $timeout(function(){
//             notify.garbage = true;
//         })
//         $timeout(function(){
//             $rootScope.notification_lengths.hidden--;
//             $rootScope.notification_lengths.read++;
//             var key = notify.key;
//             RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/unhide', {'notification': key})
//             .error(function(data) {
//                 RESTService.hasErrors.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/unhide', {'notification': key});
//             });
//             $rootScope.notifications.unshift(notify);
//             $rootScope.hidden_notifications.splice($scope.hidden_notifications.indexOf(notify), 1);
//             if ($rootScope.hidden_notifications && $scope.hidden && ($scope.hidden.currentPage * $scope.hidden.maxPageNumber) == $rootScope.hidden_notifications.length && $scope.hidden.currentPage > 0){
//             $scope.hidden.currentPage = $scope.hidden.currentPage - 1;
//             if (!$scope.noMoreHiddens && !$scope.hidden_working && $rootScope.hidden_notifications.length < $rootScope.notification_lengths.hidden && $rootScope.hidden_notifications.length < 5){
//                 $scope.checkForMoreHiddenNotifications($scope.hidden.currentPage, $scope.hidden.maxPageNumber)
//             }
//         }
//             if (!$scope.noMoreHiddens && !$scope.hidden_working && $rootScope.hidden_notifications.length < $rootScope.notification_lengths.hidden && $rootScope.hidden_notifications.length <= 5){
//                 $scope.checkForMoreHiddenNotifications($scope.hidden.currentPage, $scope.hidden.maxPageNumber);
//             }
//         })
//     }
// });
