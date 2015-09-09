App.factory('registerOrganizationService', function() {
    var data = undefined;

    return {
        get: function() {
            return data;
        },
        set: function(_data) {
            data = _data;
        }
    };
});