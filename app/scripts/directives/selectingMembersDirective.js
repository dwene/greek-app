App.directive('selectingMembers',
function() {
  return{
    restrict: 'E',
    templateUrl: 'views/templates/selectingmembers.html',
    scope:{
      selectedCalendar: '=selectedCalendar',
      custom : '=selectedcustom'
    },
    controller: ['$scope', 'RESTService', '$rootScope', '$timeout', '$location', 'localStorageService', 'Directory', '$mdDialog', 'Events','$interval',
     function($scope, RESTService, $rootScope, $timeout, $location, localStorageService, Directory, $mdDialog, Events, $interval){

      Directory.get();
      $scope.$on('directory:updated', function() {
        $scope.directory = Directory.directory;
      });
      $scope.directory = Directory.directory;
      $scope.custom = [];
      var directory,
      members = $scope.directory.members,
      userSelectedMembers = [],
      i;

      Events.getCalendars().then(function(){
        $scope.calendars = Events.calendars;
        $scope.selectedCalendar = $scope.calendars[0];
      });

      $scope.$watch('selectedCalendar', function(){
        console.log($scope.selectedCalendar);
        if ($scope.calendars && $scope.directory){
          evaluateSelectedMembers();
        }
      });


      function evaluateSelectedMembers(){
        var customMembers = $scope.custom;
        var calendarMembers = $scope.selectedCalendar.users;
        $scope.selectedMembers = mergeMembers(customMembers, calendarMembers);
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
          controller:('invitedMembersDialogController', ['$scope', '$mdDialog', selectingMembersDialogController]),
          templateUrl:'views/templates/invitedMembersDialog.html'
        });
      };

      function invitedMembersDialogController(scope, mdDialog){
        usersDictionary = {};
        //Start with all members
        for (i = 0; i < $scope.directory.members.length; i++){
          usersDictionary[$scope.directory.members[i].key] = $scope.directory.members[i];
        }
        //Remove users that are selected by the calendar.
        for (i = 0; i < $scope.selectedCalendar.users.length; i++){
          if (usersDictionary[$scope.selectedCalendar.users[i].key]){
            usersDictionary[$scope.selectedCalendar.users[i].key].disabled = true;
            usersDictionary[$scope.selectedCalendar.users[i].key].checked = true;
          }
        }
        //Check members that should be checked.
        for (i = 0; i < $scope.selectedMembers.length; i++){
          if (usersDictionary[$scope.selectedMembers[i].key]){
            usersDictionary[$scope.selectedMembers[i].key].checked = true;
          }
        }
        //convert back to a list.
        scope.members = [];
        for (user in usersDictionary){
          scope.members.push(usersDictionary[user]);
        }

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

      function selectingMembersDialogController(scope, mdDialog){
        usersDictionary = {};
        //Start with all members
        for (i = 0; i < $scope.directory.members.length; i++){
          usersDictionary[$scope.directory.members[i].key] = $scope.directory.members[i];
        }
        //Remove users that are selected by the calendar.
        for (i = 0; i < $scope.selectedCalendar.users.length; i++){
          if (usersDictionary[$scope.selectedCalendar.users[i].key]){
            usersDictionary[$scope.selectedCalendar.users[i].key].disabled = true;
            usersDictionary[$scope.selectedCalendar.users[i].key].checked = true;
          }
        }
        //Check members that should be checked.
        for (i = 0; i < $scope.selectedMembers.length; i++){
          if (usersDictionary[$scope.selectedMembers[i].key]){
            usersDictionary[$scope.selectedMembers[i].key].checked = true;
          }
        }
        //convert back to a list.
        scope.members = [];
        for (user in usersDictionary){
          scope.members.push(usersDictionary[user]);
        }

        scope.toggle = function(user){
          console.log('toggle');
          if (user.checked){
            user.checked = false;
          }
          else{
            user.checked = true;
          }
        }
        //Saves changes
        scope.save = function() {
          var custom = [];
          for (i = 0; i < scope.members.length; i++){
            if (!scope.members[i].disabled && scope.members[i].checked){
              custom.push(scope.members[i]);
            }
            scope.members[i].checked = undefined;
            scope.members[i].disabled = undefined;
          }
          $scope.custom = custom;
          evaluateSelectedMembers();
          mdDialog.hide();
        };

        scope.hide = function() {
          for (i = 0; i < scope.members.length; i++){
            scope.members[i].checked = undefined;
            scope.members[i].disabled = undefined;
          }
          mdDialog.hide();
        };
      }
    }]
  };
});
