App.directive('selectingMembers',
function() {
  return{
    restrict: 'E',
    templateUrl: 'views/templates/selectingmembers.html',
    scope:{
      selectedCalendar: '=outputCalendar',
      selectedIndividuals: '=outputUsers',
      inputCalendar: '=?'
    },
    controller: ['$scope', 'RESTService', '$rootScope', '$timeout', '$location', 'localStorageService', 'Directory', '$mdDialog', 'Events','$interval',
      function($scope, RESTService, $rootScope, $timeout, $location, localStorageService, Directory, $mdDialog, Events, $interval){
      var directory = JSON.parse(JSON.stringify(Directory.directory.members)),
      calendars,
      i, //iterator
      j, //iterator
      noneCalendar = {users:[], name:'none'};
      $scope.customCalendar = {users:[], name:'Custom', calendar:noneCalendar};
      $scope.directory = directory;

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
          var calendar,
          users = [];
          for (i = 0; i < calendars.length; i++){
            if (calendars[i].key === $scope.inputCalendar.calendar) {
              calendar = calendars[i];
            }
          }
          if ($scope.inputCalendar.users){
            for (i = 0; i < $scope.inputCalendar.users; i++){
              for (j = 0 ; j < directory.length; j++){
                if ($scope.inputCalendar.users[i] === directory[i].key){
                  users.push(directory[i]);
                }
              }
            }
          }
          if (users.length > 0){
            $scope.customCalendar.calendar = calendar;
            $scope.customCalendar.users = users;
            $scope.selectedCalendar = $scope.customCalendar;
            $scope.outputCalendar = calendar;
            $scope.outputUsers = users;
          }
          else{
            $scope.outputUsers = [];
            $scope.selectedCalendar = calendar;
            $scope.outputCalendar = calendar;
          }
        }
      }

      $scope.$watch('selectedCalendar', function(){
          if ($scope.selectedCalendar !== $scope.customCalendar){
            $scope.outputCalendar = $scope.selectedCalendar;
            $scope.outputUsers = [];
          }
      });

      // function evaluateSelectedMembers() {
      //   if ($scope.selectedCalendar === $scope.customCalendar) {
      //     var customMembers = $scope.customCalendar.users;
      //     var calendarMembers = $scope.customCalendar.calendar.users;
      //     $scope.selectedMembers = mergeMembers(customMembers, calendarMembers);
      //   }
      //   else if ($scope.selectedCalendar){
      //     $scope.selectedMembers = $scope.selectedCalendar.users;
      //   }
      //   else{
      //     $scope.selectedMembers = [];
      //   }
      // }

      function mergeMembers(a, b) {
        usersDictionary = {}
        if (a && b){
          for (i = 0; i < a.length; i++){
            usersDictionary[a[i].key] = a[i];
          }
          for (i = 0; i < b.length; i++){
            usersDictionary[b[i].key] = b[i];
          }
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
        scope.members = mergeMembers($scope.outputUsers, $scope.outputCalendar);
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

      function evaluateCalendarMembers(){
        usersDictionary = {};

        //get hand picked members
        //Start with all members
        for (i = 0; i < $scope.directory.members.length; i++) {
          $scope.directory.members[i].inCalendars = undefined;
          usersDictionary[$scope.directory.members[i].key] = $scope.directory.members[i];
        }
        //Remove users that are selected by the calendar.
        for (i = 0; i < $scope.customCalendar.calendar.users.length; i++){
          if (usersDictionary[$scope.customCalendar.calendar.users[i].key]){
            usersDictionary[$scope.customCalendar.calendar.users[i].key].inCalendars = true;
          }
        }
        //Check members that should be checked.
        for (i = 0; i < $scope.selectedMembers.length; i++){
          if (usersDictionary[$scope.selectedMembers[i].key]){
            if (!usersDictionary[$scope.selectedMembers[i].key].inCalendars){
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
        var customCalendar = $scope.customCalendar,
        complete = false,
        cal;
        scope.selected = [];
        scope.members = directory;
        scope.calendars = $scope.calendars;
        console.log(scope.calendars);
        setTimeout(function(){
          console.log(scope.calendars);
        }, 5000)
        scope.$watch('selectingMembersDialog.selected', function() {
          // #TODO
          if (complete === true){
            var localCalendars = [],
            localUsers = [],
            userHash = {};
            
            //clear selection indicators
            for (i = 0; i < directory.length; i++){
              directory[i].selected = undefined;
            }
            for (i = 0; i < calendars.length; i++){
              calendars[i].selected = undefined;
            }

            // split selected up into calendars and users
            for (i = 0; i < scope.selected.length; i++){ 
              if (calendars.indexOf(scope.selected[i]) > -1){
                localCalendars.push(scope.selected[i]);
              }
              else if (directory.indexOf(scope.selected[i]) > -1){
                localUsers.push(scope.selected[i]);
              }
              else{
                console.log('WHAT HAPPENED?!');
              }
            }

            //ensure only one calendar is selected
            if (localCalendars.length > 1){
              var highestCountCalendar,
              count = 0;
              for (i = 0; i < localCalendars.length; i++){
                if (localCalendars[i].users.length > count){
                   highestCountCalendar = localCalendars[i];
                   count = localCalendars[i].users.length;
                }
              }
              localCalendars = [highestCountCalendar];
            }
            // set calendar selection in list of calendars
            var selectedCalendar = localCalendars[0];
            if (selectedCalendar){
              selectedCalendar.selected = true;
              for (i = 0; i < selectedCalendar.users.length; i++){

                //remove users who are selected that are also in selected calendar
                for (j = 0; j < localUsers.length; j++){
                  if (localUsers[j].key === selectedCalendar.users[i].key){ 
                    localUsers.splice(j, 1);
                  }
                }
                //set users as selected in list of users
                for (j = 0; j < directory.length; j++){
                  if (directory[j].key == selectedCalendar.users[i].key){
                    directory[j].selected = true;
                  }
                }
              }
            }

            $scope.customCalendar.calendar = selectedCalendar;
            $scope.customCalendar.users = localUsers;
          }
        });
        
        scope.selectCalendar = function(cal) {
          if (scope.selected.indexOf(cal) === -1){ //not already in the selected list.
            scope.selected.push(cal);
          }
        }

        scope.selectMember = function(member) {
          if (scope.selected.indexOf(member) === -1){ //not already in the selected list.
            scope.selected.push(member);
          }
        }

        scope.save = function() {
          //clear selection indicators
          for (i = 0; i < directory.length; i++){
            directory[i].selected = undefined;
          }
          for (i = 0; i < calendars.length; i++){
            calendars[i].selected = undefined;
          }

          if (customUsers.length == 0){
            $scope.selectedCalendar = $scope.customCalendar.calendar;
          }
          $scope.outputUsers = $scope.customCalendar.users;
          $scope.outputCalendar = $scope.customCalendar.calendar;
          mdDialog.hide();
        };
        complete = true;
      }
    }]
  };
});
