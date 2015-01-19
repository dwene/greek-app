App.controller('eventInfoController', function($scope, RESTService, $stateParams, $rootScope, $q, $mdBottomSheet, $location, Load, Events, Directory, Session){
        routeChange();
        Events.get();
        Directory.get();
        $scope.going = false;
        $scope.not_going = false;
        $scope.loading = true;
        var refreshed = false;
        $scope.eventNotFound = false;
        $scope.goToReport = function(){
           $location.url("app/events/" + $stateParams.tag + "/report");
        }
        $scope.back = function(){
            $location.path('app/events');
        }
        
        $scope.showEventoptions = function(event){
            $mdBottomSheet.show({
              templateUrl: 'views/templates/bottomGrid.html',
              controller: eventOptionsCtrl,
              targetEvent: event
            });
        }

        function eventOptionsCtrl($scope, $mdBottomSheet) {
            $scope.items = [
                { name: 'CHECKINS', icon: 'fa-sign-in'},
                { name: 'REPORT', icon: 'fa-bar-chart'},
                { name: 'EDIT', icon: 'fa-edit' },
                { name: 'SAVE', icon: 'fa-floppy-o' }
            ];
            $scope.itemClick = function(item){
                switch(item.name){
                    case 'CHECKINS': $location.url("app/events/" + $stateParams.tag + "/checkin"); break;
                    case 'REPORT': $location.url("app/events/" + $stateParams.tag + "/report"); break;
                    case 'EDIT': $location.url('app/events/'+$stateParams.tag+'/edit'); break;
                    case 'SAVE': saveEvent(); break;
                }
                $mdBottomSheet.hide();
            }
        };
        
        
        
        function saveEvent(){
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
        $scope.events = Events.events;
        $scope.directory = Directory.directory;
        if (Directory.check()){
            getEventAndSetInfo($scope.events);
        }
        $scope.$on('directory:updated', function(){
            $scope.directory = Directory.directory;
            getEventAndSetInfo($scope.events);
        });
        if (Events.check()){
            getEventAndSetInfo($scope.events);
        }
        $scope.$on('events:updated', function(){
            $scope.events = Events.events;
            getEventAndSetInfo($scope.events);
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
            $scope.creator = getUsersFromKey(event.creator);
            $scope.event = event;
            if($scope.event.address){
                $scope.address_html = $scope.event.address.split(' ').join('+');
            }
            if($scope.event.location){
                $scope.address_html = $scope.event.location.split(' ').join('+');
            }
            $scope.time_start = momentInTimezone($scope.event.time_start).format('MM/DD/YYYY hh:mm A');
            $scope.time_end = momentInTimezone($scope.event.time_end).format('MM/DD/YYYY hh:mm A');  
            $scope.loading = false;
            $scope.eventNotFound = false;
            
            setTimeout(function(){$('.container').trigger('resize'); console.log('resizing')}, 800); 
        }
        $scope.editEvent = function(){
            $location.path('#/app/events/'+$stateParams.tag+'/edit');
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
            return moment(date).format('h:mma dddd, MMMM Do');
        }
        $scope.eventDate = function(start_date, end_date){
            var dayofstart = moment(start_date).format('MMM Do');
            var dayofend = moment(end_date).format('MMM Do');
            if( dayofstart == dayofend ){
                return dayofstart;
            }
            else{
                return dayofstart+' \u2014 '+dayofend
            }
        }
	});