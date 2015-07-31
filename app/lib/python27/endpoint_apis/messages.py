from apiconfig import *
from protorpc import remote
import datetime

message = endpoints.api(name='message', version='v1',
                        allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                        audiences=[ANDROID_AUDIENCE])


@message.api_class(resource_name='message')
class AuthApi(remote.Service):
    @endpoints.method(IncomingMessage, OutgoingMessage, path='send_message',
                      http_method='POST', name='message.send_message')
    def send_message(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        data = json.loads(request.data)
        user_list_future = list()
        user_list = list()
        if 'keys' in data:
            for key in data['keys']:
                user_list_future.append(ndb.Key(urlsafe=key).get_async())
        for user in user_list_future:
            user_list.append(user.get_result())
        msg = Message()
        msg.content = data['content']
        msg.timestamp = datetime.datetime.now()
        msg.sender = request_user.key
        msg.user_name = request_user.user_name
        msg.sender_name = request_user.first_name + ' ' + request_user.last_name
        msg.title = data['title']
        msg.put()
        request_user.sent_messages.insert(0, msg.key)
        future = request_user.put_async()
        add_message_to_users(msg, user_list)
        future.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='messages/get',
                      http_method='POST', name='messages.get')
    def get_messages(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        message_count = 30
        if request_user.new_messages:
            new_messages_future = Message.query(Message.key.IN(
                request_user.new_messages)).order(-Message.timestamp).fetch_async(40)
        if request_user.new_messages:
            if len(request_user.new_messages) >= 30:
                message_count = 0
            else:
                message_count = 30 - len(request_user.new_messages)
        if request_user.messages and message_count > 0:
            messages_future = Message.query(Message.key.IN(
                request_user.messages)).order(-Message.timestamp).fetch_async(message_count)
        if request_user.archived_messages:
            archived_messages_future = Message.query(Message.key.IN(
                request_user.archived_messages)).order(-Message.timestamp).fetch_async(30)
        out_messages = list()
        if request_user.new_messages:
            new_messages = new_messages_future.get_result()
            for msg in new_messages:
                note = msg.to_dict()
                note["new"] = True
                note["key"] = msg.key.urlsafe()
                out_messages.append(note)
        if request_user.messages and message_count > 0:
            messages = messages_future.get_result()
            for msg in messages:
                note = msg.to_dict()
                note["new"] = False
                note["key"] = msg.key.urlsafe()
                out_messages.append(note)
        out_archived_messages = list()
        if request_user.archived_messages:
            archived_messages = archived_messages_future.get_result()
            for msg in archived_messages:
                note = msg.to_dict()
                note["key"] = msg.key.urlsafe()
                out_archived_messages.append(note)
        out = {'messages': out_messages,
               'archived_messages': out_archived_messages,
               'messages_length': len(request_user.messages),
               'archived_messages_length': len(request_user.archived_messages),
               'new_messages_length': len(request_user.new_messages)}
        return OutgoingMessage(error='', data=json_dump(out))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='messages/read',
                      http_method='POST', name='messages.seen')
    def mark_message_read(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        key = ndb.Key(urlsafe=data["message"])
        if key in request_user.new_messages:
            request_user.new_messages.remove(key)
            request_user.messages.insert(0, key)
            request_user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='messages/more_archived',
                      http_method='POST', name='messages.more_archived')
    def more_archived(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        out_archived_messages = list()

        fetch_offset = data-2 if data-2 > 0 else data
        archived_messages_future = Message.query(Message.key.IN(
            request_user.archived_messages)).order(-Message.timestamp).fetch_async(data + 40, offset=fetch_offset)
        archived_messages = archived_messages_future.get_result()
        for msg in archived_messages:
            note = msg.to_dict()
            note["key"] = msg.key.urlsafe()
            out_archived_messages.insert(0, note)
        return OutgoingMessage(error='', data=json_dump(out_archived_messages))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='messages/more_messages',
                      http_method='POST', name='messages.more_messages')
    def more_messages(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        new_message_count = data.new_message_count
        read_message_count = data.read_message_count
        out_messages = list()
        msg_count = 40

        if request_user.new_messages:
            new_messages_to_get = len(request_user.new_messages) - data.new_message_count
            if new_messages_to_get > 0:
                new_messages_fetch_count = new_messages_to_get if new_messages_to_get <=40 else 40
                new_messages_future = Message.query(Message.key.IN(
                request_user.new_messages)).order(-Message.timestamp).fetch_async(new_messages_fetch_count, offset=new_message_count)
                if new_messages_fetch_count < 40:
                    msg_count = 40 - new_messages_fetch_count
            else:
                msg_count = 0
        if request_user.messages and msg_count > 0:
            messages_future = Message.query(Message.key.IN(
                request_user.messages)).order(-Message.timestamp).fetch_async(msg_count, offset=read_message_count)
        if request_user.new_messages and new_messages_to_get > 0:
            msgs = messages_future.get_result()
            for msg in msgs:
                note = msg.to_dict()
                note["key"] = msg.key.urlsafe()
                out_messages.append(note)
        if request_user.new_messages and msg_count > 0:
            msgs = new_messages_future.get_result()
            for msg in msgs:
                note = msg.to_dict()
                note["key"] = msg.key.urlsafe()
                note["new"] = True
                out_messages.append(note)
        return OutgoingMessage(error='', data=json_dump(out_messages))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='archive',
                      http_method='POST', name='messages.archive')
    def archive_messages(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        key = ndb.Key(urlsafe=data["message"])
        if key in request_user.messages:
            request_user.messages.remove(key)
            request_user.archived_messages.insert(0, key)
            request_user.put()
            return OutgoingMessage(error='', data='OK')
        if key in request_user.new_messages:
            request_user.new_messages.remove(key)
            request_user.archived_messages.insert(0, key)
            request_user.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error='', data='OK')


    @endpoints.method(IncomingMessage, OutgoingMessage, path='unarchive',
                      http_method='POST', name='message.unarchive')
    def unarchive_message(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        key = ndb.Key(urlsafe=data["message"])
        if key in request_user.archived_messages:
            request_user.archived_messages.remove(key)
            request_user.messages.insert(0, key)
            request_user.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error='NOTIFICATION_NOT_FOUND', data='')


    @endpoints.method(IncomingMessage, OutgoingMessage, path='delete',
                      http_method='POST', name='message.delete')
    def delete_message(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        data = json.loads(request.data)
        key = ndb.Key(urlsafe=data["message"])
        if key in request_user.sent_messages:
            futures = list()
            request_user.sent_messages.remove(key)
            futures.append(request_user.put_async())
            notified_users = User.query(User.messages == key).fetch_async()
            new_notified_users = User.query(User.new_messages == key).fetch_async()
            hidden_notified_users = User.query(User.archived_messages == key).fetch_async()
            users = notified_users.get_result()
            for user in users:
                user.messages.remove(key)
                futures.append(user.put_async())
            users_new = new_notified_users.get_result()
            for user in users_new:
                user.new_messages.remove(key)
                futures.append(user.put_async())
            users_hidden = hidden_notified_users.get_result()
            for user in users_hidden:
                user.archived_messages.remove(key)
                futures.append(user.put_async())
            futures.append(key.delete_async())
            for future in futures:
                future.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='recently_sent',
                      http_method='POST', name='messages.recently_sent')
    def recently_sent_messages(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not request_user.sent_messages:
            return OutgoingMessage(error='', data=json_dump(''))
        sent_messages = Message.query(Message.key.IN(request_user.sent_messages)).order(
                                                                    -Message.timestamp).fetch(30)
        out_message = list()
        for msg in sent_messages:
            note = msg.to_dict()
            note["key"] = msg.key.urlsafe()
            out_message.append(note)
        return OutgoingMessage(error='', data=json_dump(out_message))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='messages/update',
                      http_method='POST', name='messages.update')
    def update_messages(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        out_message = list()
        new_messages = list()
        if request_user.new_messages:
            new_messages = Message.query(Message.key.IN(request_user.new_messages)).order(-Message.timestamp).fetch(5)
        for msg in new_messages:
            note = msg.to_dict()
            note["key"] = msg.key.urlsafe()
            note["new"] = True
            out_message.append(note)
        return OutgoingMessage(error='', data=json_dump(out_message))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/get_tags',
                      http_method='POST', name='message.get_tags')
    def get_tags(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        org_tags_future = request_user.organization.get_async()
        event_tags_future = Event.query(Event.organization == request_user.organization).fetch_async()
        org_tags = org_tags_future.get_result().tags
        org_tags_list = list()
        for tag in request_user.recently_used_tags:
            if tag in org_tags:
                org_tags_list.append({"name": tag, "recent": True})
                org_tags.remove(tag)
            else:
                request_user.recently_used_tags.remove(tag)
        for tag in org_tags:
            org_tags_list.append({"name": tag, "recent": False})
        events = event_tags_future.get_result()
        event_tags_list = list()
        for event in events:
            event_tags_list.append({"name": event.tag})
        perm_tags_list = [{"name": COUNCIL}, {"name": LEADERSHIP}, {"name": EVERYONE}]
        return OutgoingMessage(error='', data=json_dump({'org_tags': org_tags_list,
                                                         'event_tags': event_tags_list,
                                                         'perms_tags': perm_tags_list}))