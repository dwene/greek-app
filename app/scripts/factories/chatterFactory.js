App.factory('Chatter', ['RESTService', '$rootScope', 'localStorageService', '$q', '$mdToast', '$mdDialog',
function(RESTService, $rootScope, localStorageService, $q, $mdToast, $mdDialog) {

  var chatter = {};
  chatter.hasLoaded = false;
  chatter.data = {};
  var meta = {feedLoaded: false, importantLoaded: false};

  //for loops
  var i;
  var j;

  function loadChatterByKey(key, open){
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/getByKey', {key: key})
    .success(function(data) {
      if (!RESTService.hasErrors(data)) {
        var load_data = JSON.parse(data.data);
        if (load_data !== false){
          if (meta.feedLoaded){
            chatter.data.feed.chatters.push(load_data);
            $rootScope.$broadcast('chatter:updated');
          }
          if (open){
            chatter.openChatter(load_data);
          }
        }
        else{
          if (open){
            // #TODO: get toast to say that chatter has been deleted.
          }
        }
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data) {
      console.log('Error: ', data);
    });
  }

  function getChattersByKey(key){
    var chatters = [];
    if (chatter.data.feed){
      for (i = 0; i < chatter.data.feed.chatters.length; i++){
        if (chatter.data.feed.chatters[i].key === key){
          chatters.push(chatter.data.feed.chatters[i]);
          break;
        }
      }
      for (i = 0; i < chatter.data.important.chatters.length; i++){
        if (chatter.data.important.chatters[i].key === key){
          chatters.push(chatter.data.important.chatters[i]);
          break;
        }
      }
    }
    return chatters;
  }

  function updateChatter(chat){
    var has_changed = false;

    if (meta.feedLoaded){
      for (i = 0; i < chatter.data.feed.chatters.length; i++){
        if (chatter.data.feed.chatters[i].key == chat.key){
          chatter.data.feed.chatters[i] = chat;
          has_changed = true;
          break;
        }
      }
      if (has_changed){
        $rootScope.$broadcast('chatter:updated');
      }
    }

    has_changed = false;

    if (meta.importantLoaded){
      for (i = 0; i < chatter.data.important.chatters.length; i++){
        if (chatter.data.important.chatters[i].key == chat.key){
          chatter.data.important.chatters[i] = chat;
          has_changed = true;
          break;
        }
      }
      if (has_changed){
        $rootScope.$broadcast('importantChatter:updated');
      }
    }
  }

  chatter.get = function() {
    if (meta.feedLoaded) {
      return;
    }
    meta.feedLoaded = true;
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/get', {important: false})
    .success(function(data) {
      if (!RESTService.hasErrors(data)) {
        var load_data = JSON.parse(data.data);
        chatter.data.feed = load_data;
        $rootScope.$broadcast('chatter:updated');
        meta.feedLoaded = true;
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data) {
      console.log('Error: ', data);
    });
  };

  chatter.loadMoreChatters = function(meta) {
    if (meta.loading === false) {
      meta.loading = true;
      RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/get', {important: true, cursor:meta.cursor})
      .success(function(data) {
        if (!RESTService.hasErrors(data)) {
          var load_data = JSON.parse(data.data);
          var chatterType = meta.important === true ? chatter.data.important : chatter.data.feed;
          chatterType.chatters = chatterType.chatters.concat(load_data.chatters);
          chatterType.more = load_data.more;
          chatterType.cursor = load_data.cursor;
          if (meta.important === true) {
            $rootScope.$broadcast('importantChatter:updated');
          }
          else {
            $rootScope.$broadcast('chatter:updated');
          }
        } else {
          console.log('Err', data);
        }
        meta.loading = false;
      })
      .error(function(data) {
        console.log('Error: ', data);
        meta.loading = false;
      });
    }
  };

  chatter.destroy = function(){
    chatter.data = {};
    localStorageService.remove('chatter');
    chatter.hasLoaded = false;
    meta = {feedLoaded: false, importantLoaded: false};
  };

  chatter.getImportant = function() {
    if (meta.importantLoaded) {
      return;
    }
    meta.importantLoaded = true;
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/get', {important: true})
    .success(function(data) {
      if (!RESTService.hasErrors(data)) {
        var load_data = JSON.parse(data.data);
        chatter.data.important = load_data;
        $rootScope.$broadcast('importantChatter:updated');
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data) {
      console.log('Error: ', data);
    });
  };

  chatter.getComments = function(chat){
    var deferred = $q.defer();

    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comments/get', {key: chat.key})
    .success(function(data) {
      if (!RESTService.hasErrors(data)) {
        var load_data = JSON.parse(data.data);
        chat.comments = load_data.comments;
        chat.comments_meta.more = load_data.more;
        chat.comments_meta.cursor = load_data.cursor;
        console.log('chatter with comments', chat);
        updateChatter(chat);
        deferred.resolve();
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data) {
      console.log('Error: ', data);
    });
    return deferred.promise;
  };

  chatter.create = function(content, important, notify){
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/post', {content:content, important:important, notify:notify})
    .success(function(data) {
      if (!RESTService.hasErrors(data)) {
        var newChat = JSON.parse(data.data);
        if (getChattersByKey(newChat.key).length > 0){
          return;
        }
        if (important){
          chatter.data.important.chatters.push(newChat);
        }
        chatter.data.feed.chatters.push(newChat);
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data) {
      console.log('Error: ', data);
    });
  };

  chatter.like = function(chat){
    if (chat.like){
      chat.like = false;
      chat.likes --;
    }
    else{
      chat.like = true;
      chat.likes ++;
    }
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/like', {key:chat.key})
    .success(function(data){
      if (!RESTService.hasErrors(data)) {
        var loaded = JSON.parse(data.data);
        chat.following = loaded.following;
        for (i = 0; i < chatter.data.feed.chatters.length; i++){
          if (chat.key == chatter.data.feed.chatters[i].key){
            chatter.data.feed.chatters[i] = chat;
          }
        }
        for (i = 0; i < chatter.data.important.chatters.length; i++){
          if (chat.key == chatter.data.important.chatters[i].key){
            chatter.data.important.chatters[i] = chat;
          }
        }

      } else {
        console.log('Err', data);
      }
    })
    .error(function(data){
      console.log('Error: ', data);
    });
  };

  chatter.comment = function(chat, content){
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comment/post', {key:chat.key, content:content})
    .success(function(data){
      if (!RESTService.hasErrors(data)) {
        var loaded = JSON.parse(data.data);
        chat.comments.push(loaded.comment);
        console.log('chat', chat);
        chat.comments_meta.length++;
        chat.following = loaded.following;
        updateChatter(chat);
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data){
      console.log('Error: ', data);
    });
  };

  chatter.saveComment = function(comment, content){
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comment/edit', {key:comment.key, content:content})
    .success(function(data){
      if (!RESTService.hasErrors(data)) {
        load_data = JSON.parse(data.data);
        comment.edited = load_data.edited;
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data){
      console.log('Error: ', data);
    });
  };

  chatter.loadMoreComments = function(chatter){
    var def = $q.defer();
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comments/get', {key: chatter.key, cursor: chatter.comments_meta.cursor})
    .success(function(data){
      if (!RESTService.hasErrors(data)) {
        load_data = JSON.parse(data.data);
        chatter.comments = chatter.comments.concat(load_data.comments);
        chatter.comments_meta.more = load_data.more;
        chatter.comments_meta.cursor = load_data.cursor;
        def.resolve();
      } else {
        console.log('Err', data);
        def.reject('Failed to load comments');
      }
    })
    .error(function(data){
      console.log('Error: ', data);
      def.reject('Failed to load comments');
    });
    return def.promise;
  }

  chatter.likeComment = function(comment){
    if (comment.like){
      comment.like = false;
      comment.likes--;
    }
    else{
      comment.likes++;
      comment.like = true;
    }
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comment/like', {key:comment.key})
    .success(function(data){
      if (!RESTService.hasErrors(data)) {
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data){
      console.log('Error: ', data);
    });
  };

  chatter.deleteComment = function(comment, chat){
    for (var i = 0; i < this.data.feed.chatters.length; i++){
      if (this.data.feed.chatters[i].key == chat.key){
        var this_chatter = this.data.feed.chatters[i];
        for (j = 0; j < this_chatter.comments.length; j++){
          if (comment.key == this_chatter.comments[j].key){
            this_chatter.comments.splice(j, 1);
          }
        }
      }
    }
    for (i = 0; i < this.data.important.chatters.length; i++){
      if (this.data.important.chatters[i].key == chat.key){
        var this_chatter = this.data.important.chatters[i];
        for (j = 0; j < this_chatter.comments.length; j++){
          if (comment.key == this_chatter.comments[j].key){
            this_chatter.comments.splice(j, 1);
          }
        }
      }
    }
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/comment/delete', {key:comment.key})
    .success(function(data){
      if (!RESTService.hasErrors(data)) {
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data){
      console.log('Error: ', data);
    });
  };

  chatter.makeImportant = function(chat, notify) {
    chat.important = !chat.important;
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/important', {key:chat.key, notify:notify})
    .success(function(data){
      if (!RESTService.hasErrors(data)) {
        if (chat.important){
          chatter.data.important.chatters.push(chat);
        }else{
          for (i = 0; i < chatter.data.important.chatters.length; i++){
            if (chatter.data.important.chatters[i].key == chat.key){
              chatter.data.important.chatters.splice(i, 1);
              break;
            }
          }
        }
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data){
      console.log('Error: ', data);
    });
  };

  chatter.delete = function(chat){
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/delete', {key:chat.key})
    .success(function(data) {
      if (!RESTService.hasErrors(data)) {
        for (i = 0; i < chatter.data.feed.chatters.length; i++){
          if (chat.key == chatter.data.feed.chatters[i].key){
            chatter.data.feed.chatters.splice(i, 1);
          }
        }
        for (i = 0; i < chatter.data.important.chatters.length; i++){
          if (chat.key == chatter.data.important.chatters[i].key){
            chatter.data.important.chatters.splice(i, 1);
          }
        }
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data) {
      console.log('Error: ', data);
    });
  };

  chatter.edit = function(chat, content){
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/edit', {key:chat.key, content:content})
    .success(function(data) {
      if (!RESTService.hasErrors(data)) {
        var load_data = JSON.parse(data.data);
        chat.edited = load_data.edited;
        for (i = 0; i < chatter.data.feed.chatters.length; i++){
          if (chat.key == chatter.data.feed.chatters[i].key){
            chatter.data.feed.chatters[i].content = content;
          }
        }
        for (i = 0; i < chatter.data.important.chatters.length; i++){
          if (chat.key == chatter.data.important.chatters[i].key){
            chatter.data.important.chatters[i].content = content;
          }
        }
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data) {
      console.log('Error: ', data);
    });
  };

  chatter.mute = function(chat){
    if (chat.following){
      chat.following = false;
    }
    else{
      chat.following = true;
    }
    RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/chatter/v1/mute', {key:chat.key})
    .success(function(data){
      if (!RESTService.hasErrors(data)) {
        for (i = 0; i < chatter.data.feed.chatters.length; i++){
          if (chat.key == chatter.data.feed.chatters[i].key){
            chatter.data.feed.chatters[i] = chat;
          }
        }
        for (i = 0; i < chatter.data.important.chatters.length; i++){
          if (chat.key == chatter.data.important.chatters[i].key){
            chatter.data.important.chatters[i] = chat;
          }
        }
      } else {
        console.log('Err', data);
      }
    })
    .error(function(data){
      console.log('Error: ', data);
    });
  };

  chatter.updateLikes = function(data){
    var key = data.key;
    var chatters = getChattersByKey(key);
    for(var i = 0; i < chatters.length; i++){
      chatters[i].likes = data.data.likes;
    }
  };

  chatter.updateNewChatter = function(chat) {
    if (getChattersByKey(chat.key).length === 0){
      this.data.feed.chatters.push(chat);
      if (chat.important){
        this.data.important.chatters.push(chat);
      }
    }
  };

  chatter.openChatter = function(chat) {
    if (chat.comments.length){
      $mdDialog.show({
        controller: 'chatterDialogController as CD',
        templateUrl: 'views/templates/chatterDialog.html',
        locals: {chat: chat},
        bindToController: true
      });
    }
    else{
      this.getComments(chat).then(function(){
        $mdDialog.show({
          controller: 'chatterDialogController as CD',
          templateUrl: 'views/templates/chatterDialog.html',
          locals: {chat: chat},
          bindToController: true
        });
        chat.chatLoading = false;
    });
    }
  };

  chatter.openChatterByKey = function(chatter_key) {
    var chats = getChattersByKey(chatter_key);
    if (chats.length){
      return this.openChatter(chats[0]);
    }
    else{
      loadChatterByKey(chatter_key, true);
    }
  };

  return chatter;
}
]);
