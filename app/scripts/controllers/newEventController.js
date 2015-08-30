App.controller('newEventController', ['$scope', 'RESTService', '$rootScope', '$timeout', '$location', 'localStorageService', 'Tags', 'Directory', '$mdDialog', 'GoogleMaps', 'Events',
function($scope, RESTService, $rootScope, $timeout, $location, localStorageService, Tags, Directory, $mdDialog, GoogleMaps, Events) {
   GoogleMaps.then(
      function(){
         $scope.mapsLoaded = true;
      }
   );
   $scope.event = {};
   $scope.event.tag = '';

   $scope.querySearch = querySearch();
   $scope.searchText = null;

   function querySearch(query) {
      var results = query ? self.members.filter(createFilterFor(query)) : [];
      return results;
   }

   //Create filter function for a query string
   function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(mem) {
         return (mem._lowerfirst.indexOf(lowercaseQuery) === 0) ||
         (mem._lowerlast.indexOf(lowercaseQuery) === 0);
      };
   }

   $scope.addEvent = function(isValid, event) {
      if (isValid) {
         var to_send = JSON.parse(JSON.stringify(event));
         debugger;
         if ($scope.individuals){
            to_send.individuals = [];
            for (i = 0; i < $scope.individuals.length; i++){
               to_send.individuals.push($scope.individuals[i].key);
            }
         }
         if ($scope.calendar){
            to_send.calendar = $scope.calendar.key;
         }
         to_send.time_start = momentUTCTime(event.date_start + " " + event.time_start).format('MM/DD/YYYY hh:mm a');
         to_send.time_end = momentUTCTime(event.date_end + " " + event.time_end).format('MM/DD/YYYY hh:mm a');
         if (moment(to_send.time_end).diff(moment(to_send.time_start)) < 0) {
            $scope.time_broken = true;
            return;
         }
         if ($scope.weekly){
            to_send.recurring_type = "weekly";
            to_send.until = moment($scope.event.until).format('MM/DD/YYYY');
            to_send.recurring = true;
         }
         else if ($scope.monthly){
            to_send.recurring_type = "weekly";
            to_send.until = moment($scope.event.until).format('MM/DD/YYYY');
            to_send.recurring = true;
         }
         RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/create', to_send)
         .success(function(data) {
            if (!RESTService.hasErrors(data)) {
               JSON.parse(data.data);
               $timeout(function() {
                  $location.url('app/events/' + JSON.parse(data.data));
               }, 500);
            } else {
               console.log('ERROR: ', data);
            }
            $scope.loading = false;
         })
         .error(function(data) {
            console.log('Error: ', data);
            $scope.loading = false;
         });
         $scope.loading = true;
         $scope.unavailable = false;
         $scope.available = false;
      } else {
         $scope.submitted = true;
      }
   };

   var date_difference = 0;
   $scope.$watch('event.date_start', function() {
      if ($scope.event) {
         if ($scope.event.date_start) {
            $scope.event.date_end = moment($scope.event.date_start).add(date_difference).format('MM/DD/YYYY');
            $timeout(function() {
               $('.picker').trigger('change');
            });
         }
      }
   });

   $scope.$watch('event.date_end', function() {
      if ($scope.event) {
         if (moment($scope.event.date_end).diff(moment($scope.event.date_start)) < 0) {
            $scope.event.date_end = $scope.event.date_start;
         }
         if ($scope.event.date_start && $scope.event.date_end) {
            date_difference = moment($scope.event.date_end).diff($scope.event.date_start);
         }
      }
   });

   $scope.$watch('event.time_start', function() {
      if ($scope.event) {
         if ($scope.event.time_start) {
            //$scope.event.time_end = moment($scope.event.time_start, 'h:mm A').add('hours', 1).format('h:[00] A');
            // console.log(moment($scope.event.time_end, 'h:mm A').diff(moment($scope.event.time_start, 'h:mm A')));
            if (moment($scope.event.time_end, 'h:mm A').diff(moment($scope.event.time_start, 'h:mm A')) <= 0 && $scope.event.date_start == $scope.event.date_end) {
               console.log('I am doing this frist!');
               $scope.event.time_end = moment($scope.event.time_start, 'h:[00] A').add('hours', 1).format('h:[00] A');
            }
            // var test = moment($scope.event.time_end, 'h:mm A').diff(moment($scope.event.time_start, 'h:mm A')) < 0;
            if ($scope.event.date_start == $scope.event.date_end && moment($scope.event.time_end, 'h:mm A').diff(moment($scope.event.time_start, 'h:mm A')) < 0) {
               console.log('I am doing this....');
               $scope.event.date_end = moment($scope.event.date_end).add('days', 1).format('MM/DD/YYYY');
            }
         }
         $timeout(function() {
            $('.picker').trigger('change');
         }, 200);
      }
   });

   $scope.$watch('event.time_end', function() {
      if ($scope.event.time_start) {
         if (moment($scope.event.time_end, 'h:mm A').diff(moment($scope.event.time_start, 'h:mm A')) <= 0 && $scope.event.date_start == $scope.event.date_end) {
            $scope.event.time_start = moment($scope.event.time_end, 'h:mm A').subtract('hours', 1).format('h:[00] A');
         }
      }
   });

   $scope.$watch('event.until', function() {
      if ($scope.event.until && $scope.event.recurring) {
         if (moment($scope.event.until).diff($scope.event.date_end) < 0) {
            $scope.event.until = $scope.event.date_end;
         }
      }
   });

   $timeout(function() {
      $scope.event.date_start = moment().format('MM/DD/YYYY');
      $scope.event.date_end = moment().format('MM/DD/YYYY');
      $scope.event.time_start = moment().add('hours', 1).format('h:[00] A');
      $scope.event.time_end = moment($scope.event.time_start, 'h:mm A').add('hours', 1).format('h:[00] A');
   });
}
]);
