App.controller('chatterController', ['$scope', 'RESTService', '$rootScope', '$mdDialog', '$timeout', 'localStorageService', 'Directory', 'Chatter',
function($scope, RESTService, $rootScope, $mdDialog, $timeout, localStorageService, Directory, Chatter) {
        
    Chatter.get();
    console.log('chatterinfo', Chatter.get())
    
    if (Chatter.data){
        console.log("chatter is", Chatter.data.chatter);
        $scope.chatter = Chatter.data.chatter;
        $scope.important_chatter = Chatter.data.important_chatter;
    }
    
    $scope.$on('chatter:updated', function(){
        $scope.chatter = Chatter.data.chatter;
        $scope.important_chatter = Chatter.data.important_chatter;
    });
    
    $scope.authorpic = function(author){
        
    }
    
    $scope.likeChatter = function(key){
        Chatter.like(key);
    };
    
    
    $scope.makeImportant = function(chat){
        //somehow make this chat important
    }
    $scope.openChatter = function(chat){
        $scope.chat = chat;
        $mdDialog.show({
                    controller: ('chatterDialogController', ['$scope', '$mdDialog', chatterDialogController]),
                    templateUrl: 'views/templates/chatterDialog.html',
        });
    }
    
    
     function chatterDialogController(scope, mdDialog){
         scope.chat = $scope.chat;
         var selectedComment;
            scope.hide = function(){
                mdDialog.hide();
            }
            scope.commentonChatter = function(key, content){
                Chatter.comment(key, content);
                console.log('comment button pressed')
            }
            scope.editChatter = function(content){
                scope.editing = true;
                scope.content_temp = content;
                document.getElementById('chattercontent').focus();
            }
            scope.cancelEditChatter = function(){
                scope.editing = false;
            }
            scope.saveChatter = function(content_temp){
                scope.editing = false;
                scope.chat.content = content_temp
                Chatter.edit(scope.chat.key, scope.chat.content);
            }
            scope.makeImportant = function(key){
                Chatter.makeImportant(key);
                console.log('important button pushed')
            }
            scope.deleteChatter = function(){
                console.log(scope.chat);
                $mdDialog.hide();
                scope.confirmDelete = false;
                Chatter.delete(scope.chat.key, scope.chat.content);
                for (var i = 0; i < $scope.chatter.length; i++){
                    if ($scope.chatter[i].key == scope.chat.key){
                        $scope.chatter.splice(i, 1);
                    }
                }
            }
            scope.saveComment = function(comment){
                comment.content = comment.comment_temp;
                comment.editingComment = false;
            }
            scope.editComment = function(comment){
                comment.comment_temp = comment.content;
                comment.editingComment = true;
            }
            scope.cancelEditComment = function(comment){
                comment.editingComment = false;
            }
            scope.confirmDeleteComment = function(comment){
                selectedComment = comment;
            }
            
        }
    
    $scope.newChatter = function(){
        $mdDialog.show({
                    controller: ('newChatterController', ['$scope', '$mdDialog', newChatterController]),
                    templateUrl: 'views/templates/newChatterDialog.html',
        });
    }
    
    function newChatterController(scope, mdDialog){
            scope.hide = function(){
                mdDialog.hide();
            }
            scope.addChatter = function(content){
                Chatter.create(content);
                mdDialog.hide();
            }

        }
    
}
                                     
]);