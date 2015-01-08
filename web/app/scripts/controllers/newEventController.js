App.controller('newEventController', function($scope, RESTService, $rootScope, Load, $timeout, localStorageService, Tags) {
        routeChange();
            Tags.get();
            $scope.tags = Tags.tags;
            $scope.event = {};
            $scope.event.tag = '';
            $scope.$watch('event.tag', function() {
                if (!$scope.event)
                    $scope.unavailable = false;
                $scope.event.tag = $scope.event.tag.replace(/\s+/g,'');
                $scope.unavailable = false;
                $scope.available = false;
            });

            $scope.addEvent = function(isValid, event){
                if(isValid){
                    $scope.working = 'pending';
                    event.tags = getCheckedTags($scope.tags);
                    var to_send = JSON.parse(JSON.stringify(event));
                    to_send.time_start = momentUTCTime(event.date_start + " " + event.time_start).format('MM/DD/YYYY hh:mm a');
                    to_send.time_end = momentUTCTime(event.date_end + " " + event.time_end).format('MM/DD/YYYY hh:mm a');
                    if (event.recurring){
                        if ($scope.weekly){
                            to_send.recurring_type="weekly";
                        }
                        else if ($scope.monthly){
                            to_send.recurring_type = "monthly";
                        }
                        to_send.recurring_end = event.recurring_end;
                        to_send.reccuring = true;
                    }
                    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/create', to_send)
                    .success(function(data){
                        if (!RESTService.hasErrors(data)){
                            $scope.working = 'done';
                            setTimeout(function(){window.location.assign('#/app/events/'+event.key);},500);
                        }
                        else{
                            $scope.working = 'broken';
                            console.log('ERROR: ',data);}
                        $scope.loading = false;
                    })
                    .error(function(data) {
                        $scope.working = 'broken';
                        console.log('Error: ' , data);
                        $scope.loading = false;
                    });
                $scope.loading = true;
                $scope.unavailable = false;
                $scope.available = false;
                }
                else{
                    $scope.submitted = true;
                }
            }
            $scope.checkTagAvailability = function(tag){
                
                if (tag == ""){
                    $scope.isEmpty = true;
                }
                else{
                    $scope.checkWorking = 'pending';
                    $scope.unavailable = false;
                    $scope.available = false;
                    $scope.isEmpty = false;
                    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/check_tag_availability', tag)
                    .success(function(data){
                        if (!RESTService.hasErrors(data)){
                            $scope.checkWorking = 'done';
                            $scope.available = true;
                            $scope.unavailable = false;
                        }
                        else{
                            $scope.checkWorking = 'broken';
                            $scope.unavailable = true;
                            $scope.available = false;
                        }
                    })
                    .error(function(data) {
                        $scope.checkWorking = 'broken';
                        console.log('Error: ' , data);
                    });
                }
            }
        $scope.$watch('event.date_start', function(){
            if ($scope.event){
                if ($scope.event.date_start && !$scope.event.date_end){
                    $scope.event.date_end = JSON.parse(JSON.stringify($scope.event.date_start));
                    $scope.event.time_start = moment().add('hours', 1).format('h:[00] A');
                    $timeout(function(){$('.picker').trigger('change')},200);
                }
            }
        });
        $scope.$watch('event.time_start', function(){
            console.log('I see that change!!!');
            if ($scope.event){
                if ($scope.event.time_start){
                    $scope.event.time_end = moment($scope.event.time_start, 'h:mm A').add('hours', 1).format('h:[00] A');
                    var test = moment($scope.event.time_end, 'h:mm A').diff(moment($scope.event.time_start, 'h:mm A')) < 0;
                    if (test && $scope.event.date_start == $scope.event.date_end){
                        $scope.event.date_end = moment($scope.event.date_end).add('days', 1).format('MM/DD/YYYY');
                    }
                }
                $timeout(function(){$('.picker').trigger('change')},200);
            }
    });
});
