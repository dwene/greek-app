App.directive('alumniYearPicker', function() {
    return {
        restrict: 'E',
        scope: {
            alumni: '=',
            search: '=',
            selectedYear: '=',
            requireRegistration: '=?',
        },
        templateUrl: 'views/templates/alumniDirectoryPicker.html',
        controller: function($scope) {
            $scope.$watch('alumni', function() {
                if ($scope.alumni) {
                    if (!$scope.years) {
                        $scope.years = [];
                    }
                    for (i = 0; i < $scope.alumni.length; i++) {
                        var item = {
                            value: $scope.alumni[i].pledge_class_semester + ' ' + $scope.alumni[i].pledge_class_year,
                            year: $scope.alumni[i].pledge_class_year,
                            semester: $scope.alumni[i].pledge_class_semester
                        };
                        if ($scope.alumni[i].pledge_class_year && $scope.alumni[i].pledge_class_semester && !isAlreadyAdded(item)) {
                            if (!$scope.requireRegistration || ($scope.requireRegistration && $scope.alumni[i].user_name)) {
                                $scope.years.push(item);
                                if (!$scope.selectedYear) {
                                    $scope.selectedYear = item;
                                    $scope.highestYear = item;
                                } else if (item.year > $scope.selectedYear.year) {
                                    $scope.selectedYear = item;
                                    $scope.highestYear = item;
                                }
                            }
                        }
                    }
                    $scope.highestYear = $scope.years[0];
                    for (i = 0; i < $scope.years.length; i++) {
                        if ($scope.years[i].year > $scope.highestYear.year) {
                            $scope.highestYear = $scope.years[i];
                        }
                    }
                    $scope.selectedYear = $scope.highestYear;
                    //                console.log('years', $scope.years);
                    //                console.log('selectedYear',$scope.selectedYear);
                }
            });
            $scope.$watch('search', function() {
                if ($scope.search) {
                    if ($scope.search.length) {
                        $scope.selectedYear = undefined;
                    } else {
                        $scope.selectedYear = $scope.highestYear;
                    }
                } else {
                    $scope.selectedYear = $scope.highestYear;
                }
            });

            function isAlreadyAdded(item) {
                for (i = 0; i < $scope.years.length; i++) {
                    if (item.value == $scope.years[i].value) {
                        return true;
                    }
                }
                return false;
            }
        }
    };
});
