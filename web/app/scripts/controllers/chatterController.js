App.controller('chatterController', ['$scope', 'RESTService', '$rootScope', '$mdDialog', '$timeout', 'localStorageService', 'Directory', 'Chatter', 'Session',

function($scope, RESTService, $rootScope, $mdDialog, $timeout, localStorageService, Directory, Chatter, Session){

   $scope.me = Session.me;
   Chatter.get();
   Chatter.getImportant();

   $scope.loadImportant = function(){
      Chatter.getImportant();
   }
   $scope.currentFeed = $scope.chatter;
   $scope.$watch('data.selectedIndex', function(){
      defineFeed();
   });

   function defineFeed(){
      if ($scope.data){
         if ($scope.data.selectedIndex  == 0){
            $scope.currentFeed = $scope.chatter;
         }
         else{
            $scope.currentFeed = $scope.important_chatter;
         }
      }
      else{
         $scope.currentFeed = $scope.chatter;
      }
      console.log("currentFeed", $scope.currentFeed);
   }

   if (Chatter.data){
      console.log("chatter is", Chatter.data.chatter);
      $scope.chatter = Chatter.data.feed;
      $scope.important_chatter = Chatter.data.important;
      defineFeed();
   }

   $scope.$on('chatter:updated', function(){
      $scope.chatter = Chatter.data.feed;
      $scope.important_chatter = Chatter.data.important;
      defineFeed();
   });

   defineFeed();

   $scope.likeChatter = function(chatter){
      Chatter.like(chatter);
   };

   $scope.makeImportant = function(chat){
      //somehow make this chat important
   };

   $scope.openChatter = function(chat){
      $scope.chat = chat;
      console.log('opening chatter', chat);
      $mdDialog.show({
         controller: ('chatterDialogController', ['$scope', '$mdDialog', 'Chatter', chatterDialogController]),
         templateUrl: 'views/templates/chatterDialog.html',
      });
   };

   function chatterDialogController(scope, mdDialog, Chatter){
      scope.chat = $scope.chat;
      Chatter.getComments(scope.chat);
      console.log(scope.chat);
      scope.me = Session.me;

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

      scope.makeImportant = function(key){
         Chatter.makeImportant(key);
         console.log('important button pushed');
      };

      scope.deleteChatter = function(){
         $mdDialog.hide();
         scope.confirmDelete = false;
         Chatter.delete(scope.chat, scope.chat.content);
         for (var i = 0; i < $scope.chatter.length; i++){
            if ($scope.chatter[i].key == scope.chat.key){
               $scope.chatter.splice(i, 1);
            }
         }
      };

      scope.deleteComment = function(comment){
         Chatter.deleteComment(comment);
         for (var i = 0; i < scope.chat.comments.length; i++){
            if (comment.key == scope.chat.comments[i].key){
               scope.chat.comments.splice(i, 1);
            }
         }
      }

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
      }
      scope.deleteComment = function(comment){
         comment.confirmDelete = false;
         console.log(comment);
         Chatter.deleteComment(comment.key);
         for (var i = 0; i < scope.chat.comments.length; i++){
            if (scope.chat.comments[i].key == scope.chat.comments.key){
               scome.chat.comments.splice(i, 1);
            }
         }
      };
   }

   $scope.newChatter = function(){
      $mdDialog.show({
         controller: ('newChatterController', ['$scope', '$mdDialog', newChatterController]),
         templateUrl: 'views/templates/newChatterDialog.html',
      });
   };

   function newChatterController(scope, mdDialog){
      scope.hide = function(){
         mdDialog.hide();
      };

      scope.addChatter = function(content){
         if ($scope.data.selectedIndex == 1){
            Chatter.create(content, true);
         } else{
            Chatter.create(content, false);
         }
         mdDialog.hide();
      };
   }
}
]);
