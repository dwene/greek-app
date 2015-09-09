App.filter('htmlToPlaintext', function() {
    return function(text) {
        return String(text).replace(/<[^>]+>/gm, ' ').replace(/&nbsp;/gi, '');
    };
});