App.controller('newEventController', ['$scope', 'RESTService', '$rootScope', '$timeout', '$location', 'localStorageService', 'Tags', 'Directory', '$mdDialog', '$window',
function($scope, RESTService, $rootScope, $timeout, $location, localStorageService, Tags, Directory, $mdDialog, $window) {

   routeChange();
   Directory.get();

   $scope.directory = Directory.directory;
   $scope.event = {};
   $scope.event.tag = '';
   $scope.selectInvited = "everyone";

   $scope.querySearch = querySearch();
   $scope.searchText = null;

   var directory,
   members = loadMembers(),
   userSelectedMembers = [],
   i,
   membersLength = members.length;

   $scope.$watch('selectInvited', function(){
      if($scope.selectInvited === 'everyone'){
         for (i=0; i < membersLength; i++){
            members[i].checked = true;
         }
         getSelectedMembers();
      }
      if($scope.selectInvited === 'leaders'){
         for (i=0; i < membersLength; i++){
            if(members[i].perms === 'leadership' || members[i].perms === 'council'){
               members[i].checked = true;
            }
            else{
               members[i].checked = false;
            }
         }
         getSelectedMembers();
      }
      if($scope.selectInvited === 'exec'){
         for (i=0; i < membersLength; i++){
            if(members[i].perms === 'council'){
               members[i].checked = true;
            }
            else{
               members[i].checked = false;
            }
         }
         getSelectedMembers();
      }
      if($scope.selectInvited === 'members'){
            $scope.selectedMembers = userSelectedMembers;
      }
   });

   $scope.selectMembers = function(){
      $mdDialog.show({
         controller:('selectingMembersDialogController', ['$scope', '$mdDialog', selectingMembersDialogController]),
         templateUrl:'views/templates/selectingmembers.html'
      });
   };

   function getSelectedMembers(){
      $scope.selectedMembers = [];
      for (i=0; i < members.length; i++){
         if( members[i].checked === true ){
            $scope.selectedMembers.push(members[i]);
         }
         else{
            //do nothing
         }
      }
   }

   function selectingMembersDialogController(scope, mdDialog){
      //set list of members
      scope.members = members;
      //load corrected checked members
         $scope.selectedMembers = userSelectedMembers;

      // console.log('selecting members when dialog is opened', $scope.selectedmembers);

      //toggle check member to invite
      scope.toggle = function(item){
         var idx = userSelectedMembers.indexOf(item);
         if (idx > -1) {userSelectedMembers.splice(idx, 1);}
         else {userSelectedMembers.push(item);}
         userSelectedMembers = $scope.selectedMembers;
      };
      //check to see what should be checked
      scope.syncChecked = function(item){
         return userSelectedMembers.indexOf(item) > -1;
      };
      scope.hide = function(){
         mdDialog.hide();
      };
   }

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

   function loadMembers() {
      var members = $scope.directory.members;
      return members.map(function (mem) {
         mem._lowerfirst = mem.first_name.toLowerCase();
         mem._lowerlast = mem.last_name.toLowerCase();
         return mem;
      });
   }

   $scope.addEvent = function(isValid, event) {
      if (isValid) {
         event.tags = getCheckedTags($scope.tags);
         var to_send = JSON.parse(JSON.stringify(event));
         to_send.time_start = momentUTCTime(event.date_start + " " + event.time_start).format('MM/DD/YYYY hh:mm a');
         to_send.time_end = momentUTCTime(event.date_end + " " + event.time_end).format('MM/DD/YYYY hh:mm a');
         if (moment(to_send.time_end).diff(moment(to_send.time_start)) < 0) {
            $scope.time_broken = true;
            return;
         }
         if ($scope.event.recurring) {
            if ($scope.weekly) {
               to_send.recurring_type = "weekly";
            } else if ($scope.monthly) {
               to_send.recurring_type = "monthly";
            }
            to_send.until = moment($scope.event.until).format('MM/DD/YYYY');
            to_send.reccuring = true;
         }
         RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/create', to_send)
         .success(function(data) {
            if (!RESTService.hasErrors(data)) {
               $scope.working = 'done';
               JSON.parse(data.data);
               $timeout(function() {
                  $location.url('app/events/' + JSON.parse(data.data));
               }, 500);
            } else {
               $scope.working = 'broken';
               console.log('ERROR: ', data);
            }
            $scope.loading = false;
         })
         .error(function(data) {
            $scope.working = 'broken';
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

   $scope.checkTagAvailability = function(tag) {
      if (tag === "") {
         $scope.isEmpty = true;
      } else {
         $scope.checkWorking = 'pending';
         $scope.unavailable = false;
         $scope.available = false;
         $scope.isEmpty = false;
         RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/event/v1/check_tag_availability', tag)
         .success(function(data) {
            if (!RESTService.hasErrors(data)) {
               $scope.checkWorking = 'done';
               $scope.available = true;
               $scope.unavailable = false;
            } else {
               $scope.checkWorking = 'broken';
               $scope.unavailable = true;
               $scope.available = false;
            }
         })
         .error(function(data) {
            $scope.checkWorking = 'broken';
            console.log('Error: ', data);
         });
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
