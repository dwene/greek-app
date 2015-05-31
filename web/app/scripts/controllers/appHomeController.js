    App.controller('appHomeController', function($scope, RESTService, $rootScope, $timeout, $sce, $mdDialog, Events, removePassedEventsFilter, Directory, Inbox, Session) {
        routeChange();
        Events.get();
        $scope.events = Events.events;
        $scope.events_loaded = false;
        $scope.notifications_loaded = false;
        $scope.noMoreHiddens = false;
        $scope.directory = Directory.directory;
        $scope.me = Session.me;

       $scope.createEvents = function(){
            $scope.events = Events.events;
            $scope.events_loaded = true;
        }
        $scope.createEvents();
        $scope.$on('events:updated', function(){ $scope.createEvents(); });
            
        $scope.openClearStatusDialog = function(ev){
            $mdDialog.show({
                    controller:('dialogController', ['$scope', '$mdDialog', dialogController]),
                    templateUrl: 'views/templates/clearStatusDialog.html',
                    targetEvent: ev
            });
        }

        function dialogController($scope, $mdDialog){
            $scope.clearStatus = function(){
                clearStatus();
                $mdDialog.hide();
            }
            $scope.close = function(){
                $mdDialog.hide();
            }
        }

        $scope.updateStatus = function(status){
        var to_send = {'status': status};
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_status', to_send);
            if (Session.me){
                Session.me.status = status;
                $scope.me = Session.me;
            }
            Directory.updateMyStatus(status);
            $scope.status = '';
        }

        function clearStatus(){
            var status = "";
            $scope.status = "";
            Session.me.status = "";
            $scope.me = Session.me;
            Directory.updateMyStatus(status);
            var to_send = {status: status};
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/user/update_status', to_send)
            .success(function(data){
                if (RESTService.hasErrors(data))
                    console.log('ERROR: ',data);
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });            
        }
        
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
});