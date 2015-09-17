App.filter('phoneNumber', function() {
    return function(number) {
    	if (number){
    		if (number.length === 10) {
	            return number.slice(0, 3) + '-' + number.slice(3, 6) + '-' + number.slice(6, 10);
	        }
	        else{
	        	return number;
	        }
    	}
        return number;
    };
});