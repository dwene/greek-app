    App.controller('eventsController', function($scope, $http, Load, $rootScope, localStorageService) {
        routeChange();
        
        Load.then(function(){
            $rootScope.requirePermissions(MEMBER);
            $scope.events = $rootScope.events;
            $scope.eventSource = [];
            for (var i = 0; i< $scope.events.length; i++){
                $scope.eventSource.push({title: $scope.events[i].title, startTime: new Date($scope.events[i].time_start), endTime: new Date( $scope.events[i].time_end), tag: $scope.events[i].tag});}
                //send the organization and user date from registration pages
            function getEvents(){
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_events', packageForSending(''))
                .success(function(data){
                    if (!checkResponseErrors(data)){
                        $scope.events = JSON.parse(data.data);
                        $rootScope.events = $scope.events;
                        localStorageService.set('events', $rootScope.events);
                        for (var i = 0; i< $scope.events.length; i++){
                            if ($scope.eventSource.indexOf({title: $scope.events[i].title, startTime: new Date($scope.events[i].time_start), endTime: new Date($scope.events[i].time_end), tag: $scope.events[i].tag}) != -1){
                            $scope.eventSource.push({title: $scope.events[i].title, startTime: new Date($scope.events[i].time_start), endTime: new Date($scope.events[i].time_end), tag: $scope.events[i].tag});
                            }
                        }
                        console.log($scope.eventSource);
                    }
                    else
                        console.log('ERROR: ',data);
                })
                .error(function(data) {
                    console.log('Error: ' , data);
                    getEvents();
                });
            }
            
            $scope.showDate = function(start, end){
                var mStart = momentInTimezone(start);
                
                if (mStart.diff(moment()) > 0){
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
            $scope.showEvent = function(event){
                window.location.assign('#/app/events/' + event.tag);
            }
            $scope.$watch('search', function(){
                if ($scope.current){
                    $scope.current.currentPage = 0;
                    if ($scope.search){
                        $scope.present = undefined;
                    }
                    else{
                        $scope.present = true; 
                    }
                }
            })
	   });
	});