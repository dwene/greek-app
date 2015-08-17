from ndbdatastore import Chatter, ChatterComment, User
from apiconfig import *
from protorpc import remote
import datetime
import logging
from pushfactory import PushFactory, LiveUpdate
chatter_api = endpoints.api(name='chatter', version='v1',
                            allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                            audiences=[ANDROID_AUDIENCE])

CHATTER = 'CHATTER'
COMMENT = 'CHATTERCOMMENT'


def list_followers(chatter):
    return list(set(chatter.following) - set(chatter.muted))


def format_author(author):
    if author is None:
        return {'first_name': 'Deleted',
                'last_name': 'User',
                'prof_pic': '',
                'key': ''}
    return {'first_name': author.first_name,
            'last_name': author.last_name,
            'prof_pic': get_image_url(author.prof_pic),
            'key': author.key}


@chatter_api.api_class(resource_name='chatter')
class ChatterApi(remote.Service):
    @endpoints.method(IncomingMessage, OutgoingMessage, path='get', http_method='POST', name='chatter.get')
    def get_chatter(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        cursor = None
        if 'cursor' in data:
            cursor = Cursor(urlsafe=data['cursor'])
        if 'important' in data and data['important'] is True:
            chatters, next_cursor, has_more = Chatter.query(Chatter.organization == request_user.organization,
                                            Chatter.important == True).order(
                -Chatter.timestamp).fetch_page(15, start_cursor=cursor)
        else:
            chatters, next_cursor, has_more = Chatter.query(Chatter.organization == request_user.organization) \
                .order(-Chatter.timestamp).fetch_page(15, start_cursor=cursor)
        chatter_dict = {}
        chatter_list = list()
        for chatter in chatters:
            local_chatter_dict = chatter.to_dict()
            chatter_list.append(local_chatter_dict)
        for chatter in chatter_list:
            chatter['author_future'] = chatter['author'].get_async()
            chatter['like'] = request_user.key in chatter['likes']
            chatter['likes'] = len(chatter['likes'])
            chatter['following'] = request_user.key in chatter['following'] and request_user not in chatter['muted']
            author = chatter['author_future'].get_result()
            chatter['author'] = format_author(author)
            comments_meta = dict()
            comments_meta['length'] = len(chatter['comments'])
            comments_meta['cursor'] = None
            comments_meta['more'] = None
            chatter['comments_meta'] = comments_meta
            chatter['comments'] = list()
            del chatter['author_future']
            del chatter['muted']
        chatter_dict['cursor'] = next_cursor
        chatter_dict['more'] = has_more
        chatter_dict['chatters'] = chatter_list
        return OutgoingMessage(error='', data=json_dump(chatter_dict))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='getByKey',
                      http_method='POST', name='chatter.get_by_key')
    def get_by_key(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        chatter = ndb.Key(urlsafe=data['key']).get()
        if chatter is None:
            return OutgoingMessage(error='', data=json_dump(False))
        chatter_dict = chatter.to_dict()
        author = chatter_dict['author'].get()
        chatter_dict['author'] = format_author(author)
        chatter_dict['like'] = request_user.key in chatter_dict['likes']
        chatter_dict['likes'] = len(chatter_dict['likes'])
        chatter_dict['following'] = request_user.key in chatter_dict['following'] and \
                                    request_user.key not in chatter_dict['muted']
        comments_meta = dict()
        comments_meta['length'] = len(chatter_dict['comments'])
        comments_meta['cursor'] = None
        comments_meta['more'] = None
        chatter_dict['comments_meta'] = comments_meta
        chatter_dict['comments'] = list()
        del chatter_dict['muted']
        return OutgoingMessage(error='', data=json_dump(chatter_dict))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='comments/get',
                      http_method='POST', name='chatter.get_comments')
    def get_comments(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        cursor = None
        if 'cursor' in data:
            cursor = Cursor(urlsafe=data['cursor'])
        if 'key' not in data:
            return OutgoingMessage(error='Missing arguments in new Chatter.', data='')
        chatter_key = ndb.Key(urlsafe=data['key'])
        chatter_comments, next_cursor, more_comments = ChatterComment.query(ChatterComment.chatter == chatter_key).order(
            -ChatterComment.timestamp).fetch_page(20, start_cursor=cursor)
        comments_list = list()
        for comment in chatter_comments:
            comments_list.append(ndb_to_dict(comment))
        author_keys = list()
        for comment in comments_list:
            comment['like'] = request_user.key in comment['likes']
            comment['likes'] = len(comment['likes'])
            if comment['author'] not in author_keys:
                author_keys.append(comment['author'])
        if author_keys:
            User.query(User.key.IN(author_keys)).fetch(projection=[User.first_name, User.last_name, User.prof_pic])
            authors = ndb.get_multi(author_keys)
            for comment in comments_list:
                for author in authors:
                    if author.key == comment['author']:
                        comment['author'] = format_author(author)
                        break
        comments_dict = dict()
        comments_dict['comments'] = comments_list
        comments_dict['cursor'] = next_cursor
        comments_dict['more'] = more_comments
        return OutgoingMessage(error='', data=json_dump(comments_dict))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='post',
                      http_method='POST', name='chatter.post')
    def post_chatter(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        push_keys = User.query(User.organization == request_user.organization).fetch(keys_only=True)
        data = json.loads(request.data)
        if not all(k in data for k in ('content', 'important')):
            return OutgoingMessage(error='Missing arguments in new Chatter.', data='')
        chatter = Chatter()
        chatter.content = data['content']
        chatter.important = data['important']
        chatter.author = request_user.key
        chatter.timestamp = datetime.datetime.now()
        chatter.organization = request_user.organization
        chatter.following = [request_user.key]
        chatter_future = chatter.put_async()
        update = LiveUpdate()
        update.type = 'Chatter'

        chatter_key = chatter_future.get_result()
        chat = ndb_to_dict(chatter)
        chat['following'] = True
        chat['comments'] = list()
        chat['like'] = False
        chat['likes'] = 0
        chat['comments_count'] = len(chatter.comments)
        chat['comments'] = list()
        comments_dict = dict()
        comments_dict['length'] = 0
        comments_dict['cursor'] = None
        comments_dict['more'] = None
        chat['comments_meta'] = comments_dict
        chat['author'] = {'first_name': request_user.first_name,
                          'last_name': request_user.last_name,
                          'prof_pic': get_image_url(request_user.prof_pic),
                          'key': request_user.key}
        if data['important'] is True and data['notify'] is True:
            notification = dict()
            notification['content'] = request_user.first_name + ' ' + request_user.last_name + \
                                      ' just posted an important chatter.'
            notification['sender'] = request_user.key
            notification['type'] = 'CHATTERCOMMENT'
            notification['type_key'] = chatter_key
            if request_user.key in push_keys:
                push_keys.remove(request_user.key)
            PushFactory.send_notification_with_keys(notification, push_keys)
        del chat['muted']
        update = LiveUpdate()
        update.type = CHATTER
        update.key = chatter.key
        update.data = {'type': 'NEWCHATTER', 'chatter': chat}
        PushFactory.push_update(update, push_keys)
        return OutgoingMessage(error='', data=json_dump(chat))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='delete',
                      http_method='POST', name='chatter.delete')
    def delete_chatter(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        push_keys = User.query(User.organization == request_user.organization).fetch(keys_only=True)
        if 'key' not in data:
            return OutgoingMessage(error='Missing arguments in deleting Chatter.')
        chatter = ndb.Key(urlsafe=data['key']).get()
        if not ((chatter.author is request_user.key) or is_admin(request_user)):
            return OutgoingMessage(error='Incorrect Permissions', data='')
        comments_future = ndb.delete_multi_async(chatter.comments)
        chatter_future = chatter.key.delete_async()
        for item in comments_future:
            item.get_result()
        chatter_future.get_result()
        update = LiveUpdate()
        update.type = CHATTER
        update.key = chatter.key
        update.data = {'type': 'DELETECHATTER'}
        PushFactory.push_update(update, push_keys)
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='edit',
                      http_method='POST', name='chatter.edit')
    def edit_chatter(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        push_keys = User.query(User.organization == request_user.organization).fetch(keys_only=True)
        data = json.loads(request.data)
        if not all(k in data for k in ('content', 'key')):
            return OutgoingMessage(error='Missing arguments in editing Chatter.')
        chatter = ndb.Key(urlsafe=data['key']).get()
        if not str(type(chatter)).startswith('Chatter<'):
            return OutgoingMessage(error='Incorrect Permissions', data='')
        if not (chatter.author == request_user.key):
            return OutgoingMessage(error='Incorrect Permissions', data='')
        chatter.content = data['content']
        chatter.edited = datetime.datetime.now()
        chatter.put()
        update = LiveUpdate()
        update.type = CHATTER
        update.key = chatter.key
        update.data = {'type': 'EDITCHATTER', 'content': chatter.content, 'edited': chatter.edited}
        PushFactory.push_update(update, push_keys)
        return OutgoingMessage(error='', data=json_dump({'edited': chatter.edited}))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='important',
                      http_method='POST', name='chatter.importance')
    def change_important_flag(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        if not all(k in data for k in ('notify', 'key')):
            return OutgoingMessage(error='Missing arguments in flagging Chatter.')
        chatter = ndb.Key(urlsafe=data['key']).get()
        if not str(type(chatter)).startswith('Chatter'):
            return OutgoingMessage(error='Incorrect type of Key', data='')
        if not is_admin(request_user):
            return OutgoingMessage(error='Incorrect Permissions', data='')
        push_keys = User.query(User.organization == request_user.organization).fetch(keys_only=True)

        if chatter.important is False:
            chatter.important = True
            if data['notify'] is True:
                notification = dict()
                notification['content'] = request_user.first_name + ' ' + request_user.last_name + \
                                          ' just posted an important chatter.'
                notification['sender'] = request_user.key
                notification['type'] = 'CHATTERCOMMENT'

                if request_user.key in push_keys:
                    push_keys.remove(request_user.key)
                PushFactory.send_notification_with_keys(notification, push_keys)
        else:
            chatter.important = False
        chatter.put()
        update = LiveUpdate()
        update.type = CHATTER
        update.key = chatter.key
        update.data = {'type': 'IMPORTANT', 'important': chatter.important}
        PushFactory.push_update(update, push_keys)
        return OutgoingMessage(error='', data=json_dump(chatter.important))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='like',
                      http_method='POST', name='chatter.like')
    def like_chatter(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        push_keys = User.query(User.organization == request_user.organization).fetch(keys_only=True)
        data = json.loads(request.data)
        if not 'key' in data:
            return OutgoingMessage(error='Missing arguments in liking Chatter.')
        chatter = ndb.Key(urlsafe=data['key']).get()
        if request_user.key not in chatter.likes:
            chatter.likes.append(request_user.key)
            chatter.following = list(set(chatter.following + chatter.likes))
            chatter.put()
            like = True
        else:
            chatter.likes.remove(request_user.key)
            chatter.put()
            like = False
        following = request_user.key in list_followers(chatter)
        update = LiveUpdate()
        update.type = CHATTER
        update.key = chatter.key
        update.data = {'type': 'LIKE', 'likes': len(chatter.likes)}
        PushFactory.push_update(update, push_keys)
        return OutgoingMessage(error='', data=json_dump({'like': like, 'following': following}))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='comment/post',
                      http_method='POST', name='chatter.comment')
    def comment_chatter(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        push_keys = User.query(User.organization == request_user.organization).fetch(keys_only=True)
        data = json.loads(request.data)
        if not all(k in data for k in ('content', 'key')):
            return OutgoingMessage(error='Missing arguments in new Chatter.')
        chatter = ndb.Key(urlsafe=data['key']).get()
        comment = ChatterComment()
        comment.author = request_user.key
        comment.organization = request_user.organization
        comment.timestamp = datetime.datetime.now()
        comment.organization = request_user.organization
        comment.content = data['content']
        comment.chatter = chatter.key
        chatter.comments.append(comment.put())
        if request_user.key not in chatter.following:
            chatter.following.append(request_user.key)
        chatter_future = chatter.put_async()
        comm = ndb_to_dict(comment)
        comm['like'] = False
        comm['likes'] = 0
        comm['author'] = {'first_name': request_user.first_name,
                          'last_name': request_user.last_name,
                          'prof_pic': get_image_url(request_user.prof_pic),
                          'key': request_user.key}
        notification = dict()

        notification['content'] = request_user.first_name + ' ' + request_user.last_name + \
                                    ' just commented on a chatter you are following!'
        notification['sender'] = request_user.key
        notification['type'] = 'CHATTERCOMMENT'
        notification['type_key'] = chatter.key
        follower_keys = list((set(chatter.following) - set(chatter.muted)))
        if request_user.key in follower_keys:
            follower_keys.remove(request_user.key)
        PushFactory.send_notification_with_keys(notification, follower_keys)
        following = request_user.key in chatter.following and request_user.key not in chatter.muted

        update = LiveUpdate()
        update.key = chatter.key
        update.type = CHATTER
        update.data = {'type': 'NEWCOMMENT', 'comments_count': len(chatter.comments), 'comment': comm}
        PushFactory.push_update(update, push_keys)
        chatter_future.get_result()
        return OutgoingMessage(error='', data=json_dump({'comment': comm, 'following': following}))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='comment/like',
                      http_method='POST', name='chatter.like_comment')
    def like_comment(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        push_keys = User.query(User.organization == request_user.organization).fetch(keys_only=True)
        data = json.loads(request.data)
        if 'key' not in data:
            return OutgoingMessage(error='Missing arguments in new Chatter.')
        comment = ndb.Key(urlsafe=data['key']).get()
        if not str(type(comment)).startswith('ChatterComment'):
            return OutgoingMessage(error='Incorrect type of Key', data='')
        if request_user.key in comment.likes:
            comment.likes.remove(request_user.key)
        else:
            comment.likes.append(request_user.key)
        comment_future = comment.put_async()
        update = LiveUpdate()
        update.type = CHATTER
        update.key = comment.chatter
        update.data = {'type': 'LIKECOMMENT', 'comment_key': comment.key, 'likes': len(comment.likes)}
        PushFactory.push_update(update, push_keys)
        comment_future.get_result()
        return OutgoingMessage(error='', data=json_dump(request_user.key in comment.likes))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='comment/edit',
                      http_method='POST', name='chatter.edit_comment')
    def edit_comment(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        push_keys = User.query(User.organization == request_user.organization).fetch(keys_only=True)
        data = json.loads(request.data)
        if not all(k in data for k in ('content', 'key')):
            return OutgoingMessage(error='Missing arguments in new Chatter.')
        comment = ndb.Key(urlsafe=data['key']).get()
        if not str(type(comment)).startswith('ChatterComment'):
            return OutgoingMessage(error='Incorrect type of Key', data='')
        if not (comment.author == request_user.key):
            return OutgoingMessage(error='Incorrect Permissions', data='')
        comment.content = data['content']
        comment.edited = datetime.datetime.now()
        future = comment.put_async()
        update = LiveUpdate()
        update.type = CHATTER
        update.key = comment.chatter
        update.data = {'type': 'EDITCOMMENT', 'key': comment.key, 'comment': comment.content, 'edited': comment.edited}
        PushFactory.push_update(update, push_keys)
        future.get_result()
        return OutgoingMessage(error='', data=ndb_to_json(comment))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='comment/delete',
                      http_method='POST', name='chatter.delete_comment')
    def delete_comment(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        push_keys = User.query(User.organization == request_user.organization).fetch(keys_only=True)
        data = json.loads(request.data)
        if not 'key' in data:
            return OutgoingMessage(error='Missing arguments in new Chatter.')
        comment = ndb.Key(urlsafe=data['key']).get()
        if not str(type(comment)).startswith('ChatterComment<'):
            return OutgoingMessage(error='Incorrect type of Key', data='')
        if not ((comment.author == request_user.key) or is_admin(request_user)):
            return OutgoingMessage(error='Incorrect Permissions', data='')
        chat = comment.chatter.get()
        chat.comments.remove(comment.key)
        futures = list()
        futures.append(chat.put_async())
        futures.append(comment.key.delete_async())
        update = LiveUpdate()
        update.type = CHATTER
        update.key = chat.key
        update.data = {'type': 'DELETECOMMENT', 'key': comment.key, 'comments_count': len(chat.comments)}
        PushFactory.push_update(update, push_keys)
        for future in futures:
            future.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='mute',
                      http_method='POST', name='chatter.mute')
    def mute_chatter(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        if not 'key' in data:
            return OutgoingMessage(error='Missing arguments in new Chatter.')
        chatter = ndb.Key(urlsafe=data['key']).get()
        following = False
        if request_user.key in chatter.following and request_user.key in chatter.muted:
            chatter.muted.remove(request_user.key)
            following = True
        elif request_user.key in chatter.following and request_user.key not in chatter.muted:
            chatter.muted.append(request_user.key)
            following = False
        elif request_user.key not in chatter.following:
            chatter.following.append(request_user.key)
            following = True
        chatter.put()
        return OutgoingMessage(error='', data=json_dump({'following': following}))