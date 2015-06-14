App.controller('chatterController', ['$scope', 'RESTService', '$rootScope', '$mdDialog', '$timeout', 'localStorageService', 'Directory',
                                     
function($scope, RESTService, $rootScope, $mdDialog, $timeout, localStorageService, Directory) {
    
    
    $scope.chatter = [
        {content:'howdy'},
        {content:'testing'}
    ];
    
}
                                     
]);