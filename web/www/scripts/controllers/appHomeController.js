    App.controller('appHomeController', function($scope, RESTService, $rootScope, $timeout, $sce, $mdDialog, Directory, Events, removePassedEventsFilter, Directory, Inbox) {
        routeChange();
       // Load.then(function(){
        $scope.events_loaded = false;
        $scope.notifications_loaded = false;
        $scope.noMoreHiddens = false;
        $scope.directory = Directory.directory;
        
       $scope.createEvents = function(){
            $scope.events = Events.events;
            $scope.events_loaded = Events.check();
        }
        $scope.createEvents();
        $scope.$on('events:updated', function(){ $scope.createEvents(); });
            
        $scope.checkForMoreHiddenNotifications = function(pageNum, max){
            var len = $rootScope.hidden_notifications.length;
            $scope.hidden_working = true;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/more_hidden', len)
            .success(function(data){
                if (!RESTService.hasErrors(data))
                {
                    var new_hiddens = JSON.parse(data.data);
                    var next = false;
                    for (var i = 0; i < new_hiddens.length; i++){
                        next = false;
                        for (var j = 0; j < $rootScope.hidden_notifications.length; j++){
                            if ($rootScope.hidden_notifications[j].key == new_hiddens[i].key){
                                next = true;
                                break;
                            }
                        }
                        if (next){ continue;}
                        for (var j = 0; j < $rootScope.notifications.length; j++){
                            if ($rootScope.notifications[j].key == new_hiddens[i].key){
                                next = true;
                                break;
                            }
                        }
                        if (next){ continue;}
                        $rootScope.hidden_notifications.push(new_hiddens[i]);
                    }
//                    $rootScope.hidden_notifications = new_hiddens;
                    if ($rootScope.hidden_notifications.length > ((pageNum+1)*max)){
                        $scope.hidden.currentPage++;
                    }
                    else{
                        $scope.noMoreHiddens = true;
                    }
                }
                else{
                    console.log('ERROR: ',data);
                }
                $scope.hidden_working = false;
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.hidden_working = false;
            }); 
        }
        
        $scope.checkForMoreNotifications = function(pageNum, max){
            var len = $rootScope.notifications.length;
            $scope.current_working = true;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/more_notifications', len)
            .success(function(data){
                if (!RESTService.hasErrors(data))
                {
                    var new_hiddens = JSON.parse(data.data);
                    var next = false;
                    for (var i = 0; i < new_hiddens.length; i++){
                        next = false;
                        for (var j = 0; j < $rootScope.hidden_notifications.length; j++){
                            if ($rootScope.hidden_notifications[j].key == new_hiddens[i].key){
                                next = true;
                                break;
                            }
                        }
                        if (next){ continue;}
                        for (var j = 0; j < $rootScope.notifications.length; j++){
                            if ($rootScope.notifications[j].key == new_hiddens[i].key){
                                next = true;
                                break;
                            }
                        }
                        if (next){ continue;}
                        $rootScope.notifications.push(new_hiddens[i]);
                    }
//                    $rootScope.hidden_notifications = new_hiddens;
                    if ($rootScope.notifications.length > ((pageNum+1)*(max))){
                        $scope.current.currentPage++;
                    }
                    else{
                        $scope.noMoreNotifications = true;
                    }
                }
                else{
                    console.log('ERROR: ',data);
                }
                $scope.current_working = false;
                $scope.working = false;
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.current_working = false;
                $scope.working = false;
            }); 
        }  
        
//        $scope.notificationPreview = function(notify){
//            return notify.replace(/\r?\n|\r/g," "); 
//            }
        
//        $rootScope.$watch('notifications', function(){
//            console.log('im checking');
//            console.log($scope.current.currentPage * $scope.current.maxPageNumber);
//        })
        $scope.updateStatus = function(status){
        var to_send = {'status': status};
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_status', to_send);
            $('#status').val("");
            if ($rootScope.me){
                $rootScope.me.status = status;
            }
            $scope.status = '';
        }
        $scope.clearStatus = function(){
            var status = "";
            $scope.status = "";
            var to_send = {status: status};
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_status', to_send)
            .success(function(data){
                if (RESTService.hasErrors(data))
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            }); 
            $('#status').val("");
            if ($rootScope.me){
                $rootScope.me.status = status;
            }            
        }
        
        $scope.openMessagedialog = function(){
            $mdDialog.show({
                    controller: 'dialogController',
                    templateUrl: '../views/templates/messageDialog.html'
            });
        
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
        
        // $scope.openNotificationModal = function(notify){
        //     $('#notificationModal').modal();
        //     $scope.selectedNotification = notify;
        //     var message = notify.content.replace(/(?:\r\n|\r|\n)/g, '<br />');
        //     $scope.messageHTML = $sce.trustAsHtml(message);
        //     $scope.selectedNotificationUser = undefined;
        //     for(var i = 0; i < $scope.directory.members.length; i++){
        //         if ($scope.directory.members[i].key == notify.sender){
        //             $scope.selectedNotificationUser = $scope.directory.members[i];
        //         }
        //     }
        //     if ($scope.selectedNotification.new){
        //         $scope.notification_lengths.unread --;
        //         $scope.notification_lengths.read ++;
        //         $scope.selectedNotification.new = false;
        //     }
        //     $rootScope.updateNotificationBadge();
        //     var key = $scope.selectedNotification.key;
        //     RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/seen', {'notification': key});
        // }
        
        // $scope.hideNotification = function(notify, domElement){
        //     $timeout(function(){
        //         notify.garbage = true;
        //     })
        //     $timeout(function(){
        //         var key = notify.key;
        //         RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/hide', {'notification': key})
        //         .error(function(data) {
        //             RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/hide', {'notification': key});
        //         }); 
        //         $rootScope.hidden_notifications.unshift(notify);
        //         if (notify.new){
        //             $rootScope.notification_lengths.unread--;//#FIXME notifications_lengths.unread is not updating as soon as it is read
        //             notify.new = false;
        //             $rootScope.updateNotificationBadge();
        //         }
        //         else{
        //             $rootScope.notification_lengths.read--;
        //         }
        //         $rootScope.notification_lengths.hidden++;
        //         $rootScope.notifications.splice($scope.notifications.indexOf(notify), 1);
        //         if ($rootScope.notifications && $scope.current && ($scope.current.currentPage * $scope.current.maxPageNumber) == $rootScope.notifications.length && $scope.current.currentPage > 0){
        //         $scope.current.currentPage = $scope.current.currentPage - 1;
        //         if (!$scope.noMoreNotifications && !$scope.current_working && $rootScope.notifications.length < $rootScope.notification_lengths.unread + $rootScope.notification_lengths.read && $rootScope.notifications.length < 5){
        //         $scope.checkForMoreNotifications($scope.current.currentPage, $scope.current.maxPageNumber)
        //     }
        //     }
        //         if (!$scope.noMoreNotifications && !$scope.current_working && $rootScope.notifications.length < $rootScope.notification_lengths.unread + $rootScope.notification_lengths.read && $rootScope.notifications.length <= 5){
        //             $scope.checkForMoreNotifications($scope.current.currentPage, $scope.current.maxPageNumber);
        //     }
        //     })
        // }
        
        // $scope.unhideNotification = function(notify, domElement){
        //     $timeout(function(){
        //         notify.garbage = true;
        //     })
        //     $timeout(function(){
        //         $rootScope.notification_lengths.hidden--;
        //         $rootScope.notification_lengths.read++;
        //         var key = notify.key;
        //         RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/unhide', {'notification': key})
        //         .error(function(data) {
        //             RESTService.hasErrors.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/notifications/unhide', {'notification': key});
        //         });
        //         $rootScope.notifications.unshift(notify);
        //         $rootScope.hidden_notifications.splice($scope.hidden_notifications.indexOf(notify), 1);
        //         if ($rootScope.hidden_notifications && $scope.hidden && ($scope.hidden.currentPage * $scope.hidden.maxPageNumber) == $rootScope.hidden_notifications.length && $scope.hidden.currentPage > 0){
        //         $scope.hidden.currentPage = $scope.hidden.currentPage - 1;
        //         if (!$scope.noMoreHiddens && !$scope.hidden_working && $rootScope.hidden_notifications.length < $rootScope.notification_lengths.hidden && $rootScope.hidden_notifications.length < 5){
        //             $scope.checkForMoreHiddenNotifications($scope.hidden.currentPage, $scope.hidden.maxPageNumber)
        //         }
        //     }
        //         if (!$scope.noMoreHiddens && !$scope.hidden_working && $rootScope.hidden_notifications.length < $rootScope.notification_lengths.hidden && $rootScope.hidden_notifications.length <= 5){
        //             $scope.checkForMoreHiddenNotifications($scope.hidden.currentPage, $scope.hidden.maxPageNumber);
        //         }
        //     })
        // }
        
        $scope.showDate = function(start, end){
            var mStart = momentInTimezone(start);

            if (mStart.diff(moment().add(6, 'days')) > 0){
               return mStart.fromNow(); 
            }
            else if (mStart.diff(moment()) > 0){
                return mStart.calendar();
            }
            var mEnd = momentInTimezone(end);
            if (mStart.diff(moment()) < 0 && mEnd.diff(moment())>0){
                return 'Happening Now';
            }
            if (mEnd.diff(moment()) < 0){
                return 'Already Happened';
            }
        }
        
        $scope.formatTimestamp = function(timestamp){
            return momentInTimezone(timestamp).calendar();
        }
        $scope.closeNotificationModal = function(notify){
            $('#notificationModal').modal('hide');
        }
    //});
});