    App.controller('editEventsController', function($scope, RESTService, $stateParams, $rootScope, $q, Load, $timeout, $location, Directory, Tags, Events){
        routeChange();
        Directory.get();
        Tags.get();
        Events.get();
        $scope.events = Events.events;
        $scope.directory = Directory.directory;
        $scope.tags = Tags.tags;
        $scope.loading = true;
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
            $('#deleteEventModal').modal();
        }
        $scope.deleteEvent = function(){
            $('#deleteEventModal').modal('hide');
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/delete', $stateParams.tag)
            .success(function(data){
                $scope.loading = true;
                if (!RESTService.hasErrors(data)){
                    $location.url('app/events');
                    for (var i = 0; i < $rootScope.events.length; i++){
                        if ($rootScope.events[i].tag == $stateParams.tag){
                            $rootScope.events.splice(i, 1);
                            break;
                        }
                    }
                }
            });
        }

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
            $scope.working = 'pending';
            console.log('new time_start', $scope.date_start + " " + $scope.time_start);
            console.log('new time_end', $scope.date_end + " " + $scope.time_end);
            var to_send = JSON.parse(JSON.stringify($scope.event));
            to_send.time_start = momentUTCTime($scope.date_start + " " + $scope.time_start).format('MM/DD/YYYY hh:mm a');
            to_send.time_end = momentUTCTime($scope.date_end + " " + $scope.time_end).format('MM/DD/YYYY hh:mm a');
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