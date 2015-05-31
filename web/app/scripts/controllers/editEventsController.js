    App.controller('editEventsController', function($scope, RESTService, $stateParams, $rootScope, $q, Load, $timeout, $location, $mdDialog, Directory, Tags, Events){
        routeChange();
        Directory.get();
        Tags.get();
        Events.get();
        $scope.events = Events.events;
        $scope.directory = Directory.directory;
        $scope.tags = Tags.tags;
        $scope.loading = true;
        var refreshed = false;
        getEventAndSetInfo($scope.events);
        $scope.$on('directory:updated', function(){
            $scope.directory = Directory.directory;
            getEventAndSetInfo($scope.events);
        });
        $scope.$on('events:updated', function(){
            $scope.events = Events.events;
            getEventAndSetInfo($scope.events);
        });
        $scope.$on('tags:updated', function(){
            $scope.tags = Tags.tags;
            console.log('tags I got', $scope.tags);
            getEventAndSetInfo($scope.events);
        });
	   // });
        
        //prevent form from submitting on enter
        $('#newEvent').bind("keyup keypress", function(e) {
              var code = e.keyCode || e.which; 
              if (code  == 13) {               
                e.preventDefault();
                return false;
              }
        });
        
        $scope.openDeleteEventModal = function(){
            $mdDialog.show({
                    controller:('DialogController', ['$scope', '$mdDialog', DialogController]),
                    templateUrl: 'views/templates/deleteEventDialog.html'
                });
        }
        function DialogController($scope, $mdDialog){
            $scope.delete = function(){
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/delete', $stateParams.tag)
                .success(function(data){
                    $scope.loading = true;
                    if (!RESTService.hasErrors(data)){
                        Events.deleteEvent($stateParams.tag);
                        $rootScope.$broadcast('events:updated');
                        $location.url('app/events');
                        
                    }
                });
                $mdDialog.hide();
            }
            $scope.cancelDialog = function(){
                $mdDialog.hide();
            }
        }
        $scope.deleteEvent = function(){
            $('#deleteEventModal').modal('hide');
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/delete', $stateParams.tag)
            .success(function(data){
                $scope.loading = true;
                if (!RESTService.hasErrors(data)){
                    Events.deleteEvent($stateParams.tag);
                    $rootScope.$broadcast('events:updated');
                    $location.url('app/events');
                    
                }
            });
        }

        var date_difference = 0;
        $scope.$watch('date_start', function(){
            if ($scope.date_start){
                $scope.date_end = moment($scope.date_start).add(date_difference).format('MM/DD/YYYY');
                $timeout(function(){$('.picker').trigger('change')});
            }
        });
        $scope.$watch('date_end', function(){
            if ($scope.date_start && $scope.date_end){
                if (moment($scope.date_end, 'MM/DD/YYYY').diff($scope.date_start, 'MM/DD/YYYY') < 0){
                    $scope.date_start = moment($scope.date_end).subtract(date_difference).format('MM/DD/YYYY');
                }
                date_difference = moment($scope.date_end, 'MM/DD/YYYY').diff($scope.date_start, 'MM/DD/YYYY');
                if ($scope.time_start){
                    if (moment($scope.time_end, 'h:mm A').diff(moment($scope.time_start, 'h:mm A')) < 0){
                        $scope.time_end = moment($scope.time_start, 'h:mm A').add('hours', 1).format('h:[00] A');
                    }
                }
            }
            $timeout(function(){$('.picker').trigger('change')});
        });
        $scope.$watch('time_start', function(){
            if ($scope.time_start){
                if ($scope.date_start == $scope.date_end && moment($scope.time_end).diff($scope.time_start) <= 0){
                    $scope.time_end = moment($scope.time_start, 'h:mm A').add('hours', 1).format('h:[00] A');
                }
            }
            $timeout(function(){$('.picker').trigger('change')});
        });
        $scope.$watch('time_end', function(){
            if ($scope.time_start){
                    if (moment($scope.time_end, 'h:mm A').diff(moment($scope.time_start, 'h:mm A')) < 0 && $scope.date_end == $scope.date_start){
                        $scope.time_start = moment($scope.time_end, 'h:mm A').subtract('hours', 1).format('h:[00] A');
                    }
                }
        });
    function getEventAndSetInfo(events){
        if ($scope.directory == null || $scope.events == null || $scope.tags == null){
            return;
        }
        function getUsersFromKey(key){
            for (var i = 0; i < $scope.directory.members.length; i++){
                if ($scope.directory.members[i].key == key){
                    return $scope.directory.members[i];
                }
            }
            return null;
        }
        var event = undefined;
        for (var i = 0; i < events.length; i++){
            if (events[i].key == $stateParams.tag){
                event = events[i];
                break;
            }
        }
        if (event === undefined){
            if (!refreshed){
                Events.refresh();
                refreshed = true;
                console.log('refreshing events');
                return;
            }
            else{
               $scope.eventNotFound = true; 
               $scope.loading = false;
               return;
            }
        }
        $scope.event = event;
        $scope.time_start = momentInTimezone($scope.event.time_start).format('h:mm A');
        $scope.date_start = momentInTimezone($scope.event.time_start).format('MM/DD/YYYY');
        $scope.time_end = momentInTimezone($scope.event.time_end).format('h:mm A');  
        $scope.date_end = momentInTimezone($scope.event.time_end).format('MM/DD/YYYY');
        console.log($scope.time_start);
        console.log($scope.time_end); 

        for (var i = 0; i < $scope.tags.org_tags.length; i++){
            for (var j = 0; j < $scope.event.tags.org_tags.length; j++){
                if ($scope.event.tags.org_tags[j] == $scope.tags.org_tags[i].name){
                    $scope.tags.org_tags[i].checked = true;
                }
            }
        }
        for (var i = 0; i < $scope.tags.perms_tags.length; i++){
            for (var j = 0; j < $scope.event.tags.perms_tags.length; j++){
                if ($scope.event.tags.perms_tags[j] == $scope.tags.perms_tags[i].name.toLowerCase()){
                    $scope.tags.perms_tags[i].checked = true;
                }
            }
        }
        $scope.loading = false;
        $timeout(function(){$('.picker').trigger('change')},200);
    }
    $scope.submitEdits = function(isValid){
        if (isValid){
            
            var to_send = JSON.parse(JSON.stringify($scope.event));
            to_send.time_start = momentUTCTime($scope.date_start + " " + $scope.time_start).format('MM/DD/YYYY hh:mm a');
            to_send.time_end = momentUTCTime($scope.date_end + " " + $scope.time_end).format('MM/DD/YYYY hh:mm a');
            if (moment(to_send.time_end).diff(moment(to_send.time_start)) < 0){
                $scope.time_broken = true;
                return;
            }
            to_send.tags = getCheckedTags($scope.tags);
            console.log(to_send.tags);
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/edit_event', to_send)
            .success(function(data){
                if (!RESTService.hasErrors(data)){
                    $scope.working = "done";
                    $location.url('app/events');
                }
                else{
                    $scope.working = "broken";
                    console.log('ERROR: ',data);
                }
            })
            .error(function(data) {
                $scope.working = "broken";
                console.log('Error: ' , data);
            });
        }
    }
	});