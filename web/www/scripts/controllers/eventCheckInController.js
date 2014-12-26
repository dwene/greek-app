    App.controller('eventCheckInController', function($scope, RESTService, Load, $stateParams, $rootScope, $timeout) {
        routeChange();
        function setTimeout(scope, fn, delay) {
            var promise = $timeout(fn, delay);
            var deregister = scope.$on('$destroy', function() {
                $timeout.cancel(promise);
            });
            promise.then(deregister);
        }
        update();
        function update() {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_check_in_info', $stateParams.tag)
            .success(function(data){
                if (!RESTService.hasErrors(data)){
                    console.log('I am updating the user check in stuff!');
                    var users = JSON.parse(data.data);
                    var counter = 0;
                    if (users){
                        for (var i = 0; i < $scope.users.length; i++){
                            counter++;
                            var user = $scope.users[i];
                            if (user.attendance_data){
                                if (user.attendance_data.in_updating || user.attendance_data.out_updating){
                                    continue;
                                }
                                if (user.timestamp_moment){
                                    if (Math.abs(user.timestamp_moment.diff(moment(), 'seconds')) < 5){
                                        continue;
                                    }
                                }
                                $scope.users[i] = users[i];
                            }
                        }
                    }
                }
                setTimeout($scope, update, 15000);
            });
        }
        $scope.loading = true;
        Load.then(function(){
            $rootScope.requirePermissions(LEADERSHIP);
            getCheckInData();
            $scope.maxLength = 20;
            $scope.maxLengthIncrease = function(){
                if ($scope.users){
                    if ($scope.maxLength < $scope.users.length){
                        $scope.maxLength += 20;
                    }
                }
            }
            $scope.$watch('search', function(){
                if ($scope.search){
                    $scope.maxLength = 20;    
                }
            });
        });
        function getCheckInData(){
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/get_check_in_info', $stateParams.tag)
            .success(function(data){
                if (!RESTService.hasErrors(data)){
                    $scope.users = JSON.parse(data.data);  
                    $scope.loading = false;
                    console.log('Im ending get check in data');
                }
                else{
                    console.log('ERROR: ',data);
                    $scope.eventNotFound = true;
                    $scope.loading = false;
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                $scope.loading = false;
                $scope.eventNotFound = true;
            });
        }
        $scope.eventTag = $stateParams.tag;
        $scope.checkIn = function(member, checkStatus, clear){ //#TODO: fix controller so we can check in more than once
            member.timestamp_moment = moment();
            if(checkStatus && member.attendance_data && member.attendance_data.time_in){
                $('#checkInModal').modal();
                $scope.selectedUser = member;
                return;
            }
            $('#checkInModal').modal('hide');
            var to_send = {event_tag: $stateParams.tag, user_key: member.key};
            if (!member.attendance_data){
                    member.attendance_data = {}
            }
            if (clear){
                to_send.clear = true;
                member.attendance_data.time_in = "";
            }
            else{
                member.attendance_data.time_in = momentUTCTime();
            }
            member.in_updating = 'pending';
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/check_in', to_send)
            .success(function(data){
                if (!RESTService.hasErrors(data)){
                    member.in_updating = "done";
                    member.timestamp_moment = moment();
                }
                else{
                    member.in_updating = "broken";
                    console.log('ERROR: ',data);
                }
            })
            .error(function(data) {
                member.in_updating = "broken";
                console.log('Error: ' , data);
            });
        }
        $scope.checkOut = function(member, checkStatus, clear){
            member.timestamp_moment = moment();
            if(checkStatus && member.attendance_data && member.attendance_data.time_out && member.attendance_data.time_in){
                $('#checkOutModal').modal();
                $scope.selectedUser = member;
                return;
            }
            $('#checkOutModal').modal('hide');
            var to_send = {event_tag: $stateParams.tag, user_key: member.key};
            if (!member.attendance_data){
                member.attendance_data = {};
            }
            if (clear){
                to_send.clear = true;
                member.attendance_data.time_out = "";
            }
            else {
                member.attendance_data.time_out = momentUTCTime();
            }
            member.out_updating = 'pending';
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/event/check_out', to_send)
            .success(function(data){
                if (!RESTService.hasErrors(data)){
                    member.out_updating = 'done';
                    member.timestamp_moment = moment();
                }
                else{
                    console.log('ERROR: ', data);
                    member.out_updating = 'broken';
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
                member.out_updating = 'broken';
            });
        }
        $scope.formatDate = function(date){
            return momentInTimezone(date).format('lll');
        }
    });