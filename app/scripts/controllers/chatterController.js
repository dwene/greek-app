App.controller('chatterController', ['$scope', 'RESTService', '$rootScope', '$mdDialog', '$timeout', '$stateParams', 'localStorageService', 'Directory', 'Chatter', 'Session', 'USER_ROLES',

function($scope, RESTService, $rootScope, $mdDialog, $timeout, $stateParams, localStorageService, Directory, Chatter, Session, USER_ROLES){

   $scope.me = Session.me;
   $scope.admin = Session.perms === USER_ROLES.council || Session.perms === USER_ROLES.leadership;
   var i;

   Chatter.get();
   Chatter.getImportant();

   $scope.loadImportant = function(){
      Chatter.getImportant();
   };

   $scope.currentFeed = $scope.chatter;
   $scope.$watch('data.selectedIndex', function(){
      defineFeed();
   });

   function defineFeed(){
      if ($scope.data){
         if ($scope.data.selectedIndex === 0){
            $scope.currentFeed = $scope.chatter;
         }
         else{
            $scope.currentFeed = $scope.important_chatter;
         }
      }
      else{
         $scope.currentFeed = $scope.chatter;
      }
   }

   if (Chatter.data) {
      $scope.chatter = Chatter.data.feed;
      $scope.important_chatter = Chatter.data.important;
      defineFeed();
      if ($stateParams.token && $scope.chatter){
         openChatterByKey($stateParams.token);
      }
   }

   $scope.$on('chatter:updated', function(){
      $scope.chatter = Chatter.data.feed;
      defineFeed();
      if ($stateParams.token && $scope.chatter){
         openChatterByKey($stateParams.token);
      }
   });

   $scope.$on('importantChatter:updated', function(){
      $scope.important_chatter = Chatter.data.important;
      defineFeed();
   });

   defineFeed();

   $scope.likeChatter = function(chatter){
      Chatter.like(chatter);
   };


   function openChatterByKey(key){
     var chat;
      for (i = 0; i < $scope.chatter.length; i++){
         if($scope.chatter[i].key == key){
           chat = $scope.chatter[i];
            $mdDialog.show({
               controller: 'chatterDialogController as CD',
               templateUrl: 'views/templates/chatterDialog.html',
               locals: {chat: chat},
               bindToController: true
            });
            break;
         }
      }
   }

   $scope.openChatter = function(chat){
      Chatter.openChatter(chat);
   };

   $scope.newChatter = function(){
      $mdDialog.show({
         controller: ('newChatterController', ['$scope', '$mdDialog', newChatterController]),
         templateUrl: 'views/templates/newChatterDialog.html',
      });
   };

   function newChatterController(scope, mdDialog){
      scope.me = Session.me;
      scope.hide = function(){
         mdDialog.hide();
      };

      scope.addChatter = function(content, important, sendNotifications){
         if (!important){
            important = false;
            sendNotifications = false;
         }
         if (!sendNotifications){
            sendNotifications = false;
         }
         Chatter.create(content, important, sendNotifications);
         mdDialog.hide();
      };
   }
}
]);
