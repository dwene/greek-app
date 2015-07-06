__author__ = 'Derek'
from apiconfig import *


class PushFactory:
    @staticmethod
    def channel_send(content, users, type):
        logging.info("Pushing data to users")
        c_buffer = dict()
        c_buffer['content'] = content
        c_buffer['type'] = type
        c_buffer_length = 0
        tokens = list()
        for user in users:
            for token in user.channel_tokens:
                tokens.append(token)
                c_buffer_length += len(token)
            if c_buffer_length > 70000:
                c_buffer['tokens'] = tokens
                taskqueue.add(url="/tasks/channels/send/", params={'data': json_dump(c_buffer)})
                tokens = list()
        c_buffer['tokens'] = tokens
        taskqueue.add(url="/tasks/channels/send/", params={'data': json_dump(c_buffer)})
        return

    @staticmethod
    def ios_send(content, users, type, meta):
        c_buffer = dict()
        c_buffer['content'] = content
        c_buffer['type'] = type
        c_buffer['meta'] = meta
        c_buffer_length = 0
        tokens = list()
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