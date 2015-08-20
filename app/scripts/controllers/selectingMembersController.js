App.controller('selectingMembersController', ['$scope', 'RESTService', '$rootScope', '$timeout', '$location', 'localStorageService', 'Directory', '$mdDialog', 'Events',
function($scope, RESTService, $rootScope, $timeout, $location, localStorageService, Directory, $mdDialog, Events) {
  Events.getCalendars().then(function(){
    $scope.calendars = Events.calendars;
    evaluateSelectedCalendar();
  });
  $scope.directory = Directory.directory;

  var directory,
  members = $scope.directory.members,
  userSelectedMembers = [],
  membersLength = members.length,
  i;

  console.log('calendars', $scope.calendars);

  function evaluateSelectedCalendar(){

  }
  // $scope.$watch('selectMembersRadio', function(){
  //   if($scope.selectMembersRadio === 'everyone'){
  //     for (i=0; i < membersLength; i++){
  //       members[i].checked = true;
  //     }
  //     getSelectedMembers();
  //   }
  //   if($scope.selectMembersRadio === 'leaders'){
  //     for (i=0; i < membersLength; i++){
  //       if(members[i].perms === 'leadership' || members[i].perms === 'council'){
  //         members[i].checked = true;
  //       }
  //       else{
  //         members[i].checked = false;
  //       }
  //     }
  //     getSelectedMembers();
  //   }
  //   if($scope.selectMembersRadio === 'exec'){
  //     for (i=0; i < membersLength; i++){
  //       if(members[i].perms === 'council'){
  //         members[i].checked = true;
  //       }
  //       else{
  //         members[i].checked = false;
  //       }
  //     }
  //     getSelectedMembers();
  //   }
  //   if($scope.selectMembersRadio === 'members'){
  //     $scope.selectedMembers = userSelectedMembers;
  //   }
  // });

  $scope.selectingMembers = function(){
    $mdDialog.show({
      controller:('selectingMembersDialogController', ['$scope', '$mdDialog', selectingMembersDialogController]),
      templateUrl:'views/templates/selectingMembersDialog.html'
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

}]);
