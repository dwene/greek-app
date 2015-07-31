App.directive('removeHttp', function() {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            ngModel: '='
        },
        controller: function($scope) {
            var index = 0;
            $scope.$watch('ngModel', function() {
                if ($scope.ngModel) {
                    if ($scope.ngModel.slice(0, 7).toLowerCase() == 'http://') {
                        $scope.ngModel = $scope.ngModel.slice(7);
                    }
                    if ($scope.ngModel.slice(0, 8).toLowerCase() == 'https://') {
                        $scope.ngModel = $scope.ngModel.slice(8);
                    }
                }

            });
        }
    };
});
