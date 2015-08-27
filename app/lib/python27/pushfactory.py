__author__ = 'Derek'
from apiconfig import *


class PushFactory:

    def __init__(self):
        return

    @staticmethod
    def send_notification_with_users(notification, users, sender):
        logging.info("Sending notification to users")
        logging.info(users)
        futures = list()
        user_list = list()
        for user in users:
            user.new_notifications.insert(0, notification.key)
            futures.append(user.put_async())
            user_list.append(user.key)
        sender_item = {'first_name': sender.first_name, 'last_name': sender.last_name, 'key': sender.key}
        notification_item = notification.to_dict()
        notification_item['sender'] = sender_item
        notification_item['key'] = notification.key
        data = {'notification': notification_item, 'users': user_list}
        update = Update()
        update.data = json_dump(data)
        update.timestamp = datetime.datetime.now()
        update.users = user_list
        taskqueue.add(url="/tasks/channels/send_notification/", params={'data': json_dump(data)})
        for future in futures:
            future.get_result()
        return

    @staticmethod
    def push_update(data, user_keys):
        out = {'data': data.to_dict(), 'users': user_keys}
        taskqueue.add(url="/tasks/channels/pushupdate/", params={'data': json_dump(out)})

    @staticmethod
    def send_notification_with_keys(notification, keys):
        data = {'notification': notification, 'users': keys}
        taskqueue.add(url="/tasks/channels/sendnotificationbykey/", params={'data': json_dump(data)})


    # @staticmethod
    # def channel_send(content, user_keys, type):
    #     logging.info("Pushing data to users")
    #     c_buffer = dict()
    #     c_buffer['content'] = content
    #     c_buffer['type'] = type
    #     c_buffer_length = 0
    #     tokens = list()
    #     User.query(User.key == user_keys).fetch(projection=[User.channel_tokens, User.iphone_tokens])
    #     users = ndb.get_multi(user_keys)
    #     for user in users:
    #         for token in user.channel_tokens:
    #             tokens.append(token)
    #             c_buffer_length += len(token)
    #         if c_buffer_length > 70000:
    #             c_buffer['tokens'] = tokens
    #             taskqueue.add(url="/tasks/channels/send/", params={'data': json_dump(c_buffer)})
    #             tokens = list()
    #     c_buffer['tokens'] = tokens
    #     taskqueue.add(url="/tasks/channels/send/", params={'data': json_dump(c_buffer)})
    #     return

    @staticmethod
    def ios_send(content, user_keys, type, meta):
        c_buffer = dict()
        c_buffer['content'] = content
        c_buffer['type'] = type
        c_buffer['meta'] = meta
        c_buffer_length = 0
        tokens = list()
        users = ndb.get_multi(user_keys)
        for user in users:
            for token in user.iphone_tokens:
                tokens.append(token)
                c_buffer_length += len(token)
            if c_buffer_length > 70000:
                c_buffer['tokens'] = tokens
                taskqueue.add("/tasks/ios/send", json_dump(c_buffer))
                tokens = list()
        c_buffer['tokens'] = tokens
        taskqueue.add("/tasks/ios/send", json_dump(c_buffer))


class LiveUpdate:

    type = None
    key = None
    data = None

    def __init__(self):
        return

    def to_dict(self):
        return {'type': self.type, 'key': self.key, 'data': self.data}
