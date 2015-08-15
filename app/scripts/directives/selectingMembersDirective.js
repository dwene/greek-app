App.directive('selectingMembers',
function() {
  return{
    restrict: 'E',
    templateUrl: 'views/templates/selectingmembers.html',
    scope:{
      selectedMembers: '=ngModel'
    },
    controller: ['$scope', 'RESTService', '$rootScope', '$timeout', '$location', 'localStorageService', 'Directory', '$mdDialog', 'Events',
     function($scope, RESTService, $rootScope, $timeout, $location, localStorageService, Directory, $mdDialog, Events){

      Directory.get();
      $scope.directory = Directory.directory;
      $scope.individuals = [];
      var directory,
      members = $scope.directory.members,
      userSelectedMembers = [],
      membersLength = members.length,
      i;
      
      Events.getCalendars().then(function(){
        $scope.calendars = Events.calendars;
        console.log('calendars', $scope.calendars);
        for (var i = 0; i < $scope.calendars.length; i++){
          if ($scope.calendars[i].name === 'none'){
            $scope.selectedCalendar = $scope.calendars[i];
          }
        }
      });

      $scope.$watch('selectedCalendar', function(){
        evaluateSelectedMembers();
      });


      function evaluateSelectedMembers(){
        var individualMembers = getSelectedMembers();
        var calendarMembers = $scope.calendar.users;
        $scope.selectedMembers = mergeMembers(individualMembers, calendarMembers);
      }

      function mergeMembers(a, b){
        for (i = 0; i < a.length; i++){
          usersDictionary[a.key] = a;
        }
        for (i = 0; i < b.length; i++){
          usersDictionary[b.key] = b;
        }
        var mergedMembers = [];
        for (user in usersDictionary){
          mergedMembers.push(user);
        }
        return mergedMembers;
      }

      $scope.selectingMembers = function(){
        $mdDialog.show({
          controller:('selectingMembersDialogController', ['$scope', '$mdDialog', selectingMembersDialogController]),
          templateUrl:'views/templates/selectingMembersDialog.html'
        });
      };

      function getSelectedMembers(){
        var selectedMembers = [];
        for (i=0; i < members.length; i++){
          if( members[i].checked === true ){
            selectedMembers.push(members[i]);
          }
          else{
            //do nothing
          }
        }
        return selectedMembers;
      }

      function selectingMembersDialogController(scope, mdDialog){
        usersDictionary = {};
        //Start with all members
        for (i = 0; i < $scope.dictionary.members.length; i++){
          usersDictionary[$scope.dictionary.members[i].key] = $scope.dictionary.members[i];
        }
        //Remove users that are selected by the calendar.
        for (i = 0; i < $scope.calendar.users.length; i++){
          if (usersDictionary[$scope.calendar.users[i].key]){
            usersDictionary[$scope.calendar.users[i].key].disabled = true;
            usersDictionary[$scope.calendar.users[i].key].checked = true;
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
          scope.members.append(user);
        }

        //toggle check member to invite
        // scope.toggle = function(item){
        //   var idx = userSelectedMembers.indexOf(item);
        //   if (idx > -1) {userSelectedMembers.splice(idx, 1);}
        //   else {userSelectedMembers.push(item);}
        //   userSelectedMembers = $scope.selectedMembers;
        // };
        //check to see what should be checked
        // scope.syncChecked = function(item){
        //   return userSelectedMembers.indexOf(item) > -1;
        // };
        scope.hide = function(){
          var individuals = [];
          for (i = 0; i < scope.members.length; i++){
            if (!scope.members[i].disabled && scope.members[i].checked){
              individuals.append(scope.members[i]);
            }
            scope.members[i].checked = undefined;
            scope.members[i].disabled = undefined;
          }
          $scope.individuals = individuals;
          mdDialog.hide();
        };
      }
    }]
  };
});
