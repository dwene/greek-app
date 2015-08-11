App.controller('chatterController', ['$scope', 'RESTService', '$rootScope', '$mdDialog', '$timeout', '$stateParams', 'localStorageService', 'Directory', 'Chatter', 'Session', 'USER_ROLES',

function($scope, RESTService, $rootScope, $mdDialog, $timeout, $stateParams, localStorageService, Directory, Chatter, Session, USER_ROLES){

   $scope.me = Session.me;
   $scope.admin = Session.perms === USER_ROLES.council || Session.perms === USER_ROLES.leadership;
   var meta = {}
   var i;
   Chatter.get();
   Chatter.getImportant();

   $scope.loadImportant = function() {
      Chatter.getImportant();
   };

   $scope.currentFeed = $scope.chatter;
   $scope.$watch('data.selectedIndex', function(){
      defineFeed();
   });

   if (Chatter.data){
      setFeed();
      setImportant();
      defineFeed();
   }

   $scope.loadMoreChatters = function() {
      Chatter.loadMoreChatters($scope.meta);
   }

   function defineFeed(){
      if ($scope.data){
         if ($scope.data.selectedIndex === 0){
            $scope.currentFeed = $scope.chatter;
            $scope.meta = meta.feed;
         }
         else{
            $scope.currentFeed = $scope.important_chatter;
            $scope.meta = meta.important;
         }
      }
      else{
         $scope.currentFeed = $scope.chatter;
         $scope.meta = meta.feed;
      }
   };

   function setFeed(){
      if (Chatter.data.feed){
         $scope.chatter = Chatter.data.feed.chatters;
         meta.feed = {more: Chatter.data.feed.more, cursor: Chatter.data.feed.cursor, important:false, loading:false};
      }
   };

   function setImportant(){
      if (Chatter.data.important){
         $scope.important_chatter = Chatter.data.important.chatters;
         meta.important = {more: Chatter.data.important.more, cursor: Chatter.data.important.cursor, important:true, loading:false};
      }
   };

   $scope.$on('chatter:updated', function(){
      setFeed();
      defineFeed();
   });

   $scope.$on('importantChatter:updated', function(){
      setImportant();
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
      scope.sendNotifications = true;
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
