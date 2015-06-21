App.controller('chatterController', ['$scope', 'RESTService', '$rootScope', '$mdDialog', '$timeout', 'localStorageService', 'Directory', 'Chatter',
                                     
function($scope, RESTService, $rootScope, $mdDialog, $timeout, localStorageService, Directory, Chatter) {
    
    $scope.like = false;
    
    Chatter.get();
    
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
    
    $scope.likeChatter = function(chat){
    if ($scope.like == false){
        $scope.like = true;
    }
        else{
        $scope.like = false;    
    }
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
            scope.hide = function(){
                mdDialog.hide();
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
                Chatter.edit(scope.chat.content);
            }
            scope.confirmDelete = false;
            scope.showConfirmDelete = function(){
                scope.confirmDelete = true;
            };
            scope.hideConfirmDelete = function(){
                scope.confirmDelete = false;
            };
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