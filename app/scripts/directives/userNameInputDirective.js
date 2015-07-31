App.directive('userNameInput', function() {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            ngModel: '='
        },
        controller: function($scope) {
            $scope.$watch('ngModel', function() {
                if ($scope.ngModel) {
                    i = 0;
                    while (true) {
                        if (i >= $scope.ngModel.length) {
                            break;
                        }
                        if ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._".indexOf($scope.ngModel[i]) == -1 && $scope.ngModel.length > 0) {
                            $scope.ngModel = spliceSlice($scope.ngModel, i, 1);
                            if (i > 0) {
                                i--;
                            }
                            continue;
                        }
                        i++;
                    }
                }
            });
        }
    };
});
