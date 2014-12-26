    App.controller('eventInfoController', function($scope, RESTService, $stateParams, $rootScope, $q, Load, Events, Directory){
        routeChange();
        
        $scope.going = false;
        $scope.not_going = false;
        $scope.loading = true;
        var refreshed = false;
        $scope.goToReport = function(){
            window.location.assign("#/app/events/" + $stateParams.tag + "/report");
        }
        $scope.saveEvent = function(){
              /*BEGIN:VCALENDAR
                VERSION:2.0
                BEGIN:VEVENT
                DTEND;TZID=America/Chicago:20140709T110000
                SUMMARY:Test Event
                DTSTART;TZID=America/Chicago:20140709T100000
                DESCRIPTION:This is the description!
                END:VEVENT
                END:VCALENDAR*/
            var event = $scope.event;
            var out_string = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n';
            out_string += 'DTSTART:'+moment(event.time_start).format('YYYYMMDDTHHmmss')+'Z\n';
            out_string += 'DTEND:'+moment(event.time_end).format('YYYYMMDDTHHmmss') + 'Z\n';
            out_string += 'SUMMARY:'+event.title.replace(/(\r\n|\n|\r)/gm," ") + '\n';
            out_string += 'DESCRIPTION:'+event.description.replace(/(\r\n|\n|\r)/gm," ") + '\n';
            out_string += 'END:VEVENT\nEND:VCALENDAR';
            var a         = document.createElement('a');
               a.href        = 'data:text/calendar,' + encodeURIComponent(out_string);
               a.target      = '_blank';
               a.download    = event.title.replace(/(\r\n|\n|\r)/gm," ") + '.ics';
               console.log(a.href);
               document.body.appendChild(a);
               a.click();
               document.body.removeChild(a);
        }
        
        $scope.mapEvent = function(){
            if ($scope.event.address){
                return $scope.event.address.split(' ').join('+');
            }
            return " ";
        }
        Load.then(function(){
        $rootScope.requirePermissions(MEMBER);
        // var event_tag = $stateParams.tag;

        if (Directory.check()){
            $scope.directory = Directory.get();
            getEventAndSetInfo($scope.events);
        }
        $scope.$on('directory:updated', function(){
            $scope.directory = Directory.get();
            getEventAndSetInfo($scope.events);
        });
        if (Events.check()){
            $scope.events = Events.get();
            getEventAndSetInfo($scope.events);
        }
        $scope.$on('events:updated', function(){
            $scope.events = Events.get();
            getEventAndSetInfo($scope.events);
        });
	   });
        // function tryLoadEvent(count){
        //     LoadEvents();
        //     function LoadEvents(){
        //         $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
        //             .success(function(data){
        //                 if (!checkResponseErrors(data)){
        //                     var events = JSON.parse(data.data);
        //                     $scope.events = events;
        //                     getEventAndSetInfo(events, count);
        //                 }
        //                 else{
        //                     console.log('ERROR: ',data);
        //                 }
        //             })
        //             .error(function(data) {
        //                 console.log('Error: ' , data);
        //                 tryLoadEvent(count+1);
        //             });
        //     }
        // }   
        function getEventAndSetInfo(events){
            if ($scope.directory == null || $scope.events == null){
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
                if (events[i].tag == $stateParams.tag){
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
            event.going_list = []
            event.not_going_list = []
            for (var i = 0; i < event.going.length; i++){
                var user_push = getUsersFromKey(event.going[i])
                event.going_list.push(user_push);
                if (user_push.user_name == $rootScope.me.user_name){
                    $scope.going = true;
                    $scope.not_going = false;
                }
            }
            for (var i = 0; i < event.not_going.length; i++){
                var user_push = getUsersFromKey(event.not_going[i])
                event.not_going_list.push(user_push);
                if (user_push.user_name == $rootScope.me.user_name){
                    $scope.not_going = true;
                    $scope.going = false;
                }
            }
            $scope.creator = getUsersFromKey(event.creator);
            $scope.event = event;
            if($scope.event.address){
                $scope.address_html = $scope.event.address.split(' ').join('+');
            }
            if($scope.event.location || !$scope.event.address){
                $scope.address_html = $scope.event.location.split(' ').join('+');
            }
            $scope.time_start = momentInTimezone($scope.event.time_start).format('MM/DD/YYYY hh:mm A');
            $scope.time_end = momentInTimezone($scope.event.time_end).format('MM/DD/YYYY hh:mm A');  
            $scope.loading = false;
            $scope.eventNotFound = false;
            
            setTimeout(function(){$('.container').trigger('resize'); console.log('resizing')}, 800); 
        }
        $scope.editEvent = function(){
            window.location.assign('#/app/events/'+$stateParams.tag+'/edit');
        }
        $scope.rsvp = function(rsvp){
            console.log($scope.event.key);
            var to_send = {key: $scope.event.key};
            console.log("what is going on");
            if (rsvp){
                to_send.rsvp = 'going';
            }
            else{
                to_send.rsvp = 'not_going';
            }
            to_send.key = $scope.event.key;
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/rsvp', to_send)
                    .success(function(data){
                        if (!RESTService.hasErrors(data)){
                            if (rsvp){
                                $scope.going = true;
                                $scope.not_going = false;
                            }
                            else{
                                $scope.going = false;
                                $scope.not_going = true;
                            }
                        }
                        else{
                            console.log('ERROR: ',data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' , data);
                    });
        }
        $scope.formatDate = function(date){
            return moment(date).format('dddd - MMMM Do [at] h:mma');
        }
	});