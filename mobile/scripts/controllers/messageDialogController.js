App.controller('messageDialogController', function($scope, $mdDialog, $sce, AUTH_EVENTS, Organization, Inbox) {
    var message = Inbox.selected_message;
    var content = message.content.replace(/(?:\r\n|\r|\n)/g, '<br />');
    $scope.content = $sce.trustAsHtml(content);
    $scope.message = message;

    $scope.closeNotificationModal = function() {
        $mdDialog.hide();
    };
	});