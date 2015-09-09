App.controller('LinksController', ['$scope', '$rootScope', '$mdDialog', 'RESTService', 'localStorageService', 'Links', 'Organization',
    function($scope, $rootScope, $mdDialog, RESTService, localStorageService, Links, Organization) {
        Links.get();
        $scope.linkGroups = Links.groups;
        if ($scope.linkGroups) {
            $scope.loading_finished = true;
        }
        $scope.$on('links:updated', function() {
            $scope.linkGroups = Links.groups;
            $scope.loading_finished = true;
        });
        
        var selectedGroup;
        var selectedLink;
        var groups;

        $scope.showConfirmDelete = function(group){
            selectedGroup = group;
        };     
        $scope.openEditLinkDialog = function(link, group) {
            selectedLink = link;
            selectedGroup = group;
            groups = $scope.linkGroups;
            $mdDialog.show({
                controller: 'linksDialogController',
                templateUrl: 'views/templates/links/editLinkDialog.html',
                locals: {group: selectedGroup, link: selectedLink, groups: groups, linkGroups: $scope.linkGroups},
                bindToController: true
            });
        };
        $scope.openNewLinkDialog = function() {
            groups = $scope.linkGroups;
            selectedLink = {};
            $mdDialog.show({
                controller: 'linksDialogController',
                templateUrl: 'views/templates/links/newLinkDialog.html',
                locals: {group: selectedGroup, link: selectedLink, groups: groups, linkGroups: $scope.linkGroups},
                bindToController: true
            });
        };
        $scope.openDeleteLinkDialog = function(link) {
            selectedLink = link;
            $mdDialog.show({
                controller: 'linksDialogController',
                templateUrl: 'views/templates/links/deleteLinkDialog.html',
                locals: {group: selectedGroup, link: selectedLink, groups: groups, linkGroups: $scope.linkGroups},
                bindToController: true
            });
        };
        $scope.openEditGroupDialog = function(group) {
            selectedGroup = group;
            $mdDialog.show({
                controller: 'linksDialogController',
                templateUrl: 'views/templates/links/editGroupDialog.html',
                locals: {group: selectedGroup, link: selectedLink, groups: groups, linkGroups: $scope.linkGroups},
                bindToController: true
            });
        };

        $scope.deleteGroup = function(group) {
            deleteGroup(group);
        };

        $scope.deleteLink = function(link, group){
            deleteLink(link, group);
        };

        function deleteGroup(group) {
            for (i = 0; i < $scope.linkGroups.length; i++){
                if (group.key === $scope.linkGroups[i].key){
                    $scope.linkGroups.splice(i, 1);    
                }
            }

            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/delete_group', {'key': group.key})
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                    } else {
                        console.log('ERR');
                    }
                    Links.set($scope.linkGroups);
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
        };


        function deleteLink(link, group) {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/link/v1/delete', {'key': link.key})
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        group.links.splice(group.links.indexOf(link), 1);
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
