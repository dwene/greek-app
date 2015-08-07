App.controller('chatterDialogController', ['$scope', '$mdDialog', 'Chatter', 'Session', 'USER_ROLES',

function($scope, $mdDialog, Chatter, Session, USER_ROLES){
    
  var vm = this;
  vm.admin = Session.perms === USER_ROLES.council || Session.perms === USER_ROLES.leadership;
  vm.me = Session.me;
  
  vm.hide = function(){
    $mdDialog.hide();
  };
  
  vm.likeChatter = function(chatter){
    Chatter.like(chatter);
  };
  
  vm.commentOnChatter = function(chatter, content){
    Chatter.comment(chatter, content);
    vm.comment = "";
  };
  
  vm.editChatter = function(content){
    vm.editing = true;
    vm.content_temp = content;
    document.getElementById('chattercontent').focus();
  };
  
  vm.cancelEditChatter = function(){
    vm.editing = false;
  };
  
  vm.saveChatter = function(content_temp){
    vm.editing = false;
    vm.chat.content = content_temp;
    Chatter.edit(vm.chat, vm.chat.content);
  };
  
  vm.makeImportant = function(chat, notify){
    Chatter.makeImportant(chat, notify);
  };
  
  vm.showconfirmImportant = function(chat){
    if(chat.important === false){vm.confirmImportant = !vm.confirmImportant;}
    else{Chatter.makeImportant(chat, false);}
  };
  
  vm.deleteChatter = function(){
    $mdDialog.hide();
    vm.confirmDelete = false;
    Chatter.delete(vm.chat);
    for (i = 0; i < vm.chatter.length; i++){
      if (vm.chatter[i].key == vm.chat.key){
        vm.chatter.splice(i, 1);
      }
    }
  };
  
  vm.followChatter = function(chat){
    Chatter.mute(chat);
    if (chat.following === false && chat.mute === false){
      chat.following = true;
    }
    else{
      chat.mute = false;
    }
  };

  vm.loadMoreComments = function(chat){
    console.log('loadMoreComments');
    Chatter.loadMoreComments(chat);
  };

  vm.unfollowChatter = function(chat){
    Chatter.mute(chat);
    chat.mute = true;
  };
  
  vm.saveComment = function(comment){
    comment.content = comment.comment_temp;
    comment.editingComment = false;
    Chatter.saveComment(comment, comment.content);
  };
  
  vm.editComment = function(comment){
    comment.comment_temp = comment.content;
    comment.editingComment = true;
  };
  
  vm.cancelEditComment = function(comment){
    comment.editingComment = false;
  };
  
  vm.likeComment = function(comment){
    Chatter.likeComment(comment);
  };
  
  vm.deleteComment = function(comment){
    comment.confirmDelete = false;
    console.log('comment', comment);
    Chatter.deleteComment(comment, vm.chat);
  };
}

]);