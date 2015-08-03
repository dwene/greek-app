App.controller('linksDialogController', ['$scope', '$mdDialog', 'RESTService', 'Links',
    function($scope, $mdDialog, RESTService, Links){
        var vm = this;
        $scope.linkGroups = vm.linkGroups;
        $scope.groups = vm.groups;
        $scope.group = vm.group;
        $scope.link = vm.link;
        if ($scope.link && $scope.group) {
            $scope.tempLink = JSON.parse(JSON.stringify($scope.link));
            $scope.tempGroup = JSON.parse(JSON.stringify($scope.group));
        }
        $scope.closeDialog = function() {
            $mdDialog.hide();
        }
        $scope.deleteGroup = function(group) {
            deleteGroup(group);
            $mdDialog.hide();
        }
        $scope.renameGroup = function(name) {
            renameGroup($scope.group, name);
            $mdDialog.hide();
        }
        $scope.createLink = function(title, link, group, newGroup) {
            createLink(title, link, group, newGroup);
            $mdDialog.hide();
        }
        $scope.deleteLink = function(link, group) {
            console.log('group deleting link from', group)
            deleteLink(link, group);
            $mdDialog.hide();
        }
        $scope.editLink = function(link, group, newGroup) {
            editLink(link, group, newGroup);
            $mdDialog.hide();
        }

        function createLink(title, url, group, newGroup) {
            var link = {title: title, link: url}
            var to_send = {
                group: group,
                link: link,
                newGroup: newGroup
            };
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/create', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        var parsed = JSON.parse(data.data);
                        console.log('returned link to group', parsed);
                        if (parsed.newGroup){
                            $scope.linkGroups.push(parsed.group);
                        }
                        else{
                            for (i = 0; i < $scope.linkGroups.length; i++){
                                if ($scope.linkGroups[i].key === parsed.link.group){
                                    $scope.linkGroups[i].links.push(parsed.link);
                                }
                            }
                        }
                        Links.set($scope.linkGroups);
                    } else {
                        console.log('ERR');
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };

        function editLink(link, group, newGroup) {
            if (newGroup === false){
                link.group = group.key;
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/edit', {link: link, group: group, newGroup: newGroup})
                    .success(function(data) {
                        if (!RESTService.hasErrors(data)) {
                            vm.link.title = link.title;
                            vm.link.link = link.link;
                            if (group !== vm.group) {
                                vm.group.links.splice(vm.group.links.indexOf($scope.link), 1);
                                if (newGroup) {
                                    var parsedGroup = JSON.parse(data.data);
                                    $scope.linkGroups.push(parsedGroup);
                                }
                                else {
                                    $scope.link.group = group.key;
                                    group.links.push($scope.link);
                                }
                            }
                        } else {
                            console.log('ERR');
                        }
                        Links.set($scope.linkGroups);
                    })
                    .error(function(data) {
                        console.log('Error: ', data);
                    });
        };

        function renameGroup(group, name) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/rename_group', {key:group.key, name:name})
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        group.name = name;

                    } else {
                        console.log('ERR');
                    }
                    Links.set($scope.linkGroups);
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };
    }
]);



            