App.filter('checked', function() {
    return function(input) {
        out = [];
        if (input) {
            for (i = 0; i < input.length; i++) {
                if (input[i].checked) {
                    out.push(input[i]);
                }
            }
        }
        return out;
    };
});