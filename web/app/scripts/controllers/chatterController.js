App.controller('chatterController', ['$scope', 'RESTService', '$rootScope', '$mdDialog', '$timeout', 'localStorageService', 'Directory', 'Chatter', 'Session',

function($scope, RESTService, $rootScope, $mdDialog, $timeout, localStorageService, Directory, Chatter, Session){

   $scope.me = Session.me.key;

   Chatter.get();
   console.log('chatterinfo', Chatter.get());

   if (Chatter.data){
      console.log("chatter is", Chatter.data.chatter);
      $scope.chatter = Chatter.data.chatter;
      $scope.important_chatter = Chatter.data.important_chatter;
   }

   $scope.$on('chatter:updated', function(){
      $scope.chatter = Chatter.data.chatter;
      $scope.important_chatter = Chatter.data.important_chatter;
   });

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
      scope.me = Session.me.key;

      scope.hide = function(){
         mdDialog.hide();
      };

      scope.likeChatter = function(chatter){
         Chatter.like(chatter);
      };

      scope.commentonChatter = function(key, content){
         Chatter.comment(key, content);
         scope.comment = '';
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
         Chatter.edit(scope.chat.key, scope.chat.content);
      };

      scope.makeImportant = function(key){
         Chatter.makeImportant(key);
         console.log('important button pushed');
      };

      scope.deleteChatter = function(){
         $mdDialog.hide();
         scope.confirmDelete = false;
         Chatter.delete(scope.chat.key, scope.chat.content);
         for (var i = 0; i < $scope.chatter.length; i++){
            if ($scope.chatter[i].key == scope.chat.key){
               $scope.chatter.splice(i, 1);
            }
         }
      };

      scope.saveComment = function(comment){
         comment.content = comment.comment_temp;
         comment.editingComment = false;
         Chatter.saveComment(comment.key, comment.content);

      };

      scope.editComment = function(comment){
         comment.comment_temp = comment.content;
         comment.editingComment = true;
      };

      scope.cancelEditComment = function(comment){
         comment.editingComment = false;
      };

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
         Chatter.create(content);
         mdDialog.hide();
      };

   }
}
]);
