    App.controller('messagingController', function($scope, $http, $q, $rootScope, Load, localStorageService, $sce, Tags, Directory) {
    routeChange();
    $scope.finished_loading = false;
    $scope.directory = Directory.get();
    $scope.$watchCollection('[directory, tags]', function(){
        if ($scope.directory != null && $scope.tags != null ){
            $scope.finished_loading = true;
        }
    });
    $scope.$on('directory:updated', function(){
        $scope.directory = Directory.get();
    })
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

    Load.then(function(){ 
        $rootScope.requirePermissions(LEADERSHIP);
        // if ($rootScope.sentMessages){
        //     $scope.sentMessages = $rootScope.sentMessages;
        // }
        // else{
        $scope.sentMessages = [];
        // }
        $scope.clearUsers = false;
        $scope.deleteMessageTip = {
            "title" : "Delete Message"
        }
        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.maxPageNumber = 5;
        $scope.tags = Tags.get();
        $scope.$on('tags:updated', function(){
            $scope.tags = Tags.get();
        })
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/recently_sent', packageForSending(''))
            .success(function(data){
                if (!checkResponseErrors(data))
                {
                    $scope.sentMessages = JSON.parse(data.data);
                    // $rootScope.sentMessages = $scope.sentMessages;
                    console.log($scope.sentMessages);
                }
                else
                {
                    console.log("error: ", data.error)
                }
            })
            .error(function(data) {
                console.log('Error: ' , data);
            });      
        
        $scope.sendMessage = function(isValid, tags, title, content){
            if (isValid){
                var selectedKeys = []
                console.log('selected members', $scope.selectedMembers.length);
                for (var i = 0; i < $scope.selectedMembers.length; i++){
                    
                    if ($scope.selectedMembers[i].user){
                        selectedKeys.push($scope.selectedMembers[i].user.key);
                    }
                    else if($scope.selectedMembers[i].key){
                        selectedKeys.push($scope.selectedMembers[i].key);
                    }
                }
                console.log('content', typeof content);
                console.log('content toString', typeof content.toString());
                var fixed_content = content.toString().replace('<a href=', '<a target="_blank" href=');
                var to_send = {title: title, content: fixed_content, keys: selectedKeys};
                console.log("what Im sending in message", to_send);
                $scope.updating = "pending"
                $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/send_message', packageForSending(to_send))
                    .success(function(data){
                        if (!checkResponseErrors(data))
                        {
                            $scope.updating = "done";
                            $scope.title = '';
                            $scope.content = '';
                            $scope.messagingForm.$setPristine();
                            $scope.clearUsers = true;
                            clearCheckedTags($scope.tags);
                            
                            setTimeout(function(){
                            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/recently_sent', packageForSending(''))
                            .success(function(data){
                                if (!checkResponseErrors(data))
                                {
                                    $scope.sentMessages = JSON.parse(data.data);
                                }
                                else
                                {
                                    console.log("error: ", data.error)
                                }
                            })
                            },2000);
                            console.log('message sent');
                        }
                        else
                        {
                            $scope.updating = "broken";
                            console.log("error: ", data.error)
                        }
                    })
                    .error(function(data) {
                        $scope.updating = "broken";
                        console.log('Error: ' , data);
                    });
                
            }
            else{ $scope.submitted = true; }
        }
        
        $scope.deleteMessage = function(message){
            $('#messageModal').modal('hide');
            var to_send = {message: message.key}
            $http.post(ENDPOINTS_DOMAIN + '/_ah/api/netegreek/v1/message/delete', packageForSending(to_send))
                    .success(function(data){
                        if (!checkResponseErrors(data))
                        {
                            console.log('message removed');
                        }
                        else
                        {
                            console.log("error: ", data.error)
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' , data);
                    });
            $scope.sentMessages.splice($scope.sentMessages.indexOf(message), 1);
        }
        
        $scope.openMessageModal = function(message){
            $('#messageModal').modal();
            $scope.messageHTML = $sce.trustAsHtml(message.content);
            $scope.selectedMessage = message;
        }
        
        $('#showHiddenButton').click(function () {
          $(this).text(function(i, text){
              return text === "Show Recently Sent" ? "Hide Recently Sent" : "Show Recently Sent";
          })
       }); 
    });
    });