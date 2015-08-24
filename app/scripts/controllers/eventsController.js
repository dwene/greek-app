App.controller('eventsController', ['$scope', 'Organization', 
    function($scope, Organization) {
    	$scope.permitted = true;
    	$scope.$on('organization:updated', function(){
    		evaluatePermitted();
    	});
    	function evaluatePermitted(){
    		for (var i = 0 ; i < Organization.organization.features.length; i++){
	    		if (Organization.organization.features[i].name == "events"){
	    			$scope.permitted = true;
	    		}
	    	}
    	}
    	evaluatePermitted();
    	
    }
])