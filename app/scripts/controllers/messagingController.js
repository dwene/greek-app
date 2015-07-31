App.controller('messagingController', ['$scope', 'RESTService', '$q', '$rootScope', 'localStorageService', '$sce', 'Tags', 'Directory',
    function($scope, RESTService, $q, $rootScope, localStorageService, $sce, Tags, Directory) {
        Directory.get();
        Tags.get();
        $scope.directory = Directory.directory;
        $scope.$on('directory:updated', function() {
            $scope.directory = Directory.directory;
        });
        $scope.tags = Tags.tags;
        $scope.$on('tags:updated', function() {
            $scope.tags = Tags.tags;
        });
        $scope.finished_loading = false;
        $scope.$watchCollection('[directory, tags]', function() {
            if ($scope.directory != null && $scope.tags != null) {
                $scope.finished_loading = true;
            }
        });
        $scope.menuOptions = [
            ['bold', 'italic', 'underline', 'strikethrough'],
            ['font'],
            ['font-size'],
            ['font-color', 'hilite-color'],
            ['remove-format'],
            ['outdent', 'indent'],
            ['left-justify', 'center-justify', 'right-justify'],
            [],
            ['link', 'image']
        ];

        $scope.sentMessages = [];
        $scope.clearUsers = false;
        $scope.deleteMessageTip = {
            "title": "Delete Message"
        }
        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.maxPageNumber = 5;
        $scope.recentLoaded = false;
        RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/message/v1/recently_sent', '')
            .success(function(data) {
                $scope.recentLoaded = true;
                if (!RESTService.hasErrors(data)) {
                    $scope.sentMessages = JSON.parse(data.data);
                    // $rootScope.sentMessages = $scope.sentMessages;
                    console.log($scope.sentMessages);
                } else {
                    console.log("error: ", data.error)
                }
            })
            .error(function(data) {
                $scope.recentLoaded = true;
                console.log('Error: ', data);
            });

        $scope.sendMessage = function(isValid, tags, title, content) {
            if (isValid) {
                var selectedKeys = []
                console.log('selected members', $scope.selectedMembers.length);
                for (var i = 0; i < $scope.selectedMembers.length; i++) {

                    if ($scope.selectedMembers[i].user) {
                        selectedKeys.push($scope.selectedMembers[i].user.key);
                    } else if ($scope.selectedMembers[i].key) {
                        selectedKeys.push($scope.selectedMembers[i].key);
                    }
                }
                console.log('content', typeof content);
                console.log('content toString', typeof content.toString());
                var fixed_content = content.toString().replace('<a href=', '<a target="_blank" href=');
                var to_send = {
                    title: title,
                    content: fixed_content,
                    keys: selectedKeys
                };
                console.log("what Im sending in message", to_send);
                $scope.updating = "pending"
                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/message/v1/send_message', to_send)
                    .success(function(data) {
                        if (!RESTService.hasErrors(data)) {
                            $scope.updating = "done";
                            $scope.title = '';
                            $scope.content = '';
                            $scope.messagingForm.$setPristine();
                            $scope.clearUsers = true;
                            clearCheckedTags($scope.tags);

                            setTimeout(function() {
                                RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/message/v1/recently_sent', '')
                                    .success(function(data) {
                                        if (!RESTService.hasErrors(data)) {
                                            $scope.sentMessages = JSON.parse(data.data);
                                        } else {
                                            console.log("error: ", data.error)
                                        }
                                    })
                            }, 2000);
                            console.log('message sent');
                        } else {
                            $scope.updating = "broken";
                            console.log("error: ", data.error)
                        }
                    })
                    .error(function(data) {
                        $scope.updating = "broken";
                        console.log('Error: ', data);
                    });

            } else {
                $scope.submitted = true;
            }
        }

        $scope.deleteMessage = function(message) {
            $('#messageModal').modal('hide');
            var to_send = {
                message: message.key
            }
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/message/v1/delete', to_send)
                .success(function(data) {
                    if (!RESTService.hasErrors(data)) {
                        console.log('message removed');
                    } else {
                        console.log("error: ", data.error)
                    }
                })
                .error(function(data) {
                    console.log('Error: ', data);
                });
            $scope.sentMessages.splice($scope.sentMessages.indexOf(message), 1);
        }

        $scope.openMessageModal = function(message) {
            $('#messageModal').modal();
            $scope.messageHTML = $sce.trustAsHtml(message.content);
            $scope.selectedMessage = message;
        }

        $('#showHiddenButton').click(function() {
            $(this).text(function(i, text) {
                return text === "Show Recently Sent" ? "Hide Recently Sent" : "Show Recently Sent";
            })
        });
    }
]);