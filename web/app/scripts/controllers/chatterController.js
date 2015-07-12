App.controller('chatterController', ['$scope', 'RESTService', '$rootScope', '$mdDialog', '$timeout', '$stateParams', 'localStorageService', 'Directory', 'Chatter', 'Session',

function($scope, RESTService, $rootScope, $mdDialog, $timeout, $stateParams, localStorageService, Directory, Chatter, Session){

   $scope.me = Session.me;

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
      console.log("chatter is", Chatter.data.chatter);
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
      console.log('chatter is being updated');
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
      for (i = 0; i < $scope.chatter.length; i++){
         console.log('keys', $scope.chatter[i].key, key);
         if($scope.chatter[i].key == key){
            console.log('scope.chat', $scope.chat);
            $scope.chat = $scope.chatter[i];
            $mdDialog.show({
               controller: ('chatterDialogController', ['$scope', '$mdDialog', 'Chatter', chatterDialogController]),
               templateUrl: 'views/templates/chatterDialog.html',
            });
            break;
         }
      }
   }

   $scope.openChatter = function(chat){
      $scope.chat = chat;
      console.log('diolog',$mdDialog);
      $mdDialog.show({
         controller: ('chatterDialogController', ['$scope', '$mdDialog', 'Chatter', chatterDialogController]),
         templateUrl: 'views/templates/chatterDialog.html',
      });
   };

   function chatterDialogController(scope, mdDialog, Chatter){
      scope.chat = $scope.chat;
      Chatter.getComments(scope.chat);
      console.log('chat', scope.chat);
      scope.me = Session.me;
      console.log('me.perms', scope.me.perms);

      scope.hide = function(){
         mdDialog.hide();
      };

      scope.likeChatter = function(chatter){
         Chatter.like(chatter);
      };

      scope.commentOnChatter = function(chatter, content){
         Chatter.comment(chatter, content);
         scope.comment = "";
      };

      scope.editChatter = function(content){
         scope.editing = true;
         scope.content_temp = content;
         document.getElementById('chattercontent').focus();
      };

      scope.cancelEditChatter = function(){
         scope.editing = false;
      };

      scope.saveChatter = function(content_temp){
         scope.editing = false;
         scope.chat.content = content_temp;
         Chatter.edit(scope.chat, scope.chat.content);
      };

      scope.makeImportant = function(chat, notify){
         Chatter.makeImportant(chat, notify);
      };

      scope.showconfirmImportant = function(chat){
         if(chat.important === false){scope.confirmImportant = !scope.confirmImportant;}
         else{Chatter.makeImportant(chat, false);}
      };

      scope.deleteChatter = function(){
         mdDialog.hide();
         scope.confirmDelete = false;
         Chatter.delete(scope.chat, scope.chat.content);
         for (i = 0; i < $scope.chatter.length; i++){
            if ($scope.chatter[i].key == scope.chat.key){
               $scope.chatter.splice(i, 1);
            }
         }
      };

      scope.followChatter = function(chat){
         Chatter.mute(chat);
         if (chat.following === false && chat.mute === false){
            chat.following = true;
         }
         else{
            chat.mute = false;
         }
      };
      scope.unfollowChatter = function(chat){
         Chatter.mute(chat);
         chat.mute = true;
      };

      scope.saveComment = function(comment){
         comment.content = comment.comment_temp;
         comment.editingComment = false;
         Chatter.saveComment(comment, comment.content);
      };

      scope.editComment = function(comment){
         comment.comment_temp = comment.content;
         comment.editingComment = true;
      };

      scope.cancelEditComment = function(comment){
         comment.editingComment = false;
      };

      scope.likeComment = function(comment){
         Chatter.likeComment(comment);
      };

      scope.deleteComment = function(comment){
         comment.confirmDelete = false;
         console.log('comment', comment);
         Chatter.deleteComment(comment, scope.chat);
      };
   }

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
