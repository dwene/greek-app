    App.controller('editEventsController', function($scope, $http, $stateParams, $rootScope, $q, Load, getEvents, $timeout){
        routeChange();
        $scope.loading = true;
        Load.then(function(){
        $rootScope.requirePermissions(LEADERSHIP);
        $scope.tags = $rootScope.tags;
        var event_tag = $stateParams.tag;
        tryLoadEvent(0);
	   });
        
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
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/delete', packageForSending({tag: $stateParams.tag}))
            .success(function(data){
                $scope.loading = true;
                if (!checkResponseErrors(data)){
                    window.location.replace('#/app/events');
                    for (var i = 0; i < $rootScope.events.length; i++){
                        if ($rootScope.events[i].tag == $stateParams.tag){
                            $rootScope.events.splice(i, 1);
                            break;
                        }
                    }
                }
            });
        }
        function tryLoadEvent(count){
            LoadEvents();
            function LoadEvents(){
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
                    .success(function(data){
                        if (!checkResponseErrors(data)){
                            var events = JSON.parse(data.data);
                            $rootScope.events = events;
                            getEventAndSetInfo(events, count);
                        }
                        else{
                            console.log('ERROR: ',data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' , data);
                    });
                }
        }   
        function getEventAndSetInfo(events, count){
            function getUsersFromKey(key){
                for (var i = 0; i < $rootScope.directory.members.length; i++){
                    console.log($rootScope.directory.members[i].key);
                    if ($rootScope.directory.members[i].key == key){
                        return $rootScope.directory.members[i];
                    }
                }
                return null;
            }
            var event = undefined;
            for (var i = 0; i < events.length; i++){
                if (events[i].tag == $stateParams.tag){
                    event = events[i];
                    break;
                }
            }
            if (event === undefined){
                if (count < 2){
                    console.log(count);
                setTimeout(function(){tryLoadEvent(count+1)}, 500);
                return;
                }
                else{
                    $scope.eventNotFound = true;
                    $scope.loading = false;
                    return;
                }
            }
            event.going_list = []
            event.not_going_list = []
            for (var i = 0; i < event.going.length; i++){
                event.going_list.push(getUsersFromKey(event.going[i]));
            }
            for (var i = 0; i < event.not_going.length; i++){
                event.not_going_list.push(getUsersFromKey(event.not_going[i]));
            }
            $scope.event = event;
            $scope.time_start = momentInTimezone($scope.event.time_start).format('hh:mm A');
            $scope.date_start = momentInTimezone($scope.event.time_start).format('MM/DD/YYYY');
            $scope.time_end = momentInTimezone($scope.event.time_end).format('hh:mm A');  
            $scope.date_end = momentInTimezone($scope.event.time_end).format('MM/DD/YYYY');  
            console.log($scope.event.time_end);

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
            var to_send = JSON.parse(JSON.stringify($scope.event));
            to_send.time_start = momentUTCTime($scope.date_start + " " + $scope.time_start).format('MM/DD/YYYY hh:mm a');
            to_send.time_end = momentUTCTime($scope.date_end + " " + $scope.time_end).format('MM/DD/YYYY hh:mm a');
            to_send.tags = getCheckedTags($scope.tags);
            console.log(to_send.tags);
        $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/edit_event', packageForSending(to_send))
            .success(function(data){
                if (!checkResponseErrors(data)){
                    $scope.working = "done";
                    getEvents;
                    window.location.assign('#/app/events');
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