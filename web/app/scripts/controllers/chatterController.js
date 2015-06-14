App.controller('chatterController', ['$scope', 'RESTService', '$rootScope', '$mdDialog', '$timeout', 'localStorageService', 'Directory',
                                     
function($scope, RESTService, $rootScope, $mdDialog, $timeout, localStorageService, Directory) {
    
    $scope.like = false;
    
    $scope.chatters = [
        {content:'Hey everybody, I was wondering what we were planning for the party tomorrow. Comment here if you want to help me plan! Hey everybody, I was wondering what we were planning for the party tomorrow. Comment here if you want to help me plan! Hey everybody, I was wondering what we were planning for the party tomorrow. Comment here if you want to help me plan!'},
        {content:'testing'}
    ];
    
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
        }
    
}
                                     
]);