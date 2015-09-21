App.directive('selectingMembers',
function() {
  return{
    restrict: 'E',
    templateUrl: 'views/templates/selectingmembers.html',
    scope:{
      selectedCalendar: '=',
      selectedIndividuals: '=',
      inputCalendar: '=?'
    },
    controller: ['$scope', 'RESTService', '$rootScope', '$timeout', '$location', 'localStorageService', 'Directory', '$mdDialog', 'Events','$interval',
      function($scope, RESTService, $rootScope, $timeout, $location, localStorageService, Directory, $mdDialog, Events, $interval){

      var directory,
      calendars,
      i, //iterator
      j, //iterator
      noneCalendar = {users:[], name:'none'};
      if (Directory.directory){
        directory = JSON.parse(JSON.stringify(Directory.directory.members));
        $scope.directory = directory;
      }
      $scope.customCalendar = {users:[], name:'Custom', calendar:noneCalendar};

      Events.getCalendars().then(function(){
        calendars = Events.calendars;
        $scope.calendars = calendars;
        setupInputCalendar();
      });

      Directory.get();
      $scope.$on('directory:updated', function() {
        directory = JSON.parse(JSON.stringify(Directory.directory.members));
        $scope.directory = directory;
        setupInputCalendar();
      });

      $scope.$watch('inputCalendar', function(){
        setupInputCalendar();
      });

      function setupInputCalendar(){
        if (directory && calendars && $scope.inputCalendar){
          var calendar = noneCalendar,
          users = [];
          var test = $scope.inputCalendar;
          for (i = 0; i < calendars.length; i++){
            if (calendars[i].key === $scope.inputCalendar.calendar) {
              calendar = calendars[i];
              break;
            }
          }
          if ($scope.inputCalendar.users){
            for (i = 0; i < $scope.inputCalendar.users.length; i++){
              for (j = 0 ; j < directory.length; j++){
                if ($scope.inputCalendar.users[i] === directory[j].key){
                  users.push(directory[j]);
                }
              }
            }
          }
          if (users.length > 0){
            $scope.customCalendar.calendar = calendar;
            $scope.customCalendar.users = users;
            $scope.internalSelectedCalendar = $scope.customCalendar;
            $scope.selectedCalendar = calendar;
            $scope.selectedIndividuals = users;
          }
          else{
            $scope.selectedIndividuals = [];
            $scope.internalSelectedCalendar = calendar;
            $scope.selectedCalendar = calendar;
          }
          $scope.invitedMembers = mergeMembers($scope.selectedIndividuals, $scope.selectedCalendar.users);
        }
      }

      $scope.$watch('internalSelectedCalendar', function(){
          if ($scope.internalSelectedCalendar !== $scope.customCalendar){
            $scope.selectedCalendar = $scope.internalSelectedCalendar;
            $scope.selectedIndividuals = [];
          }
          $scope.invitedMembers = mergeMembers($scope.selectedIndividuals, $scope.selectedCalendar ? $scope.selectedCalendar.users : []);
      });

      // function evaluateSelectedMembers() {
      //   if ($scope.internalSelectedCalendar === $scope.customCalendar) {
      //     var customMembers = $scope.customCalendar.users;
      //     var calendarMembers = $scope.customCalendar.calendar.users;
      //     $scope.selectedMembers = mergeMembers(customMembers, calendarMembers);
      //   }
      //   else if ($scope.internalSelectedCalendar){
      //     $scope.selectedMembers = $scope.internalSelectedCalendar.users;
      //   }
      //   else{
      //     $scope.selectedMembers = [];
      //   }
      // }

      function mergeMembers(a, b) {
        usersDictionary = {};
        if (a && b){
          for (i = 0; i < a.length; i++){
            usersDictionary[a[i].key] = a[i];
          }
          for (i = 0; i < b.length; i++){
            usersDictionary[b[i].key] = b[i];
          }
        }
        var mergedMembers = [];
        for (var user in usersDictionary){
          mergedMembers.push(usersDictionary[user]);
        }
        return mergedMembers;
      }

      $scope.showInvitedMembersDialog = function(){
        $mdDialog.show({
          controller:('invitedMembersDialogController', ['$scope', '$mdDialog', invitedMembersDialogController]),
          templateUrl:'views/templates/invitedMembersDialog.html'
        });
      };

      function invitedMembersDialogController(scope, mdDialog){
        $scope.invitedMembers = mergeMembers($scope.selectedIndividuals, $scope.selectedCalendar.users);
        scope.members = $scope.invitedMembers;
        //convert back to a list.

        scope.hide = function(){
          mdDialog.hide();
        };
      }

      $scope.showSelectCustomDialog = function(){
        $mdDialog.show({
          controller:('selectingMembersDialogController as selectingMembersDialog', ['$scope', '$mdDialog', selectingMembersDialogController]),
          templateUrl:'views/templates/selectingMembersDialog.html'
        });
      };

      // function evaluateCalendarMembers(){
      //   usersDictionary = {};

      //   //get hand picked members
      //   //Start with all members
      //   for (i = 0; i < $scope.directory.members.length; i++) {
      //     $scope.directory.members[i].inCalendars = undefined;
      //     usersDictionary[$scope.directory.members[i].key] = $scope.directory.members[i];
      //   }
      //   //Remove users that are selected by the calendar.
      //   for (i = 0; i < $scope.customCalendar.calendar.users.length; i++){
      //     if (usersDictionary[$scope.customCalendar.calendar.users[i].key]){
      //       usersDictionary[$scope.customCalendar.calendar.users[i].key].inCalendars = true;
      //     }
      //   }
      //   //Check members that should be checked.
      //   for (i = 0; i < $scope.selectedMembers.length; i++){
      //     if (usersDictionary[$scope.selectedMembers[i].key]){
      //       if (!usersDictionary[$scope.selectedMembers[i].key].inCalendars){
      //         usersDictionary[$scope.selectedMembers[i].key].checked = true;
      //       }
      //     }
      //   }
      //   //convert back to a list.
      //   var scopeMembers = [];
      //   for (user in usersDictionary){
      //     scopeMembers.push(usersDictionary[user]);
      //   }
      //   return scopeMembers;
      // }

      function selectingMembersDialogController(scope, mdDialog) {
        var customCalendar = $scope.customCalendar,
        evaluatingWatch = false;

        function setupSelectedItems(){
          var selected = [];
          if (scope.calendars.indexOf(customCalendar.calendar) > -1){
            selected.push(customCalendar.calendar);
          }
          for (var i = 0; i < customCalendar.users.length; i++){
            selected.push(customCalendar.users[i]);
          }
          scope.selected = selected;
        }

        scope.members = $scope.directory;
        scope.calendars = $scope.calendars;
        setupSelectedItems();



        scope.$watchCollection('selected.length', function() {
          if (!evaluatingWatch){
            evaluatingWatch = true;
            var localCalendars = [],
            localUsers = [],
            selectedCalendar = noneCalendar;
            //clear selection indicators
            for (i = 0; i < scope.members.length; i++){
              scope.members[i].selected = undefined;
            }

            for (i = 0; i < scope.calendars.length; i++){
              scope.calendars[i].selected = undefined;
            }

            // split selected up into calendars and users
            for (i = 0; i < scope.selected.length; i++) {
              if (scope.calendars.indexOf(scope.selected[i]) > -1){
                localCalendars.push(scope.selected[i]);
              }
              else if (scope.members.indexOf(scope.selected[i]) > -1){
                localUsers.push(scope.selected[i]);
              }
              else{
                console.log('WHAT HAPPENED?!');
              }
            }

            //ensure only one calendar is selected and remove the others.
            if (localCalendars.length > 1){

              var highestCountCalendar,
              otherCalendars,
              count = 0;
              for (i = 0; i < localCalendars.length; i++) {
                if (localCalendars[i].users.length > count) {
                   highestCountCalendar = localCalendars[i];
                   count = localCalendars[i].users.length;
                }
              }
              localCalendars.splice(localCalendars.indexOf(highestCountCalendar), 1);
              for (i = 0; i < localCalendars.length; i++) {
                scope.selected.splice(scope.selected.indexOf(localCalendars[i]), 1);
              }
              localCalendars = [highestCountCalendar];
            }
            if (localCalendars.length === 1){
              selectedCalendar = localCalendars[0];
            }
            for (i = 0; i < localUsers.length; i++) {
                localUsers[i].selected = true;
            }
            // set calendar selection in list of calendars
            if (selectedCalendar) {
              selectedCalendar.selected = true;
              for (i = 0; i < selectedCalendar.users.length; i++){

                //remove users who are selected that are also in selected calendar
                for (j = 0; j < localUsers.length; j++){
                  if (localUsers[j].key === selectedCalendar.users[i].key){
                    scope.selected.splice(scope.selected.indexOf(localUsers[j]), 1);
                  }
                }
                //set users as selected in list of users
                for (j = 0; j < scope.members.length; j++) {
                  if (scope.members[j].key === selectedCalendar.users[i].key){
                    scope.members[j].selected = true;
                  }
                }
              }
            }
            evaluatingWatch = false;
          }
          $scope.customCalendar.calendar = selectedCalendar;
          $scope.customCalendar.users = localUsers;
        });

        scope.select = function(selectable) {
          if (scope.selected.indexOf(selectable) === -1){ //not already in the selected list.
            scope.selected.push(selectable);
          }
        }

        scope.filter = function(q){
          retList = [];
          for (i = 0; i < scope.calendars.length; i++){
            if (scope.selected.indexOf(scope.calendars[i]) == -1){
              if (angular.lowercase(scope.calendars[i].name).indexOf(angular.lowercase(q)) > -1) {
                retList.push(calendars[i]);
              }
            }
          }
          for (i = 0; i < scope.members.length; i++){
            if (scope.selected.indexOf(scope.members[i]) == -1){
              if (angular.lowercase(scope.members[i].name).indexOf(angular.lowercase(q)) > -1) {
                retList.push(scope.members[i]);
              }
            }
          }
          return retList;
        }

        scope.save = function() {
          //clear selection indicators
          for (i = 0; i < scope.members.length; i++){
            scope.members[i].selected = undefined;
          }
          for (i = 0; i < scope.calendars.length; i++){
            scope.calendars[i].selected = undefined;
          }
          $scope.selectedIndividuals = $scope.customCalendar.users;
          $scope.selectedCalendar = $scope.customCalendar.calendar;
          if ($scope.selectedIndividuals.length === 0){
            $scope.internalSelectedCalendar = $scope.customCalendar.calendar;
          }
          $scope.invitedMembers = mergeMembers($scope.selectedIndividuals, $scope.selectedCalendar.users);
          mdDialog.hide();
        };
      }
    }]
  };
});
