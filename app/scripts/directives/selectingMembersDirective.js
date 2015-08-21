App.directive('selectingMembers',
function() {
  return{
    restrict: 'E',
    templateUrl: 'views/templates/selectingmembers.html',
    scope:{
      selectedCalendar: '=calendar',
      selectedIndividuals : '=custom'
    },
    controller: ['$scope', 'RESTService', '$rootScope', '$timeout', '$location', 'localStorageService', 'Directory', '$mdDialog', 'Events','$interval',
     function($scope, RESTService, $rootScope, $timeout, $location, localStorageService, Directory, $mdDialog, Events, $interval){

      Directory.get();
      $scope.$on('directory:updated', function() {
        $scope.directory = Directory.directory;
      });
      $scope.directory = Directory.directory;
      var directory,
      userSelectedMembers = [],
      i;

      $scope.noneCalendar = {users:[], name:'none'};
      $scope.customCalendar = {users:[], name:'Custom', calendar:$scope.noneCalendar};

      Events.getCalendars().then(function(){
        $scope.calendars = Events.calendars;
        // $scope.selectedCalendar = $scope.calendars[0];
      });

      $scope.$watch('selectedCalendar', function(){
          evaluateSelectedMembers();
          if ($scope.selectedCalendar !== $scope.customCalendar){
            $scope.custom = [];
            $scope.calendar = $scope.selectedCalendar;
          }
      });

      function evaluateSelectedMembers(){
        if ($scope.selectedCalendar === $scope.customCalendar) {
          var customMembers = $scope.customCalendar.users;
          var calendarMembers = $scope.customCalendar.calendar.users;
          $scope.selectedMembers = mergeMembers(customMembers, calendarMembers);
        }
        else if ($scope.selectedCalendar){
          $scope.selectedMembers = $scope.selectedCalendar.users;
        }
        else{
          $scope.selectedMembers = [];
        }
      }

      function mergeMembers(a, b) {
        usersDictionary = {}
        for (i = 0; i < a.length; i++){
          usersDictionary[a[i].key] = a[i];
        }
        for (i = 0; i < b.length; i++){
          usersDictionary[b[i].key] = b[i];
        }
        var mergedMembers = [];
        for (user in usersDictionary){
          mergedMembers.push(usersDictionary[user]);
        }
        return mergedMembers;
      };

      $scope.showInvitedMembersDialog = function(){
        $mdDialog.show({
          controller:('invitedMembersDialogController', ['$scope', '$mdDialog', invitedMembersDialogController]),
          templateUrl:'views/templates/invitedMembersDialog.html'
        });
      };

      function invitedMembersDialogController(scope, mdDialog){
        scope.members = $scope.selectedMembers;
        //convert back to a list.

        scope.hide = function(){
          mdDialog.hide();
        };
      }

      $scope.showSelectCustomDialog = function(){
        $mdDialog.show({
          controller:('selectingMembersDialogController', ['$scope', '$mdDialog', selectingMembersDialogController]),
          templateUrl:'views/templates/selectingMembersDialog.html'
        });
      };

      function evaluateCalendarMembers(){
        usersDictionary = {};

        //get hand picked members
        //Start with all members
        for (i = 0; i < $scope.directory.members.length; i++) {
          $scope.directory.members[i].disabled = undefined;
          usersDictionary[$scope.directory.members[i].key] = $scope.directory.members[i];
        }
        //Remove users that are selected by the calendar.
        for (i = 0; i < $scope.customCalendar.calendar.users.length; i++){
          if (usersDictionary[$scope.customCalendar.calendar.users[i].key]){
            usersDictionary[$scope.customCalendar.calendar.users[i].key].disabled = true;
          }
        }
        //Check members that should be checked.
        for (i = 0; i < $scope.selectedMembers.length; i++){
          if (usersDictionary[$scope.selectedMembers[i].key]){
            if (!usersDictionary[$scope.selectedMembers[i].key].disabled){
              usersDictionary[$scope.selectedMembers[i].key].checked = true;
            }
          }
        }
        //convert back to a list.
        var scopeMembers = [];
        for (user in usersDictionary){
          scopeMembers.push(usersDictionary[user]);
        }
        return scopeMembers;
      }

      function selectingMembersDialogController(scope, mdDialog){
        scope.calendars = $scope.calendars;
        scope.noneCalendar = $scope.noneCalendar;
        scope.selectedCalendar = $scope.customCalendar;
        scope.members = evaluateCalendarMembers();
        scope.$watch('selectedCalendar.calendar', function(){
          scope.members = evaluateCalendarMembers();
        });
        scope.selectCalendar = function(cal){
          scope.selectedCalendar.calendar = cal;
        }
        scope.toggle = function(user){
          if (user.checked){
            user.checked = false;
          }
          else{
            user.checked = true;
          }
        }
        //Saves changes
        scope.save = function() {
          var customUsers = [];
          for (i = 0; i < scope.members.length; i++){
            if (!scope.members[i].disabled && scope.members[i].checked){
              customUsers.push(scope.members[i]);
            }
            scope.members[i].checked = undefined;
            scope.members[i].disabled = undefined;
          }
          if (customUsers.length == 0){
            $scope.selectedCalendar = $scope.customCalendar.calendar;
          }
          $scope.customCalendar.users = customUsers;
          $scope.custom = customUsers;
          $scope.calendar = $scope.customCalendar.calendar;
          evaluateSelectedMembers();
          mdDialog.hide();
        };
      }
    }]
  };
});
