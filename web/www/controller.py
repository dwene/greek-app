import sys
import endpoints
import logging
import datetime
import hashlib
import uuid
import braintree
from protorpc import messages
from protorpc import message_types
from protorpc import remote
from google.appengine.ext import ndb
import json
from ndbdatastore import *
from dateutil.relativedelta import relativedelta
import cloudstorage as gcs
from google.appengine.api import mail
from google.appengine.ext import blobstore
from google.appengine.api import images
import urllib
from google.appengine.api import urlfetch

braintree.Configuration.configure(braintree.Environment.Sandbox,
                                  merchant_id="b9hg6czg7dy9njgm",
                                  public_key="wy5t8dq5rbs9x53j",
                                  private_key="d71fe8c3b083f72653e0b9a6004ba9a6")

WEB_CLIENT_ID = 'greek-app'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
ANDROID_AUDIENCE = WEB_CLIENT_ID

# "Password Salt"
SALT = 'Mary had a little lamb, whose fleece was white as snow and everywhere that mary went the lamb was sure to go'
# error codes for returning errors
ERROR_BAD_ID = 'BAD_LOGIN'
BAD_FIRST_TOKEN = 'BAD_FIRST_TOKEN'
INVALID_FORMAT = 'INVALID_FORMAT'
TOKEN_EXPIRED = 'TOKEN_EXPIRED'
USERNAME_TAKEN = 'USERNAME_TAKEN'
INCORRECT_PERMS = 'INCORRECT_PERMISSIONS'
INFO_NOT_FILLED_OUT = 'EMPTY_INFO'
INVALID_EMAIL = 'INVALID_EMAIL'
INVALID_USERNAME = 'INVALID_USERNAME'
NOT_SUBSCRIBED = 'NOT_SUBSCRIBED'
TAG_INVALID = "TAG_INVALID"
DOMAIN = 'https://app.netegreek.com'
EVERYONE = 'everyone'
COUNCIL = 'council'
LEADERSHIP = 'leadership'
EXPIRE_TIME = 120 # Number of days until token expires


class IncomingMessage(messages.Message):
    user_name = messages.StringField(1)
    token = messages.StringField(2)
    data = messages.StringField(3)


class OutgoingMessage(messages.Message):
    error = messages.StringField(1)
    data = messages.StringField(2)


# class CST(datetime.tzinfo):
#     def utcoffset(self, dt):
#         return datetime.timedelta(hours=-5)
#
#     def dst(self, dt):
#         return datetime.timedelta(0)


class DateEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ndb.Key):
            return obj.urlsafe()
        elif hasattr(obj, 'isoformat'):
            return obj.isoformat()
        elif isinstance(obj, ndb.BlobKey):
            return images.get_serving_url(obj, secure_url=True)
        else:
            return json.JSONEncoder.default(self, obj)


def CreateFile(filename, data):
    # Create a GCS file with GCS client.
    with gcs.open(filename, 'w') as f:
        f.write(data)

    # Blobstore API requires extra /gs to distinguish against blobstore files.
    blobstore_filename = '/gs' + filename
    # This blob_key works with blobstore APIs that do not expect a
    # corresponding BlobInfo in datastore.
    return blobstore.create_gs_key(blobstore_filename)



def member_signup_email(user, token):
    signup_link = DOMAIN+'/#/newuser/'+token
    subject = "Registration for NeteGreek App!"
    body = "Hello!\n"
    body += "Your account has been created! To finish setting up your NeteGreek account please follow the link below.\n"
    body += signup_link + "\n\n -NeteGreek Team"
    message = dict()
    message["text"] = body
    message["subject"] = subject
    message["from_email"] = 'support@netegreek.com'
    message["from_name"] = 'NeteGreek'
    message["to"] = user['email']
    return message

# type = ndb.StringProperty()
# pending = ndb.BooleanProperty(default=True)
# email = ndb.StringProperty()
# content = ndb.TextProperty()
# title = ndb.StringProperty()
# timestamp = ndb.DateTimeProperty(default=datetime.datetime.now())


def test_directory():
    time1 = datetime.datetime.now()
    # agtzfmdyZWVrLWFwcHIZCxIMT3JnYW5pemF0aW9uGICAgICF2JcKDA
    organization = ndb.Key(urlsafe = "agtzfmdyZWVrLWFwcHIZCxIMT3JnYW5pemF0aW9uGICAgICF2JcKDA")
    organization_users_future = User.query(User.organization == organization).fetch_async()
    event_list_future = Event.query(Event.organization == organization,
                                    ).fetch_async(projection=[Event.going, Event.tag])
    time3 = datetime.datetime.now()
    organization_users = organization_users_future.get_result()
    time4 = datetime.datetime.now()
    event_list = event_list_future.get_result()
    time5 = datetime.datetime.now()
    user_list = list()
    alumni_list = list()
    for user in organization_users:
        user_dict = user.to_dict()
        del user_dict["hash_pass"]
        del user_dict["current_token"]
        del user_dict["organization"]
        del user_dict["timestamp"]
        del user_dict["notifications"]
        del user_dict["new_notifications"]
        del user_dict["hidden_notifications"]
        event_tags = list()
        for event in event_list:
            if user.key in event.going:
                event_tags.append(event.tag)
        user_dict["event_tags"] = event_tags
        user_dict["key"] = user.key.urlsafe()
        if user.dob:
            user_dict["dob"] = user.dob.strftime("%m/%d/%Y")
        else:
            del user_dict["dob"]
        user_dict["key"] = user.key.urlsafe()
        if user_dict["perms"] == 'alumni':
            alumni_list.append(user_dict)
        else:
            user_list.append(user_dict)
    return_data = json_dump({'members': user_list, 'alumni': alumni_list})
    time6 = datetime.datetime.now()
    print time6 - time1



def add_notification_to_users(notification, users):
    future_list = list()
    for user in users:
        # if not user.email_prefs:
        #     logging.error(user)
        # elif user.email_prefs == 'all':
        #     body = notification.content
        #     if notification.type =='event':
        #         body = '\n\n To see this event please visit: ' + DOMAIN + notification.link
        #     elif notification.type == 'poll':
        #         body += '\n\n To see this poll please visit: ' + DOMAIN + notification.link
        #     if not email_prefs == False:
        #         future_list.append(CronEmail(type='notification', pending=True, email=user.email,
        #                                     title=notification.title,
        #                                     content=body).put_async())
        user.new_notifications.insert(0, notification.key)
        future_list.append(user.put_async())
    for item in future_list:
        item.get_result()
    return



def add_message_to_users(msg, users):
    future_list = list()
    for user in users:
        future_list.append(CronEmail(pending=True, email=user.email,
                                            title=msg.title,
                                            content=msg.content).put_async())
        user.new_messages.insert(0, msg.key)
        future_list.append(user.put_async())
    for item in future_list:
        item.get_result()
    return


def alumni_signup_email(user, organization_key, token):
    # to_email = [{'email': user['email'], 'type': 'to'}]
    org = organization_key.get()
    user['token'] = token
    signup_link = DOMAIN+'/#/newuser/'+token
    subject = "Registration for NeteGreek App!"
    body = "Hello!\n"
    body += org.name + " at " + org.school + " has requested to add you to their database of alumni. If you would like" \
                                             " to add yourself please go to the following link\n"
    body += signup_link + "\n\n -NeteGreek Team"
    message = dict()
    message["text"] = body
    message["subject"] = subject
    message["from_email"] = 'support@netegreek.com'
    message["from_name"] = 'NeteGreek'
    message["to"] = user['email']
    return message


def send_mandrill_email(from_email, to_email, subject, body, html):
    to_send = dict()
    email_out = [{'email': to_email, 'type': 'to'}]
    to_send["key"] = 'y8EslL_LZDf4__hJZbbMAQ'
    message = dict()
    message["text"] = body
    message["html"] = html
    message["subject"] = subject
    message["from_email"] = from_email
    message["from_name"] = 'NeteGreek'
    message["to"] = email_out
    to_send["message"] = message
    json_data = json.dumps(to_send)
    result = urlfetch.fetch(url='https://mandrillapp.com/api/1.0/messages/send.json',
                            payload=json_data,
                            method=urlfetch.POST,
                            headers={'Content-Type': 'application/json'})
    return


def send_email(from_email, to_email, subject, body):
    footer = 'If you believe you are receiving this email in error, please email support@netegreek.com'
    html_title = """<h1 style="text-align: center;font-family:sans-serif;color:#000">""" + subject.replace('\n', '<br/>') + """</h1>"""
    html_body = """<p style="text-align: left;font-family:sans-serif;color: #000">""" + body.replace('\n', '<br/>') + """</p>"""
    full_body = body + '\n\n' + footer
    html_full = HTML_EMAIL_1 + html_title + html_body + HTML_EMAIL_2
    try:
        mail.send_mail(from_email, to_email, subject, full_body, html=html_full)
    except:
        send_mandrill_email(from_email, to_email, subject, full_body, html_full)


def removal_email(user):
    subject = 'Removal from NeteGreek App'
    body = "Hello\n"
    body += "This if a notice that you have been removed from the organization '" + user.organization.get().name
    body += "' Please email your NeteGreek administrators for more information\n"
    body += "Have a great day\n\n"
    body += "NeteGreek Team"
    CronEmail(type='member_removal', title=subject, content=body, email=user.email,
              pending=True, timestamp=datetime.datetime.now()).put()


def forgotten_password_email(user):
    to_email = user.email
    from_email = 'NeteGreek <support@netegreek.com>'
    subject = 'NeteGreek Password Reset'
    token = generate_token() + user.user_name
    user.current_token = token
    user.put()
    link = DOMAIN+ '/#/changepasswordfromtoken/'+token
    body = 'Hello\n\n'
    body += 'Please follow the link to reset your password for the NeteGreek app.\n' + link + '\nHave a great day!\nNeteGreek Team'
    send_email(from_email, to_email, subject, body)


def check_form_status(user):
    if user:
        if user.address and user.state and user.dob and user.city and user.major:
            return True
        return False


def json_dump(item):
    return json.dumps(item, cls=DateEncoder)


# def wait_for_replies(rpcs):
#     error = list()
#     sent = list()
#     for item in rpcs:
#         try:
#             result = item['rpc'].get_result()
#             contents = json.loads(result.content)
#             logging.error(contents)
#             for content in contents:
#                 if content['status'] == 'error':
#                     error.append(item['user'])
#                     logging.error('Im being added to error list')
#                 else:
#                     sent.append(item['user'])
#                     logging.error('Im being added to sent list')
#         except:
#             error.append(item['user'])
#     return {'errors': error, 'sent': sent}


# Use a helper function to define the scope of the callback.


def check_if_info_set(key):
    return True

def check_availability_of_tag(tag, org_key):
    organization_future = org_key.get_async()
    event_future = Event.query(ndb.AND(Event.organization == org_key,
                                       Event.tag == tag.lower())).get_async()
    organization = organization_future.get_result()
    if tag.lower() in organization.tags:
        return False
    if event_future.get_result():
        return False
    if tag.lower() in ['alumni', 'member', 'council', 'leadership', 'everyone']:
        return False
    return True


def get_user(user_name, token):
    user = User.query(User.user_name == user_name).get()
    if not user:
        return None
    if user.timestamp:
        dt = (datetime.datetime.now() - user.timestamp)
        if user.current_token == token and dt.days < EXPIRE_TIME:
            return user
    return None


def username_available(user_name):
    if User.query(User.user_name == user_name.lower()).get():
        return False
    elif len(user_name) < 5:
        return False
    else:
        return True


def generate_token():
    return str(uuid.uuid4())


def get_key_from_token(token):
    user = User.query().filter(User.current_token == token).get()
    if user:
        return user.key
    return 0


def get_users_from_tags(tags, organization, keys_only):
    # org_tag_users = list()
    # event_tag_users = list()
    # perms_tag_users = list()
    out_list = list()
    _keys_only = False
    if keys_only:
        _keys_only = True
    if "org_tags" in tags and len(tags["org_tags"]):
        org_tag_users_future = User.query(ndb.AND(User.tags.IN(tags["org_tags"]),
                                                  User.organization == organization)).fetch_async(keys_only=True)
    if "perms_tags" in tags and len(tags["perms_tags"]):
        if "everyone" in tags["perms_tags"]:
            perms_tag_users_future = User.query(ndb.AND(User.perms.IN(['member', 'leadership', 'council']),
                                                        User.organization == organization)).fetch_async(keys_only=True)
        else:
            perms_tag_users_future = User.query(ndb.AND(User.perms.IN(tags["perms_tags"]),
                                                        User.organization == organization)).fetch_async(keys_only=True)
    if "event_tags" in tags and len(tags["event_tags"]):
        events_future = Event.query(ndb.AND(Event.tag.IN(tags["event_tags"]),
                                            Event.organization == organization)).fetch_async(projection=[Event.going])
    if "org_tags" in tags and len(tags["org_tags"]):
        org_tag_users = org_tag_users_future.get_result()
        out_list = out_list + list(set(org_tag_users) - set(out_list))

    if "perms_tags" in tags and len(tags["perms_tags"]):
        perms_tag_users = perms_tag_users_future.get_result()
        out_list = out_list + list(set(perms_tag_users) - set(out_list))

    if "event_tags" in tags and len(tags["event_tags"]):
        events = events_future.get_result()
        users = list()
        for event in events:
            users = users + list(set(event.going) - set(out_list))
        out_list = out_list + list(set(users) - set(out_list))

    if not _keys_only:
        out_list = ndb.get_multi(out_list)
    return out_list


def check_if_user_in_tags(user, perms_tags, org_tags, event_tags):
    if user.perms in perms_tags or 'everyone' in perms_tags:
        return True
    elif len(frozenset(user.tags).intersection(org_tags)) > 0:
        return True
    else:
        user_event_tags = Event.query(Event.going == user.key).fetch(projection=[Event.tag])
        if len(frozenset(user_event_tags).intersection(event_tags)) > 0:
            return True
    return False





@endpoints.api(name='netegreek', version='v2', allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE])
class RESTApi2(remote.Service):

    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/send_message',
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
        request_user.sent_messages.insert(0, notification.key)
        future = request_user.put_async()
        add_message_to_users(notification, user_list, True)
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='messages/archive',
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


    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/unarchive',
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


    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/delete',
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='messages/recently_sent',
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




    @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/get',
                      http_method='POST', name='notifications.get')
    def get_notifications(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        notification_count = 30
        if request_user.new_notifications:
            new_notification_future = Notification.query(Notification.key.IN(
                request_user.new_notifications)).order(-Notification.timestamp).fetch_async(30)
        if request_user.new_notifications:
            if len(request_user.new_notifications) >= 30:
                notification_count = 0
            else:
                notification_count = 30 - len(request_user.new_notifications)
        if request_user.notifications and notification_count > 0:
            notifications_future = Notification.query(Notification.key.IN(
                request_user.notifications)).order(-Notification.timestamp).fetch_async(notification_count)
        out_notifications = list()
        if request_user.new_notifications:
            new_notifications = new_notification_future.get_result()
            for notify in new_notifications:
                note = notify.to_dict()
                note["new"] = True
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        if request_user.notifications and notification_count > 0:
            notifications = notifications_future.get_result()
            for notify in notifications:
                note = notify.to_dict()
                note["new"] = False
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        return OutgoingMessage(error='', data=json_dump(out_notifications))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/read',
                      http_method='POST', name='notifications.read')
    def see_notification(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        for key in request_user.new_notifications:
            request_user.new_notifications.remove(key)
            request_user.notifications.insert(0, key)
            request_user.put()
        return OutgoingMessage(error='', data='OK')














@endpoints.api(name='netegreek', version='v1', allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE])
class RESTApi(remote.Service):

    @endpoints.method(IncomingMessage, OutgoingMessage, path='braintree/test',
                      http_method='POST', name='auth.braintree')
    def braintree(self, request):

        result = braintree.Transaction.sale({
            "amount": "100000.00",
            "credit_card": {
                "number": "4111111111111111",
                "expiration_month": "05",
                "expiration_year": "2020"
            }
        })
        if result.is_success:
            out = "success!: " + result.transaction.id
        elif result.transaction:
            out = "Error processing transaction:"
            out += "  message: " + result.message
            out += "  code:    " + result.transaction.processor_response_code
            out += "  text:    " + result.transaction.processor_response_text
        else:
            out = "message: " + result.message
            for error in result.errors.deep_errors:
                out += "attribute: " + error.attribute
                out += "  code: " + error.code
                out += "  message: " + error.message
        return OutgoingMessage(error='', data=json_dump(out))


    @endpoints.method(IncomingMessage, OutgoingMessage, path='braintree/test_subscription',
                      http_method='POST', name='auth.braintree_subscription')
    def braintree_subscription(self, request):
        out = ''
        out2 = ''
        result = braintree.Customer.create({
            "first_name": 'Derek',
            "last_name": 'Wene',
            "credit_card": {
                "number": "4111111111111111",
                "expiration_month": "05",
                "expiration_year": "2020",
                "cvv": '000'
            }
        })
        if result.is_success:
            customer = braintree.Customer.find(result.customer.id)
            payment_method_token = customer.credit_cards[0].token
            result2 = braintree.Subscription.create({
            "payment_method_token": payment_method_token,
            "plan_id": "normal_monthly_plan"
            })
            if result2.is_success:
                return OutgoingMessage(error='', data='OK')
        else:
            out = "message: " + result.message
            for error in result.errors.deep_errors:
                out += "attribute: " + error.attribute
                out += "  code: " + error.code
                out += "  message: " + error.message
        return OutgoingMessage(error='', data=json_dump([out, out2]))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='braintree/test_update_subscription',
                      http_method='POST', name='auth.test_update_subscription')
    def test_update_subscription(self, request):

        #org = Organization.query(Organization.name == 'testorg123').get()
        #subscription = braintree.Subscription.find(org.subscription_id)
        result = braintree.Subscription.update('g23762', {
            "price": "14.00"
        })
        if result.is_success:
            return OutgoingMessage(error='', data='OK')
        else:
            return OutgoingMessage(error='Something wrong..', data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='pay/subscribe',
                      http_method='POST', name='pay.subscribe')
    def subscribe(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        organization = request_user.organization.get()
        data = json.loads(request.data)
        if not organization.customer_id and not organization.subscription_id:
            customer_result = braintree.Customer.create({
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "credit_card": {
                    "number": data["number"],
                    "expiration_month": data["exp_month"],
                    "expiration_year": data["exp_year"],
                    "cvv": data["cvv"],
                    "options": {
                        "verify_card": True
                    }
                }
            })
            if not customer_result.is_success:
                return OutgoingMessage(error='INVALID_CARD', data=customer_result.message)
            organization.customer_id = customer_result.customer.id
            organization.payment_token = customer_result.customer.credit_cards[0].token
        elif not organization.subscription_id and len(data) > 0:
            card_result = braintree.CreditCard.create({
                "customer_id": organization.customer_id,
                "number": data["number"],
                "expiration_month": data["exp_month"],
                "expiration_year": data["exp_year"],
                "cvv": data["cvv"],
                "options": {
                    "verify_card": True
                }
            })
            if card_result.is_success:
                organization.payment_token = card_result.credit_card.token
            else:
                OutgoingMessage(error='CARD_ERROR', data=card_result.message)
        if organization.trial_period:
            subscription_result = braintree.Subscription.create({
                "payment_method_token": organization.payment_token,
                "plan_id": "normal_monthly_plan"
            })
        else:
            user_count = len(User.query(User.organization == request_user.organization).fetch(projection=
                                                                                              [User.first_name]))
            if not organization.cancel_subscription:
                subscription_result = braintree.Subscription.create({
                    "payment_method_token": organization.payment_token,
                    "plan_id": "normal_monthly_plan",
                    "trial_period": False,
                    "price": str(float(user_count) * float(organization.cost))
                })
            else:
                subscription_result = braintree.Subscription.create({
                    "payment_method_token": organization.payment_token,
                    "plan_id": "normal_monthly_plan",
                    "trial_period": False,
                    "first_billing_date": organization.cancel_subscription,
                    "price": str(float(user_count) * float(organization.cost))
                })
            if not subscription_result.is_success:
                organization.put()
            return OutgoingMessage(error='SUBSCRIPTION_ERROR', data=subscription_result.message)
        organization.subscription_id = subscription_result.subscription.id
        organization.subscribed = True
        organization.trial_period = False
        organization.cancel_subscription = None
        organization.put()
        return OutgoingMessage(error='', data='OK')


    @endpoints.method(IncomingMessage, OutgoingMessage, path='pay/change_card_number',
                      http_method='POST', name='pay.change_card_number')
    def change_card_number(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        organization = request_user.organization.get()
        if not organization.customer_id:
            return OutgoingMessage(error=NOT_SUBSCRIBED)

        data = json.loads(request.data)
        if not organization.customer_id and not organization.subscription_id:
            card_result = braintree.CreditCard.create({
                "customer_id": organization.customer_id,
                "number": data["number"],
                "expiration_month": data["exp_month"],
                "expiration_year": data["exp_year"],
                "cvv": data["cvv"],
                "options": {
                    "verify_card": True
                }
            })
            if not card_result.is_success:
                return OutgoingMessage(error='INVALID CARD', data=card_result.message)

            subscription_result = braintree.Subscription.update(organization.subscription_id,{
                "payment_method_token": card_result.credit_card.token,
            })
            if not subscription_result.is_success:
                organization.put()
                return OutgoingMessage(error='SUBSCRIPTION_ERROR', data=subscription_result.message)
            organization.payment_token = card_result.credit_card.token
            organization.subscription_id = subscription_result.subscription.id
            organization.put()
            return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='pay/subscription_info',
                      http_method='POST', name='pay.subscription_info')
    def subscription_info(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        organization = request_user.organization.get()
        message = dict()
        if organization.subscription_id:
            subscription = braintree.Subscription.find(organization.subscription_id)
            message["paid_through_date"] = subscription.paid_through_date
            message["subscription_price"] = str(subscription.price)
            message["next_billing_date"] = subscription.next_billing_date
        else:
            message["no_subscription"] = True
            message["premium_end"] = organization.cancel_subscription
        if organization.payment_token:
            credit_card = braintree.CreditCard.find(organization.payment_token)
            card = dict()
            card["masked_number"] = credit_card.masked_number
            card["expiration"] = credit_card.expiration_date
            card["cardholder_name"] = credit_card.cardholder_name
            card["image_url"] = credit_card.image_url
            message["credit_card"] = card
        return OutgoingMessage(error='', data=json_dump(message))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='pay/cancel_subscription',
                      http_method='POST', name='pay.cancel_subscription')
    def cancel_subscription(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        organization = request_user.organization.get()
        if not organization.customer_id:
            return OutgoingMessage(error=NOT_SUBSCRIBED)
        subscription = braintree.Subscription.find(organization.subscription_id)
        if subscription:
            organization.cancel_subscription = subscription.next_billing_date
        result = braintree.Subscription.cancel(organization.subscription_id)
        if result.is_success:
            organization.subscription_id = ''
            organization.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error='SUBSCRIPTION_CANCELLATION_FAIL', data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='pay/is_subscribed',
                      http_method='POST', name='pay.is_subscribed')
    def is_subscribed(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization = request_user.organization.get()
        return OutgoingMessage(error='', data=json_dump(True))

    # USER REQUESTS

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/register_organization',
                      http_method='POST', name='auth.register_organization')
    def register_organization(self, request):
        # try:
        clump = json.loads(request.data)
        new_org = Organization(name=clump['organization']['name'], school=clump['organization']['school'], type=clump['organization']['type'])
        new_org.put()
        user = clump['user']
        if username_available(user['user_name'].lower()):
            new_user = User(user_name=user['user_name'].lower())
        else:
            return OutgoingMessage(error=USERNAME_TAKEN, data='')
        new_user.hash_pass = hashlib.sha224(user['password'] + SALT).hexdigest()
        new_user.first_name = user['first_name']
        new_user.last_name = user['last_name']
        new_user.email = user['email']
        new_user.organization = new_org.key
        new_user.perms = 'council'
        new_user.current_token = generate_token()
        new_user.class_year = int(user['class_year'])
        new_user.timestamp = datetime.datetime.now()
        new_user.put()
        content = 'New Organization Registered\nName: ' + new_org.name + '\nSchool: ' + new_org.school
        content += '\nCreator: ' + new_user.first_name + ' ' + new_user.last_name + '\nEmail: ' + new_user.email
        content += '\nUser Name: ' + new_user.user_name
        send_email('NeteGreek <support@netegreek.com>', 'support@netegreek.com', 'New Organization Registered', content)
        return OutgoingMessage(error='', data=json_dump({'token': new_user.current_token, 'perms': new_user.perms, 'me': new_user.to_dict(),
                                                         'expires': new_user.timestamp+datetime.timedelta(days=EXPIRE_TIME)}))
        # except:
        #     return OutgoingMessage(error=INVALID_FORMAT + ": " + str(request.data))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='organization/info',
                      http_method='POST', name='auth.organization_info')
    def organization_info(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization = request_user.organization.get()
        out = dict(name=organization.name, school=organization.school)
        out["subscribed"] = organization.subscribed
        out["color"] = organization.color
        out["link_groups"] = organization.link_groups
        try:
            out["image"] = images.get_serving_url(organization.image, secure_url=True)
        except:
            out["image"] = ''
        return OutgoingMessage(error='', data=json_dump(out))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/check_login',
                      http_method='POST', name='user.check_login')
    def check_login(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        return OutgoingMessage(error='', data='OK')


    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/report_error',
                      http_method='POST', name='user.report_error')
    def report_error(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        message = json.loads(request.data)
        email = 'support@netegreek.com'
        content = 'User: '+request_user.first_name+' '+request_user.last_name + '\n'
        content += '\t key: ' + request_user.key.urlsafe() + '\n'
        content += '\n\nContent: '+message
        content += '\nEmail: '+request_user.email+'\n\nThis has been auto-generated by app.netegreek.com'
        title = 'Report from ' + request_user.user_name
        send_email('NeteGreek <support@netegreek.com>', email, title, content)
        return OutgoingMessage(error='', data='OK')


    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/find_unregistered_users',
                      http_method='POST', name='auth.find_unregistered_users')
    def find_unregistered_users(self, request):
        clump = json.loads(request.data)
        users = User.query(User.email == clump['email']).fetch()
        user_list = list()
        org_list = list()
        for user in users:
            if not user.user_name:
                user_list.append({'first_name': user.first_name, 'last_name': user.last_name,
                                  'email': user.email, 'organization': user.organization, 'key': user.key})
                if user.organization not in org_list:
                    org_list.append(user.organization)
        if len(org_list) > 0:
            orgs = ndb.get_multi(org_list)
            for user in user_list:
                for org in orgs:
                    if user['organization'] == org.key:
                        user['org_name'] = org.name
                        user['school'] = org.school
                        break
        return OutgoingMessage(error='', data=json_dump(user_list))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/resend_registration_email',
                      http_method='POST', name='auth.resend_registration_email')
    def resend_registration_email(self, request):
        user = ndb.Key(urlsafe=json.loads(request.data)['key']).get()
        if user:
            if user.perms == 'alumni':
                email_item = alumni_signup_email(user.to_dict(), user.organization, user.current_token)
            else:
                email_item = member_signup_email(user.to_dict(), user.current_token)
            send_email('NeteGreek <support@netegreek.com>', email_item["to"], email_item["subject"], email_item["text"])
            return OutgoingMessage(error='', data='')
        else:
            return OutgoingMessage(error=INVALID_USERNAME, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/login',
                      http_method='POST', name='auth.login')
    def login(self, request):
        clump = json.loads(request.data)
        user_name = clump['user_name'].lower()
        password = clump['password']
        user = User.query(User.user_name == user_name).get()
        if user and user.hash_pass == hashlib.sha224(password + SALT).hexdigest():
            dt = ((user.timestamp + datetime.timedelta(days=EXPIRE_TIME)) - datetime.datetime.now())
            if dt.seconds/60/60 < 2:
                user.current_token = generate_token()
            user.timestamp = datetime.datetime.now()
            user.put()
            me = user.to_dict()
            del me["hash_pass"]
            del me["current_token"]
            del me["organization"]
            del me["timestamp"]
            del me["notifications"]
            del me["new_notifications"]
            del me["messages"]
            del me["new_messages"]
            del me["archived_messages"]
            return_item = {'token': user.current_token, 'perms': user.perms, 'expires': user.timestamp +
                                                                             datetime.timedelta(days=EXPIRE_TIME), 'me': me}
            return OutgoingMessage(data=json_dump(return_item), error='')
        return OutgoingMessage(error=ERROR_BAD_ID, data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/token_login',
                      http_method='POST', name='auth.token_login')
    def token_login(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        user = request_user.user_name;
        token = request_user.current_token;
        me = request_user.to_dict();
        del me["hash_pass"]
        del me["current_token"]
        del me["organization"]
        del me["timestamp"]
        del me["notifications"]
        del me["new_notifications"]
        del me["messages"]
        del me["new_messages"]
        del me["archived_messages"]
        to_send = json_dump({'user_name':user, 'token': token, 'me': me})
        return OutgoingMessage(error='', data=to_send)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/add_users',
                      http_method='POST', name='auth.add_users')
    def add_users(self, request):

        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        clump = json.loads(request.data)
        futures = list()
        for user in clump['users']:
            token = generate_token()
            email_item = member_signup_email(user, token)
            cron_email = CronEmail()
            cron_email.title = email_item["subject"]
            cron_email.content = email_item["text"]
            cron_email.email = email_item["to"]
            cron_email.type = 'new_member'
            cron_email.pending = True
            futures.append(cron_email.put_async())
            new_user = User()
            new_user.email = user['email']
            new_user.current_token = token
            new_user.organization = request_user.organization
            new_user.user_name = ''
            new_user.first_name = user['first_name']
            new_user.last_name = user['last_name']
            if 'pledge_class_year' in user:
                new_user.pledge_class_year = int(user['pledge_class_year'])
            if 'pledge_class_semester' in user:
                new_user.pledge_class_semester = user['pledge_class_semester'].lower()
            new_user.perms = 'member'
            user['future'] = new_user.put_async()
        new_users = list()
        for user in clump['users']:
            new_users.append(user['future'].get_result().get_async())
        return_users = list()
        for user in new_users:
            added_user = user.get_result()
            user_dict = added_user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            del user_dict["timestamp"]
            del user_dict["notifications"]
            del user_dict["new_notifications"]
            del user_dict["messages"]
            del user_dict["new_messages"]
            del user_dict["archived_messages"]
            user_dict["key"] = added_user.key.urlsafe()
            return_users.append(user_dict)
        return OutgoingMessage(error='', data=json_dump(return_users))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/add_alumni',
                      http_method='POST', name='auth.add_alumni')
    def add_alumni(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        clump = json.loads(request.data)
        futures = list()
        for user in clump['users']:
            token = generate_token()
            email_item = alumni_signup_email(user, request_user.organization, token)
            cron_email = CronEmail()
            cron_email.title = email_item["subject"]
            cron_email.content = email_item["text"]
            cron_email.email = email_item["to"]
            cron_email.type = 'new_alumni'
            cron_email.pending = True
            futures.append(cron_email.put_async())
            new_user = User()
            new_user.email = user['email']
            new_user.organization = request_user.organization
            new_user.user_name = ''
            new_user.current_token = token
            if 'first_name' in user:
                new_user.first_name = user['first_name']
            if 'last_name' in user:
                new_user.last_name = user['last_name']
            if 'pledge_class_semester' in user:
                new_user.pledge_class_semester = user['pledge_class_semester'].lower()
            if 'pledge_class_year' in user:
                new_user.pledge_class_year = int(user['pledge_class_year'])
            new_user.perms = 'alumni'
            futures.append(new_user.put_async())
            futures_2 = list()
        for future in futures:
            futures2.append(future.get_result().get_async())
        return_users = list()
        for future in futures2:
            user = future.get_result()
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            del user_dict["timestamp"]
            del user_dict["notifications"]
            del user_dict["new_notifications"]
            del user_dict["messages"]
            del user_dict["new_messages"]
            del user_dict["archived_messages"]
            user_dict["key"] = added_user.key.urlsafe()
            return_users.append(user_dict)
        return OutgoingMessage(error='', data=json_dump(return_users))


        # for user in clump['users']:
        #     email_item = alumni_signup_email(user, request_user)
        #     rpc = urlfetch.create_rpc()
        #     urlfetch.make_fetch_call(rpc=rpc,
        #                              url='https://mandrillapp.com/api/1.0/messages/send.json',
        #                              payload=email_item['json_data'],
        #                              method=urlfetch.POST,
        #                              headers={'Content-Type': 'application/json'})
        #     rpcs.append({'rpc': rpc, 'user': email_item['user']})
        # rpc_data = wait_for_replies(rpcs)
        #
        # for user in rpc_data['sent']:
        #     new_user = User()
        #     new_user.email = user['email']
        #     if 'first_name' in user:
        #         new_user.first_name = user['first_name']
        #     if 'last_name' in user:
        #         new_user.last_name = user['last_name']
        #     new_user.organization = request_user.organization
        #     new_user.user_name = ''
        #     new_user.current_token = user['token']
        #     new_user.perms = 'alumni'
        #     new_user.put()
        #
        # to_send = json_dump({'errors': rpc_data['errors']})
        # return OutgoingMessage(error='', data='OK')

    # @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/get_users',
    #                   http_method='POST', name='auth.get_users')
    # def get_users(self, request):
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
    #         return OutgoingMessage(error=INCORRECT_PERMS)
    #     event_list_future = Event.query(ndb.AND(Event.organization == request_user.organization,
    #                                     Event.time_end < datetime.datetime.today() +
    #                                     relativedelta(months=1))).fetch_async(projection=[Event.going, Event.tag])
    #     organization_users_future = User.query(User.organization == request_user.organization).fetch_async()
    #     organization_users = organization_users_future.get_result()
    #     event_list = event_list_future.get_result()
    #     user_list = list()
    #     alumni_list = list()
    #     return_object = ''
    #     for user in organization_users:
    #         user_dict = user.to_dict()
    #         del user_dict["hash_pass"]
    #         del user_dict["current_token"]
    #         del user_dict["organization"]
    #         del user_dict["timestamp"]
    #         del user_dict["prof_pic"]
    #         event_tags = list()
    #         for event in event_list:
    #             if user.key in event.going:
    #                 event_tags.append(event.tag)
    #         del user_dict["recently_used_tags"]
    #         user_dict["event_tags"] = event_tags
    #         user_dict["key"] = user.key.urlsafe()
    #         if user_dict["perms"] == 'alumni':
    #             alumni_list.append(user_dict)
    #         else:
    #             user_list.append(user_dict)
    #         return_object = json_dump({'members': user_list, 'alumni': alumni_list})
    #     return OutgoingMessage(error='', data=return_object)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/remove_user',
                      http_method='POST', name='auth.remove_user')
    def remove_user(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        user_info = json.loads(request.data)
        user_to_remove = ndb.Key(urlsafe=user_info["key"]).get()
        if user_to_remove:
            # removal_email(user_to_remove)
            logging.error('Removing user:' + user_info["key"])
            user_to_remove.key.delete()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=INVALID_USERNAME, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/new_user',
                      http_method='POST', name='auth.new_user')
    def register_user(self, request):
        user = User.query(User.current_token == request.token).get()
        if user and user.user_name == '':
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            return OutgoingMessage(error='', data=json_dump(user_dict))
        return OutgoingMessage(error=BAD_FIRST_TOKEN, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/register_credentials',
                      http_method='POST', name='auth.register_credentials')
    def register_credentials(self, request):
        data = json.loads(request.data)
        user = User.query(User.current_token == request.token).get()
        if user and user.user_name == '':
            if not username_available(data["user_name"].lower()):
                return OutgoingMessage(error='INVALID_USERNAME')
            if not len(data["password"]) >= 6:
                return OutgoingMessage(error='INVALID_PASSWORD')
            user.user_name = data["user_name"].lower()
            user.hash_pass = hashlib.sha224(data["password"] + SALT).hexdigest()
            user.current_token = generate_token()
            user.timestamp = datetime.datetime.now()
            user.put()
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            return OutgoingMessage(error='' ,data=json_dump({'token': user.current_token, 'perms': user.perms, 'me': user_dict}))
        return OutgoingMessage(error=ERROR_BAD_ID, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/check_username',
                      http_method='POST', name='user.check_username')
    def check_username(self, request):
        if username_available(json.loads(request.data)):
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=USERNAME_TAKEN, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/get_user_directory_info',
                      http_method='POST', name='user.get_user_directory_info')
    def get_user_directory_info(self, request):

        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        user_dict = request_user.to_dict()
        del user_dict["hash_pass"]
        del user_dict["current_token"]
        del user_dict["organization"]
        del user_dict["timestamp"]
        del user_dict["notifications"]
        del user_dict["new_notifications"]
        del user_dict["events"]
        if user_dict["dob"]:
            user_dict["dob"] = request_user.dob.strftime("%m/%d/%Y")
        if not user_dict["user_name"]:
            user_dict["has_registered"] = True
        else:
            user_dict["has_registered"] = False
        try:
            user_dict["prof_pic"] = images.get_serving_url(request_user.prof_pic, secure_url=True)
        except:
            del user_dict["prof_pic"]
        return OutgoingMessage(error='', data=json_dump(user_dict))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/manage_perms',
                      http_method='POST', name='user.manage_perms')
    def manage_perms(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        user = ndb.Key(urlsafe=request_object["key"]).get()
        if not user:
            return OutgoingMessage(error=INVALID_USERNAME, data='')
        if request_object["perms"] not in ["leadership", "council", "member"]:
            return OutgoingMessage(error=INVALID_FORMAT, data='')
        user.perms = request_object["perms"]
        user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/users_emails',
                      http_method='POST', name='user.manage_users_emails')
    def manage_users_emails(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        user = ndb.Key(urlsafe=request_object["key"]).get()
        if not user:
            return OutgoingMessage(error=INVALID_USERNAME, data='')
        user.email = request_object["email"]
        user.put()
        return OutgoingMessage(error='', data='OK')    

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/convert_to_alumni',
                      http_method='POST', name='user.convert_to_alumni')
    def convert_to_alumni(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        for key in request_object["keys"]:
            user = ndb.Key(urlsafe=key).get()
            if not user:
                return OutgoingMessage(error=INVALID_USERNAME, data='')
            user.perms = 'alumni'
            user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/revert_from_alumni',
                      http_method='POST', name='user.revert_from_alumni')
    def revert_from_alumni(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        for key in request_object["keys"]:
            user = ndb.Key(urlsafe=key).get()
            if not user:
                return OutgoingMessage(error=INVALID_USERNAME, data='')
            user.perms = 'member'
            user.put()
        return OutgoingMessage(error='', data='OK')

#     @endpoints.method(IncomingMessage, OutgoingMessage, path='info/load',
#                       http_method='POST', name='info.load')
#     def load_user_data(self, request):
#         time_start = datetime.datetime.now()
#         request_user = get_user(request.user_name, request.token)
#         if not request_user:
#             return OutgoingMessage(error=TOKEN_EXPIRED, data='')
#         out_data = dict()
#         out_data["perms"] = request_user.perms
#         out_data["accountFilledOut"] = bool(request_user.address and request_user.dob)
#         # line up all the queries
#         events_polls_future = Event.query(Event.going == request_user.key).fetch_async(projection=[Event.tag])
#         organization_users_future = User.query(User.organization == request_user.organization).fetch_async()
#         event_tag_list_future = Event.query(ndb.AND(Event.organization == request_user.organization,
#                                             Event.time_end < datetime.datetime.today() + relativedelta(months=1))
#                                             ).fetch_async(projection=[Event.going, Event.tag])

#         if len(request_user.tags) > 0:
#             events_future = Event.query(ndb.AND(Event.organization == request_user.organization,
#                                         ndb.OR(Event.org_tags.IN(request_user.tags),
#                                         Event.perms_tags == request_user.perms,
#                                         Event.perms_tags == 'everyone',
#                                         Event.going == request_user.key))).order(-Event.time_start).fetch_async(100)
#         else:
#             events_future = Event.query(ndb.AND(Event.organization == request_user.organization,
#                                         ndb.OR(Event.perms_tags == request_user.perms,
#                                         Event.perms_tags == 'everyone',
#                                         Event.going == request_user.key))).order(-Event.time_start).fetch_async(100)
#         organization_future = request_user.organization.get_async()
#         notification_count = 40
#         if request_user.new_notifications:
#             new_notification_future = Notification.query(Notification.key.IN(
#                 request_user.new_notifications)).order(-Notification.timestamp).fetch_async(40)
#         if request_user.new_notifications:
#             if len(request_user.new_notifications) >= 40:
#                 notification_count = 0
#             else:
#                 notification_count = 40 - len(request_user.new_notifications)
#         if request_user.notifications:
#             notifications_future = Notification.query(Notification.key.IN(
#                 request_user.notifications)).order(-Notification.timestamp).fetch_async(notification_count)
#         if request_user.hidden_notifications:
#             hidden_notifications_future = Notification.query(Notification.key.IN(
#                 request_user.hidden_notifications)).order(-Notification.timestamp).fetch_async(30)

# #part 1 of polls
#         events_polls = events_polls_future.get_result()
#         time_middle = datetime.datetime.now()
#         poll_event_tags = list()
#         for event in events_polls:
#             poll_event_tags.append(event.tag)
#         if not request_user.tags:
#             request_user.tags = ['@#$%^!^&*()%$#@!@#%^%^*^&*%#%$^']
#         if poll_event_tags:
#             polls_future = Poll.query(ndb.AND(ndb.OR(Poll.invited_perms_tags == 'everyone',
#                                               Poll.invited_org_tags.IN(request_user.tags),
#                                               Poll.invited_perms_tags == request_user.perms,
#                                               Poll.invited_event_tags.IN(poll_event_tags),
#                                               ),
#                                               Poll.organization == request_user.organization)).\
#                 order(-Poll.timestamp).fetch_async(100)
#         else:
#             polls_future = Poll.query(ndb.AND(ndb.OR(Poll.invited_perms_tags == 'everyone',
#                                               Poll.invited_org_tags.IN(request_user.tags),
#                                               Poll.invited_perms_tags == request_user.perms,
#                                               ),
#                                               Poll.organization == request_user.organization)).\
#                 order(-Poll.timestamp).fetch_async(100)
#         if request_user.tags == ['@#$%^!^&*()%$#@!@#%^%^*^&*%#%$^']:
#             request_user.tags = ['']
# #get results of queries
#         organization_users = organization_users_future.get_result()
#         event_tag_list = event_tag_list_future.get_result()
#         organization = organization_future.get_result()
#         events = events_future.get_result()
#         user_list = list()
#         alumni_list = list()
#         for user in organization_users:
#             user_dict = user.to_dict()
#             del user_dict["hash_pass"]
#             del user_dict["current_token"]
#             del user_dict["organization"]
#             del user_dict["timestamp"]
#             del user_dict["notifications"]
#             del user_dict["new_notifications"]
#             del user_dict["hidden_notifications"]
#             event_tags = list()
#             for event in event_tag_list:
#                 if user.key in event.going:
#                     event_tags.append(event.tag)
#             user_dict["event_tags"] = event_tags
#             user_dict["key"] = user.key.urlsafe()
#             if user.dob:
#                 user_dict["dob"] = user.dob.strftime("%m/%d/%Y")
#             else:
#                 del user_dict["dob"]
#             user_dict["key"] = user.key.urlsafe()
#             if user_dict["perms"] == 'alumni':
#                 alumni_list.append(user_dict)
#             else:
#                 user_list.append(user_dict)
#         out_data["directory"] = {'members': user_list, 'alumni': alumni_list}

#         # # tags section
#         # org_tags = organization.tags
#         # org_tags_list = list()
#         # for tag in request_user.recently_used_tags:
#         #     if tag in org_tags:
#         #         org_tags_list.append({"name": tag, "recent": True})
#         #         org_tags.remove(tag)
#         #     else:
#         #         request_user.recently_used_tags.remove(tag)
#         # for tag in org_tags:
#         #     org_tags_list.append({"name": tag, "recent": False})
#         # # events = event_tags_future.get_result()
#         # event_tags_list = list()
#         # for event in event_tag_list:
#         #     event_tags_list.append({"name": event.tag})
#         # perm_tags_list = [{"name": 'council'}, {"name": 'leadership'}, {"name": 'Everyone'}]
#         # out_data["tags"] = {'org_tags': org_tags_list, 'event_tags': event_tags_list, 'perms_tags': perm_tags_list}

#         # organization info
#         organization_data = dict(name=organization.name, school=organization.school)
#         organization_data["subscribed"] = organization.subscribed
#         organization_data["color"] = organization.color
#         try:
#             organization_data["image"] = images.get_serving_url(organization.image, secure_url=True)
#         except:
#             organization_data["image"] = ''
#         out_data["organization_data"] = organization_data

#         #events info
#         events_data = list()
#         for event in events:
#             dict_event = event.to_dict()
#             dict_event["tags"] = {"org_tags": event.org_tags, "perms_tags": event.perms_tags}
#             dict_event["key"] = event.key
#             events_data.append(dict_event)
#         out_data["events"] = events_data

#         #notifications info
#         out_notifications = list()
#         if request_user.new_notifications:
#             new_notifications = new_notification_future.get_result()
#             for notify in new_notifications:
#                 note = notify.to_dict()
#                 note["new"] = True
#                 note["key"] = notify.key.urlsafe()
#                 out_notifications.append(note)
#         if request_user.notifications:
#             notifications = notifications_future.get_result()
#             for notify in notifications:
#                 note = notify.to_dict()
#                 note["new"] = False
#                 note["key"] = notify.key.urlsafe()
#                 out_notifications.append(note)
#         out_hidden_notifications = list()
#         if request_user.hidden_notifications:
#             hidden_notifications = hidden_notifications_future.get_result()
#             for notify in hidden_notifications:
#                 note = notify.to_dict()
#                 note["key"] = notify.key.urlsafe()
#                 out_hidden_notifications.append(note)
#         out_data["notifications"] = {'notifications': out_notifications,
#                                      'hidden_notifications': out_hidden_notifications,
#                                      'notifications_length': len(request_user.notifications),
#                                      'hidden_notifications_length': len(request_user.hidden_notifications),
#                                      'new_notifications_length': len(request_user.new_notifications)}
#         org_tags_list = list()
#         # logging.error('recently used tags: ' + json_dump(request_user.recently_used_tags))
#         for tag in organization.tags:
#             if tag in request_user.recently_used_tags:
#                 org_tags_list.append({"name": tag, "recent": True})
#             else:
#                 org_tags_list.append({"name": tag, "recent": False})
#         event_tags_list = list()
#         for event in event_tag_list:
#             event_tags_list.append({"name": event.tag})
#         perm_tags_list = [{"name": 'council'}, {"name": 'leadership'}, {"name": 'Everyone'}]
#         out_data["tags"] = {'org_tags': org_tags_list, 'perms_tags': perm_tags_list, 'event_tags': event_tags_list}

# #part 2 of polls
#         dict_polls = list()
#         polls = polls_future.get_result()
#         for poll in polls:
#             add = poll.to_dict()
#             add["key"] = poll.key
#             dict_polls.append(add)
#         out_data["polls"] = dict_polls

#         time_end = datetime.datetime.now()
#         # logging.error('The time it took for initial load:: full time -' + str(time_end-time_start) + '   first half-' +
#         #               str(time_middle-time_start))
#         return OutgoingMessage(error='', data=json_dump(out_data))



    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/resend_welcome_email',
                      http_method='POST', name='user.resend_welcome_email')
    def resend_welcome_email(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        if 'key' in request_object:
            user = ndb.Key(urlsafe=request_object["key"]).get()
            if not user:
                return OutgoingMessage(error=INVALID_USERNAME, data='')
            if user.perms == 'alumni':
                email = alumni_signup_email(user.to_dict(), request_user.organization, user.current_token)
                cron = CronEmail()
                cron.content = email["text"]
                cron.title = email["subject"]
                cron.pending = True
                cron.type = 'welcome_again'
                cron.timestamp = datetime.datetime.now()
                cron.email = user.email
                cron.put()
            else:
                email = member_signup_email(user=user.to_dict(), token=user.current_token)
                cron = CronEmail()
                cron.content = email["text"]
                cron.title = email["subject"]
                cron.pending = True
                cron.type = 'welcome_again'
                cron.timestamp = datetime.datetime.now()
                cron.email = user.email
                cron.put()
        return OutgoingMessage(error='', data='OK')


    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/resend_all_welcome_emails',
                      http_method='POST', name='user.resend_all_welcome_emails')
    def resend_all_welcome_emails(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        users = User.query(User.organization == request_user.organization).fetch()
        async_items = []
        for user in users:
            if not user.user_name:
                email = member_signup_email(user=user.to_dict(), token=user.current_token)
                cron = CronEmail()
                cron.content = email["text"]
                cron.title = email["subject"]
                cron.pending = True
                cron.type = 'welcome_again'
                cron.timestamp = datetime.datetime.now()
                cron.email = user.email
                async_items.append(cron.put_async())
        for item in async_items:
            item.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/update_user_directory_info',
                      http_method='POST', name='user.update_user_directory_info')
    def update_user_directory_info(self, request):
        user = User.query(User.user_name == request.user_name).get()
        user_data = json.loads(request.data)
        logging.error(user_data)
        for key, value in user_data.iteritems():
            if not value and value != "":
                continue
            if key == "email":
                user.email = value
            elif key == "first_name":
                user.first_name = value
            elif key == "last_name":
                user.last_name = value
            elif key == "dob":
                user.dob = datetime.datetime.strptime(value, '%m/%d/%Y')
            elif key == "grad_month":
                user.grad_month = int(value)
            elif key == "grad_year":
                user.grad_year = int(value)
            elif key == "address":
                user.address = value
            elif key == "city":
                user.city = value
            elif key == "state":
                user.state = value
            elif key == "zip":
                user.zip = int(value)
            elif key == "class_year":
                user.class_year = int(value)
            elif key == "pledge_class_year":
                user.pledge_class_year = int(value)
            elif key == "pledge_class_semester":
                user.pledge_class_semester = value.lower()
            elif key == "phone":
                user.phone = value
            elif key == "facebook":
                user.facebook = value
            elif key == "instagram":
                user.instagram = value
            elif key == "twitter":
                user.twitter = value
            elif key == "linkedin":
                user.linkedin = value
            elif key == "website":
                user.website = value
            elif key == "perm_address":
                user.perm_address = value
            elif key == "perm_city":
                user.perm_city = value
            elif key == "perm_state":
                user.perm_state = value
            elif key == "perm_zip":
                user.perm_zip = value
            elif key == "major":
                user.major = value
            elif key == "status":
                user.status = value
            elif key == "expected_graduation":
                user.expected_graduation = value
            elif key == "position":
                user.position = value
            elif key == "occupation":
                user.occupation = value
            elif key == "employer":
                user.employer = value
            elif key == "pledge_class":
                user.pledge_class = value
            elif key == "email_prefs":
                user.email_prefs = value
        user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/forgot_password',
                      http_method='POST', name='auth.forgot_password')
    def forgot_password(self, request):
        user_data = json.loads(request.data)
        if len(user_data["email"]) > 1:
            users = User.query(User.email == user_data["email"]).fetch()
            org_key_list = list()
            for user in users:
                if user.organization not in org_key_list:
                    org_key_list.append(user.organization)
            orgs = ndb.get_multi(org_key_list)
            user_list = list()
            for user in users:
                org = None
                for organization in orgs:
                    if organization.key == user.organization:
                        org = {'name': organization.name, 'school': organization.school}
                        break
                if org and user.user_name:
                    user_list.append({'user_name': user.user_name, 'org_name': org['name'], 'org_school': org['school']})
            return OutgoingMessage(error='', data=json_dump(user_list))
        elif user_data["user_name"]:
            user = User.query(User.user_name == user_data["user_name"].lower()).get()
        if not user:
            return OutgoingMessage(error=INVALID_EMAIL, data='')
        forgotten_password_email(user)
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/set_colors',
                      http_method='POST', name='auth.set_colors')
    def set_colors(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='OK')
        organization = request_user.organization.get()
        if not request_user.perms == 'council':
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if 'color' in data:
            organization.color = data["color"]
            organization.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/check_password_token',
                      http_method='POST', name='auth.check_password_token')
    def check_password_token(self, request):
        user = User.query(User.current_token == request.token).get()
        if not user:
            return OutgoingMessage(error=BAD_FIRST_TOKEN, data='')
        return OutgoingMessage(error='', data=json_dump({'first_name': user.first_name, 'last_name': user.last_name, 'user_name': user.user_name}))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/change_password',
                      http_method='POST', name='auth.change_password')
    def change_password(self, request):
        user = get_user(request.user_name, request.token)
        if not user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        request_object = json.loads(request.data)
        old_pass = request_object['old_password']
        if not hashlib.sha224(old_pass + SALT).hexdigest() == user.hash_pass:
            return OutgoingMessage(error=ERROR_BAD_ID)
        new_pass = request_object["password"]
        if not len(new_pass) >= 6:
                return OutgoingMessage(error='INVALID_PASSWORD', data='')
        user.hash_pass = hashlib.sha224(new_pass + SALT).hexdigest()
        user.current_token = generate_token()
        user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/change_password_from_token',
                      http_method='POST', name='auth.change_password_from_token')
    def change_password_from_token(self, request):
        user = User.query(User.current_token == request.token).get()
        if not user:
            return OutgoingMessage(error=BAD_FIRST_TOKEN, data='')
        new_pass = json.loads(request.data)["password"]
        if not len(new_pass) >= 6:
                return OutgoingMessage(error='INVALID_PASSWORD', data='')
        user.hash_pass = hashlib.sha224(new_pass + SALT).hexdigest()
        user.current_token = generate_token()
        user.put()
        return OutgoingMessage(error='', data=user.user_name)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/get_upload_url',
                      http_method='POST', name='auth.get_upload_url')
    def get_upload_url(self, request):
        user = get_user(request.user_name, request.token)
        if not user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        upload_url = blobstore.create_upload_url('/upload')
        return OutgoingMessage(error='', data=upload_url)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/set_uploaded_prof_pic',
                      http_method='POST', name='auth.upload_profile_picture')
    def upload_profile_picture(self, request):
        user = get_user(request.user_name, request.token)
        if not user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        key = json.loads(request.data)["key"]
        old_key = user.prof_pic
        if old_key and blobstore.BlobInfo.get(old_key):
            blobstore.BlobInfo.get(old_key).delete()
        user.prof_pic = blobstore.BlobKey(key)
        user.put()
        return OutgoingMessage(error='', data=images.get_serving_url(user.prof_pic))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/directory_less',
                      http_method='POST', name='auth.directory_less')
    def directory_less(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization_users_future = User.query(User.organization == request_user.organization).fetch_async(projection=[User.user_name, User.first_name, User.last_name, User.perms, User.prof_pic, User.tags, User.email, User.phone])
        event_list_future = Event.query(Event.organization == request_user.organization,
                                        ).fetch_async(projection=[Event.going, Event.tag])
        organization_users = organization_users_future.get_result()
        event_list = event_list_future.get_result()
        user_list = list()
        me = request_user.to_dict()
        del me["hash_pass"]
        del me["current_token"]
        del me["organization"]
        del me["timestamp"]
        del me["notifications"]
        del me["new_notifications"]
        alumni_list = list()
        for user in organization_users:
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            del user_dict["timestamp"]
            del user_dict["notifications"]
            del user_dict["new_notifications"]
            event_tags = list()
            for event in event_list:
                if user.key in event.going:
                    event_tags.append(event.tag)
            user_dict["event_tags"] = event_tags
            user_dict["key"] = user.key.urlsafe()
            if user.dob:
                user_dict["dob"] = user.dob.strftime("%m/%d/%Y")
            else:
                del user_dict["dob"]
            user_dict["key"] = user.key.urlsafe()
            if user_dict["perms"] == 'alumni':
                alumni_list.append(user_dict)
            else:
                user_list.append(user_dict)
        return_data = json_dump({'members': user_list, 'alumni': alumni_list, 'me': me})
        return OutgoingMessage(error='', data=return_data)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/directory',
                      http_method='POST', name='auth.directory')
    def directory(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization_users_future = User.query(User.organization == request_user.organization).fetch_async()
        event_list_future = Event.query(Event.organization == request_user.organization,
                                        ).fetch_async(projection=[Event.going, Event.tag])
        organization_users = organization_users_future.get_result()
        event_list = event_list_future.get_result()
        user_list = list()
        me = request_user.to_dict()
        del me["hash_pass"]
        del me["current_token"]
        del me["organization"]
        del me["timestamp"]
        del me["notifications"]
        del me["new_notifications"]
        alumni_list = list()
        for user in organization_users:
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            del user_dict["timestamp"]
            del user_dict["notifications"]
            del user_dict["new_notifications"]
            event_tags = list()
            for event in event_list:
                if user.key in event.going:
                    event_tags.append(event.tag)
            user_dict["event_tags"] = event_tags
            user_dict["key"] = user.key.urlsafe()
            if user.dob:
                user_dict["dob"] = user.dob.strftime("%m/%d/%Y")
            else:
                del user_dict["dob"]
            user_dict["key"] = user.key.urlsafe()
            if user_dict["perms"] == 'alumni':
                alumni_list.append(user_dict)
            else:
                user_list.append(user_dict)
        return_data = json_dump({'members': user_list, 'alumni': alumni_list, 'me': me})
        return OutgoingMessage(error='', data=return_data)


    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/query_user',
                  http_method='POST', name='auth.query_user')
    def query_for_user(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        json.loads(request.data);
        user_future = User.query(User.organization == request_user.organization, User.user_name == request["user_name"]).get_async()
        event_list_future = Event.query(Event.organization == request_user.organization,
                                        ).fetch_async(projection=[Event.going, Event.tag])
        user = user_future.get_result()
        event_list = event_list_future.get_result()
        user_dict = user.to_dict()
        del user_dict["hash_pass"]
        del user_dict["current_token"]
        del user_dict["organization"]
        del user_dict["timestamp"]
        del user_dict["notifications"]
        del user_dict["new_notifications"]
        event_tags = list()
        for event in event_list:
            if user.key in event.going:
                event_tags.append(event.tag)
        user_dict["event_tags"] = event_tags
        user_dict["key"] = user.key.urlsafe()
        if user.dob:
            user_dict["dob"] = user.dob.strftime("%m/%d/%Y")
        else:
            del user_dict["dob"]
        user_dict["key"] = user.key.urlsafe()
        return_data = json_dump(user_dict)
        return OutgoingMessage(error='', data=return_data)

    #-------------------------
    # TAGGING Endpoints
    #-------------------------

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/add_organization_tag',
                      http_method='POST', name='user.add_organization_tag')
    def add_organization_tag(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        if not check_availability_of_tag(request_object["tag"], request_user.organization):
            return OutgoingMessage(error=TAG_INVALID, data='')
        organization = request_user.organization.get()
        organization.tags.append(request_object["tag"].lower())
        request_user.recently_used_tags.insert(0, request_object["tag"].lower())
        if len(request_user.recently_used_tags) > 5:
            request_user.recently_used_tags = request_user.recently_used_tags[:5]
        org_put = organization.put_async()
        user_put = request_user.put_async()
        org_put.get_result()
        user_put.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/remove_organization_tag',
                      http_method='POST', name='user.remove_organization_tag')
    def remove_organization_tag(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        organization = request_user.organization.get()
        if not organization:
            return OutgoingMessage(error='ORGANIZATION_NOT_FOUND', data='')
        if request_object["tag"] in organization.tags:
            organization.tags.remove(request_object['tag'].lower())
            organization.put()
            users = User.query(ndb.AND(User.tags == request_object["tag"],
                               User.organization == request_user.organization)).fetch()
            for user in users:
                user.tags.remove(request_object['tag'])
                user.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=INVALID_FORMAT, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/rename_organization_tag',
                      http_method='POST', name='user.rename_organization_tag')
    def rename_organization_tag(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        organization = request_user.organization.get()
        if not organization:
            return OutgoingMessage(error='ORGANIZATION_NOT_FOUND', data='')
        if request_object["old_tag"].lower() in organization.tags:
            organization.tags.remove(request_object['old_tag'].lower())
            organization.tags.append(request_object['new_tag'].lower())
            organization.put()
            users = User.query(ndb.AND(User.tags == request_object["old_tag"],
                               User.organization == request_user.organization)).fetch()
            for user in users:
                user.tags.remove(request_object['old_tag'])
                user.tags.append(request_object['new_tag'])
                user.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=INVALID_FORMAT, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/get_organization_tags',
                      http_method='POST', name='user.get_organization_tags')
    def get_organization_tags(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization = request_user.organization.get()
        if not organization:
            return OutgoingMessage(error='ORGANIZATION_NOT_FOUND', data='')
        return OutgoingMessage(error='', data=json_dump({'tags': organization.tags}))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/add_users_tags',
                      http_method='POST', name='user.add_users_tags')
    def add_users_tags(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        organization = request_user.organization.get()
        for key in request_object["keys"]:
            user = ndb.Key(urlsafe=key).get()
            if not user:
                return OutgoingMessage(error=INVALID_USERNAME, data='')
            for tag in request_object["tags"]:
                if tag not in user.tags and tag in organization.tags:
                    user.tags.append(tag)
            user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/remove_users_tags',
                      http_method='POST', name='user.remove_users_tag')
    def remove_users_tag(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        for key in request_object["keys"]:
            user = ndb.Key(urlsafe=key).get()
            if not user:
                return OutgoingMessage(error=INVALID_USERNAME, data='')
            for tag in request_object["tags"]:
                if tag in user.tags:
                    user.tags.remove(tag)
            user.put()
        return OutgoingMessage(error='', data='OK')

    #-------------------------
    # UPDATE STATUS ENDPOINT
    #-------------------------

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/update_status',
                      http_method='POST', name='user.update_status')
    def update_status(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        request_object = json.loads(request.data)
        request_user.status = request_object['status']
        request_user.put()
        return OutgoingMessage(error='', data='OK')

    #-------------------------
    # MESSAGING ENDPOINTS
    #-------------------------

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

    # @endpoints.method(IncomingMessage, OutgoingMessage, path='message/send_message',
    #                   http_method='POST', name='message.send_message')
    # def send_message(self, request):
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
    #         return OutgoingMessage(error=INCORRECT_PERMS, data='')
    #     data = json.loads(request.data)
    #     user_list_future = list()
    #     user_list = list()
    #     if 'keys' in data:
    #         for key in data['keys']:
    #             user_list_future.append(ndb.Key(urlsafe=key).get_async())
    #     for user in user_list_future:
    #         user_list.append(user.get_result())
    #     notification = Notification()
    #     notification.type = 'message'
    #     notification.content = data['content']
    #     notification.timestamp = datetime.datetime.now()
    #     notification.sender = request_user.key
    #     notification.sender_name = request_user.first_name + ' ' + request_user.last_name
    #     notification.title = data['title']
    #     notification.put()
    #     request_user.sent_notifications.insert(0, notification.key)
    #     request_user.put()
    #     add_notification_to_users(notification, user_list, True)
    #     return OutgoingMessage(error='', data='OK')

    #-------------------------
    # NOTIFICATION ENDPOINTS
    #-------------------------

    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/send_message',
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/archive',
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


    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/unarchive',
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


    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/delete',
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/recently_sent',
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


    @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/get',
                      http_method='POST', name='notifications.get')
    def get_notifications(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        notification_count = 30
        if request_user.new_notifications:
            new_notification_future = Notification.query(Notification.key.IN(
                request_user.new_notifications)).order(-Notification.timestamp).fetch_async(30)
        if request_user.new_notifications:
            if len(request_user.new_notifications) >= 30:
                notification_count = 0
            else:
                notification_count = 30 - len(request_user.new_notifications)
        if request_user.notifications and notification_count > 0:
            notifications_future = Notification.query(Notification.key.IN(
                request_user.notifications)).order(-Notification.timestamp).fetch_async(notification_count)
        out_notifications = list()
        if request_user.new_notifications:
            new_notifications = new_notification_future.get_result()
            for notify in new_notifications:
                note = notify.to_dict()
                note["new"] = True
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        if request_user.notifications and notification_count > 0:
            notifications = notifications_future.get_result()
            for notify in notifications:
                note = notify.to_dict()
                note["new"] = False
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        return OutgoingMessage(error='', data=json_dump(out_notifications))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/read',
                      http_method='POST', name='notifications.read')
    def read_notification(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        for key in request_user.new_notifications:
            request_user.new_notifications.remove(key)
            request_user.notifications.insert(0, key)
        request_user.put()
        return OutgoingMessage(error='', data='OK')    

    @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/update',
                      http_method='POST', name='notifications.update')
    def update_notifications(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if (request_user.new_notifications):
            new_notifications = Notification.query(Notification.key.IN(
                request_user.new_notifications)).order(-Notification.timestamp).fetch(15)
            out = list()
            for notify in new_notifications:
                add = notify.to_dict()
                add["new"] = True
                add["key"] = notify.key.urlsafe()
                out.append(add)
            return OutgoingMessage(error='', data=json_dump(out))
        return OutgoingMessage(error='', data=json_dump(list()))


    # @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/get',
    #                   http_method='POST', name='notifications.get')
    # def get_notifications(self, request):
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     notification_count = 40
    #     if request_user.new_notifications:
    #         new_notification_future = Notification.query(Notification.key.IN(
    #             request_user.new_notifications)).order(-Notification.timestamp).fetch_async(40)
    #     if request_user.new_notifications:
    #         if len(request_user.new_notifications) >= 40:
    #             notification_count = 0
    #         else:
    #             notification_count = 40 - len(request_user.new_notifications)
    #     if request_user.notifications and notification_count > 0:
    #         notifications_future = Notification.query(Notification.key.IN(
    #             request_user.notifications)).order(-Notification.timestamp).fetch_async(notification_count)
    #     if request_user.hidden_notifications:
    #         hidden_notifications_future = Notification.query(Notification.key.IN(
    #             request_user.hidden_notifications)).order(-Notification.timestamp).fetch_async(30)
    #     out_notifications = list()
    #     if request_user.new_notifications:
    #         new_notifications = new_notification_future.get_result()
    #         for notify in new_notifications:
    #             note = notify.to_dict()
    #             note["new"] = True
    #             note["key"] = notify.key.urlsafe()
    #             out_notifications.append(note)
    #     if request_user.notifications and notification_count > 0:
    #         notifications = notifications_future.get_result()
    #         for notify in notifications:
    #             note = notify.to_dict()
    #             note["new"] = False
    #             note["key"] = notify.key.urlsafe()
    #             out_notifications.append(note)
    #     out_hidden_notifications = list()
    #     if request_user.hidden_notifications:
    #         hidden_notifications = hidden_notifications_future.get_result()
    #         for notify in hidden_notifications:
    #             note = notify.to_dict()
    #             note["key"] = notify.key.urlsafe()
    #             out_hidden_notifications.append(note)
    #     out = {'notifications': out_notifications,
    #            'hidden_notifications': out_hidden_notifications,
    #            'notifications_length': len(request_user.notifications),
    #            'hidden_notifications_length': len(request_user.hidden_notifications),
    #            'new_notifications_length': len(request_user.new_notifications)}
    #     return OutgoingMessage(error='', data=json_dump(out))

    # @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/seen',
    #                   http_method='POST', name='notifications.seen')
    # def see_notification(self, request):
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     data = json.loads(request.data)
    #     key = ndb.Key(urlsafe=data["notification"])
    #     if key in request_user.new_notifications:
    #         request_user.new_notifications.remove(key)
    #         request_user.notifications.insert(0, key)
    #         request_user.put()
    #     return OutgoingMessage(error='', data='OK')


    # @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/more_hidden',
    #                   http_method='POST', name='notifications.more_hidden')
    # def more_hidden(self, request):
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     data = json.loads(request.data)
    #     out_hidden_notifications = list()
    #     hidden_notifications_future = Notification.query(Notification.key.IN(
    #         request_user.hidden_notifications)).order(-Notification.timestamp).fetch_async(data + 20)
    #     hidden_notifications = hidden_notifications_future.get_result()
    #     for notify in hidden_notifications:
    #         note = notify.to_dict()
    #         note["key"] = notify.key.urlsafe()
    #         out_hidden_notifications.insert(0, note)
    #     return OutgoingMessage(error='', data=json_dump(out_hidden_notifications))

    # @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/more_notifications',
    #                   http_method='POST', name='notifications.more_notifications')
    # def more_notifications(self, request):
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     data = json.loads(request.data)
    #     out_notifications = list()
    #     notification_count = 40 + data
    #     if request_user.new_notifications:
    #         new_notification_future = Notification.query(Notification.key.IN(
    #             request_user.new_notifications)).order(-Notification.timestamp).fetch_async(40 + data)
    #     if request_user.new_notifications:
    #         if len(request_user.new_notifications) >= 40 + data:
    #             notification_count = 0
    #         else:
    #             notification_count = 40+data - len(request_user.new_notifications)
    #     if request_user.notifications:
    #         notifications_future = Notification.query(Notification.key.IN(
    #             request_user.notifications)).order(-Notification.timestamp).fetch_async(notification_count)
    #     out_notifications = []
    #     if request_user.notifications:
    #         notifications = notifications_future.get_result()
    #         for notify in notifications:
    #             note = notify.to_dict()
    #             note["key"] = notify.key.urlsafe()
    #             out_notifications.append(note)
    #     if request_user.new_notifications:
    #         new_notifications = new_notification_future.get_result()
    #         for notify in new_notifications:
    #             note = notify.to_dict()
    #             note["key"] = notify.key.urlsafe()
    #             note["new"] = True
    #             out_notifications.append(note)
    #     return OutgoingMessage(error='', data=json_dump(out_notifications))


    # @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/hide',
    #                   http_method='POST', name='notifications.hide')
    # def hide_notification(self, request):
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     data = json.loads(request.data)
    #     key = ndb.Key(urlsafe=data["notification"])
    #     if key in request_user.notifications:
    #         request_user.notifications.remove(key)
    #         request_user.hidden_notifications.insert(0, key)
    #         request_user.put()
    #         return OutgoingMessage(error='', data='OK')
    #     if key in request_user.new_notifications:
    #         request_user.new_notifications.remove(key)
    #         request_user.hidden_notifications.insert(0, key)
    #         request_user.put()
    #         return OutgoingMessage(error='', data='OK')
    #     return OutgoingMessage(error='', data='OK')


    # @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/unhide',
    #                   http_method='POST', name='notifications.unhide')
    # def unhide_notification(self, request):
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     data = json.loads(request.data)
    #     key = ndb.Key(urlsafe=data["notification"])
    #     if key in request_user.hidden_notifications:
    #         request_user.hidden_notifications.remove(key)
    #         request_user.notifications.insert(0, key)
    #         request_user.put()
    #         return OutgoingMessage(error='', data='OK')
    #     return OutgoingMessage(error='NOTIFICATION_NOT_FOUND', data='')

    # @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/hidden_notifications',
    #                   http_method='POST', name='notifications.hidden_notifications')
    # def hidden_notifications(self, request):
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     hidden_notifications = Notification.query(Notification.key.IN(request_user.hidden_notifications)).fetch()
    #     notifications = list()
    #     for notification in hidden_notifications:
    #         notify = notification.to_dict()
    #         notify["key"] = notification.key.urlsafe()
    #         notifications.insert(0, notify)
    #     return OutgoingMessage(error='', data=json_dump(notifications))

    # @endpoints.method(IncomingMessage, OutgoingMessage, path='message/delete',
    #                   http_method='POST', name='notifications.revoke')
    # def revoke_notification(self, request):
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
    #         return OutgoingMessage(error=INCORRECT_PERMS, data='')
    #     data = json.loads(request.data)
    #     key = ndb.Key(urlsafe=data["message"])
    #     if key in request_user.sent_notifications:
    #         futures = list()
    #         request_user.sent_notifications.remove(key)
    #         futures.append(request_user.put_async())
    #         notified_users = User.query(User.notifications == key).fetch_async()
    #         new_notified_users = User.query(User.new_notifications == key).fetch_async()
    #         hidden_notified_users = User.query(User.hidden_notifications == key).fetch_async()
    #         users = notified_users.get_result()
    #         for user in users:
    #             user.notifications.remove(key)
    #             futures.append(user.put_async())
    #         users_new = new_notified_users.get_result()
    #         for user in users_new:
    #             user.new_notifications.remove(key)
    #             futures.append(user.put_async())
    #         users_hidden = hidden_notified_users.get_result()
    #         for user in users_hidden:
    #             user.hidden_notifications.remove(key)
    #             futures.append(user.put_async())
    #         futures.append(key.delete_async())
    #         for future in futures:
    #             future.get_result()
    #     return OutgoingMessage(error='', data='OK')

    # @endpoints.method(IncomingMessage, OutgoingMessage, path='message/recently_sent',
    #                   http_method='POST', name='notifications.recently_sent')
    # def recently_sent_notification(self, request):
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
    #         return OutgoingMessage(error=INCORRECT_PERMS, data='')
    #     if not request_user.sent_notifications:
    #         return OutgoingMessage(error='', data=json_dump(''))
    #     sent_notifications = Notification.query(Notification.key.IN(request_user.sent_notifications)).order(
    #                                                                 -Notification.timestamp).fetch(30)
    #     out_message = list()
    #     for notification in sent_notifications:
    #         note_dict = notification.to_dict()
    #         note_dict["key"] = notification.key.urlsafe()
    #         out_message.append(note_dict)
    #     return OutgoingMessage(error='', data=json_dump(out_message))

    #-------------------------
    # EVENT ENDPOINTS
    #-------------------------
    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/create',
                      http_method='POST', name='event.create')
    def create_event(self, request):
        event_data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        new_event = Event()
        new_event.creator = request_user.key
        if "description" in event_data:
            new_event.description = event_data["description"]
        new_event.title = event_data["title"]
        new_event.time_start = datetime.datetime.strptime(event_data["time_start"], '%m/%d/%Y %I:%M %p')
        new_event.time_end = datetime.datetime.strptime(event_data["time_end"], '%m/%d/%Y %I:%M %p')
        new_event.time_created = datetime.datetime.now()
        new_event.organization = request_user.organization
        new_event.org_tags = event_data["tags"]["org_tags"]
        if "location" in event_data:
            new_event.location = event_data["location"]
        if 'address' in event_data:
            new_event.address = event_data["address"]
        for tag in new_event.org_tags:
            if tag not in request_user.recently_used_tags:
                request_user.recently_used_tags.insert(0, tag)
            if len(request_user.recently_used_tags) > 5:
                request_user.recently_used_tags = request_user.recently_used_tags[:5]
        new_event.perms_tags = event_data["tags"]["perms_tags"]
        if EVERYONE in event_data["tags"]["perms_tags"]:
            new_event.perms_tags = ['everyone']
        users = get_users_from_tags(event_data["tags"], request_user.organization, False)
        new_event_key = new_event.put()
        future_list = list()
        recurring = False
        if 'recurring' in event_data and event_data['recurring'] == True:
            recurring_type = event_data['recurring_type']
            end_date = datetime.datetime.strptime(event_data['until'], '%m/%d/%Y')
            recurring_end = datetime.datetime(end_date.year, end_date.month, end_date.day, 23, 59, 59)
            curr_start_date = new_event.time_start
            curr_end_date = new_event.time_end
            if recurring_type == 'weekly':
                curr_start_date = curr_start_date + datetime.timedelta(days=7)
                curr_end_date = curr_end_date + datetime.timedelta(days=7)
            elif recurring_type == 'monthly':
                curr_start_date = curr_start_date + datetime.timedelta(months=1)
                curr_end_date = curr_end_date + datetime.timedelta(months=1)
            while curr_start_date <= end_date:
                ev = Event()
                ev.creator = new_event.creator
                ev.description = new_event.description
                ev.title = new_event.title
                ev.time_start = curr_start_date
                ev.time_end = curr_end_date
                ev.time_created = new_event.time_created
                ev.organization = new_event.organization
                ev.org_tags = new_event.org_tags
                if "location" in event_data:
                    ev.location = event_data["location"]
                if 'address' in event_data:
                    ev.address = event_data["address"]
                ev.perms_tags = new_event.perms_tags
                ev.parent_event = new_event_key
                recurring = True
                future_list.append(ev.put_async())
                if recurring_type == 'weekly':
                    curr_start_date = curr_start_date + datetime.timedelta(days=7)
                    curr_end_date = curr_end_date + datetime.timedelta(days=7)
                elif recurring_type == 'monthly':
                    curr_start_date = curr_start_date + datetime.timedelta(months=1)
                    curr_end_date = curr_end_date + datetime.timedelta(months=1)
                else:
                    break
    
        notification = Notification()
        notification.type = 'event'
        if recurring:
            notification.content = request_user.first_name + " " + request_user.last_name + " invited you to the repeated events: " + event_data["title"]
        else:
            notification.content = request_user.first_name + " " + request_user.last_name + " invited you to the event: " + event_data["title"]
        notification.sender = new_event.creator
        notification.timestamp = datetime.datetime.now()
        notification.link = 'app/events/' + new_event_key.urlsafe()
        notification.created_key = new_event_key
        notification.put()
        future_list.append(request_user.put_async())
        add_notification_to_users(notification, users)
        for item in future_list:
            item.get_result()
        return OutgoingMessage(error='', data=json_dump(new_event_key.urlsafe()))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/check_tag_availability',
                      http_method='POST', name='event.check_tag_availability')
    def check_tag_availability(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        tag = json.loads(request.data)
        if not check_availability_of_tag(tag, request_user.organization):
            return OutgoingMessage(error=TAG_INVALID, data='')
        # logging.error()
        # organization_future = request_user.organization.get_async()
        # event_future = Event.query(ndb.AND(Event.organization == request_user.organization,
        #                                    Event.tag == tag.lower())).get_async()
        # organization = organization_future.get_result()
        # logging.error('The tag im checking is ' + tag.lower())
        # if tag.lower() in organization.tags:
        #     return OutgoingMessage(error=TAG_INVALID, data='')
        # if event_future.get_result():
        #     return OutgoingMessage(error=TAG_INVALID, data='')
        # if tag.lower() in ['alumni', 'member', 'council', 'leadership', 'everyone']:
        #     return OutgoingMessage(error=TAG_INVALID, data='')
        # logging.error('And its valid')
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/rsvp',
                      http_method='POST', name='event.rsvp')
    def rsvp_event(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        event_data = json.loads(request.data)
        event = ndb.Key(urlsafe=event_data["key"]).get()
        if event_data["rsvp"] == "going":
            if request_user.key in event.not_going:
                event.not_going.remove(request_user.key)
            if request_user.key not in event.going:
                event.going.append(request_user.key)
            event.put()
        elif event_data["rsvp"] == "not_going":
            if request_user.key in event.going:
                event.going.remove(request_user.key)
            if request_user.key not in event.not_going:
                event.not_going.append(request_user.key)
            event.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/get_events',
                      http_method='POST', name='event.get_events')
    def get_events(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if len(request_user.tags) > 0:
            events = Event.query(ndb.AND(Event.organization == request_user.organization,
                                 ndb.OR(Event.org_tags.IN(request_user.tags),
                                        Event.perms_tags == request_user.perms,
                                        Event.perms_tags == 'everyone',
                                        Event.going == request_user.key))).order(-Event.time_start).fetch()
        else:
            events = Event.query(ndb.AND(Event.organization == request_user.organization,
                                 ndb.OR(Event.perms_tags == request_user.perms,
                                        Event.perms_tags == 'everyone',
                                        Event.going == request_user.key))).order(-Event.time_start).fetch()
        out_events = list()
        for event in events:
            dict_event = event.to_dict()
            dict_event["tags"] = {"org_tags": event.org_tags, "perms_tags": event.perms_tags}
            dict_event["key"] = event.key
            out_events.append(dict_event)

        return OutgoingMessage(error='', data=json_dump(out_events))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/edit_event',
                      http_method='POST', name='event.edit_event')
    def edit_event(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_data = json.loads(request.data)
        event = ndb.Key(urlsafe=request_data["key"]).get()
        if event.organization != request_user.organization:
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        change = False
        for key, value in request_data.iteritems():
            if key == "time_start":
                if not event.time_start == datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p'):
                    event.time_start = datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p')
                    change = True
            elif key == "time_end":
                if not event.time_end == datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p'):
                    event.time_end = datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p')
                    change = True
            elif key == "title":
                if not event.title == value:
                    event.title = value
                    change = True
            elif key == "description":
                if not event.description == value:
                    event.description = value
                    change = True
            elif key == "location":
                if not event.location == value:
                    event.location = value
                    change = True
            elif key == 'address':
                if not event.address == value:
                    event.address = value
                    change = True
            elif key == "tags":
                if "org_tags" in value:
                    event.org_tags = value["org_tags"]
                if "perms_tags" in value:
                    event.perms_tags = value["perms_tags"]
                    if EVERYONE in value["perms_tags"]:
                        event.perms_tags = ['everyone']
                # invited_users = get_users_from_tags(tags=value,
                #                                     organization=request_user.organization,
                #                                     keys_only=True)
                # going_difference = set(event.going).difference(set(invited_users))
                # not_going_difference = set(event.not_going).difference(set(invited_users))
                # if len(going_difference) > 0:
                #     for _key in list(going_difference):
                #         event.going.remove(_key)
                # if len(not_going_difference) > 0:
                #     for _key in list(not_going_difference):
                #         event.not_going.remove(_key)
        futures = list()
        futures.append(event.put_async())
        if change:
            users = get_users_from_tags({'org_tags': event.org_tags, 'perms_tags': event.perms_tags},
                                        request_user.organization, False)
            notification = Notification()
            notification.type = 'event'
            notification.content =  request_user.first_name + " " + request_user.last_name +" updated the event: " + event.title
            notification.sender = request_user.key
            notification.timestamp = datetime.datetime.now()
            notification.link = 'app/events/'+event.key.urlsafe()
            notification.put()
            add_notification_to_users(notification, users)
            for item in futures:
                item.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/get_check_in_info',
                      http_method='POST', name='event.get_check_in_info')
    def get_check_in_info(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        event_key = ndb.Key(urlsafe=json.loads(request.data))
        event = Event.query(Event.key == event_key).get()
        users_future = User.query(ndb.AND(User.organization ==
                                  request_user.organization, User.perms != 'alumni')) .fetch_async(projection=[User.user_name, User.prof_pic,
                                                                                     User.first_name, User.last_name])
        attendance_data_future = AttendanceData.query(AttendanceData.event == event_key).fetch_async()
        users = users_future.get_result()
        attendance_data = attendance_data_future.get_result()
        data_list = list()
        for user in users:
            user_dict = user.to_dict()
            user_dict["key"] = user.key
            for att in attendance_data:
                if att.user == user.key:
                    user_dict["attendance_data"] = att.to_dict()
            data_list.append(user_dict)
        # for att in attendance_data:
        #     att_dict = att.to_dict()
        #     for user in users:
        #         if user.key == att.user:
        #             att_dict["user"] = user.to_dict()
        #             if user.key in event.going:
        #                 att_dict["going"] = True
        #             elif user.key in event.not_going:

        return OutgoingMessage(error='', data=json_dump(data_list))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/check_in',
                      http_method='POST', name='event.check_in')
    def check_in(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        data = json.loads(request.data)
        user_key = ndb.Key(urlsafe=data["user_key"])
        event_key = ndb.Key(urlsafe=data["event_key"])
        att_data = AttendanceData.query(ndb.AND(AttendanceData.event == event_key,
                                                AttendanceData.user == user_key)).get()
        if "clear" in data:
            if data["clear"] is True and att_data:
                att_data.time_in = None
                att_data.put()
                return OutgoingMessage(error='', data='OK')
            elif data["clear"] is True and not att_data:
                return OutgoingMessage(error='', data='OK')
        if att_data:
            att_data.time_in = datetime.datetime.now()
            att_data.put()
            return OutgoingMessage(error='', data='OK')  # They are already checked in
        else:
            att_data = AttendanceData()
            att_data.user = user_key
            att_data.event = event_key
            att_data.time_in = datetime.datetime.now()
            if "note" in data:
                att_data.note = data["note"]
            att_data.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/check_out',
                      http_method='POST', name='event.check_out')
    def check_out(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        data = json.loads(request.data)
        user_key = ndb.Key(urlsafe=data["user_key"])
        event_key = ndb.Key(urlsafe=data["event_key"])
        att_data = AttendanceData.query(ndb.AND(AttendanceData.event == event_key,
                                                AttendanceData.user == user_key)).get()
        if "clear" in data:
            if data["clear"] is True and att_data:
                att_data.time_out = None
                att_data.put()
                return OutgoingMessage(error='', data='OK')
            elif data["clear"] is True and not att_data:
                return OutgoingMessage(error='', data='OK')
        if att_data:
            att_data.time_out = datetime.datetime.now()
            att_data.put()
        else:
            att_data = AttendanceData()
            att_data.user = user_key
            att_data.event = event_key
            att_data.time_out = datetime.datetime.now()
            if "note" in data:
                att_data.note = data["note"]
            att_data.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/delete',
                      http_method='POST', name='event.delete')
    def delete_event(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        event_key = ndb.Key(urlsafe=json.loads(request.data))
        event_data = AttendanceData.query(AttendanceData.event == event_key).fetch(keys_only=True)
        notifications = Notification.query(Notification.created_key == event_key).fetch(keys_only=True)
        ndb.delete_multi(event_data)
        ndb.delete_multi(notifications)
        event_key.delete()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='poll/create',
                      http_method='POST', name='poll.create')
    def create_poll(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        data = json.loads(request.data)
        poll = Poll()
        poll.name = data["name"]
        if 'description' in data:
            poll.description = data["description"]
        poll.invited_org_tags = data["tags"]["org_tags"]
        poll.invited_event_tags = data["tags"]["event_tags"]
        poll.invited_perms_tags = data["tags"]["perms_tags"]
        poll.timestamp = datetime.datetime.now()
        poll.results_tags = ['council']
        poll.creator = request_user.key
        if 'show_names' in data:
            poll.show_names = bool(data["show_names"])
        if 'viewers' in data:
            poll.viewers = data["viewers"]
        poll.organization = request_user.organization
        # poll.time_start = datetime.datetime.strptime(data["time_start"], '%m/%d/%Y %I:%M %p')
        # poll.time_end = datetime.datetime.strptime(data["time_end"], '%m/%d/%Y %I:%M %p')
        key = poll.put()
        async_list = list()
        index = 0
        for question in data["questions"]:
            q = Question()
            q.worded_question = question["worded_question"]
            q.poll = key
            q.index = index
            index += 1
            q.choices = question["choices"]
            q.type = question["type"]
            async_list.append(q.put_async())
        users = get_users_from_tags(data["tags"], request_user.organization, False)
        notification = Notification()
        notification.content = request_user.first_name + " " + request_user.last_name + ' invited you to answer the poll: ' + poll.name
        notification.timestamp = datetime.datetime.now()
        notification.sender = request_user.key
        notification.type = 'poll'
        notification.link = 'app/polls/' + poll.key.urlsafe()
        notification.created_key = poll.key
        notification.put()
        send_email = True
        if 'send_email' in data:
            send_email = send_email['data']
        add_notification_to_users(notification, users)
        for item in async_list:
            poll.questions.insert(0, item.get_result())
        poll.put()
        return OutgoingMessage(error='', data=json_dump({'key': poll.key.urlsafe()}))

    # @endpoints.method(IncomingMessage, OutgoingMessage, path='poll/edit_question',
    #                   http_method='POST', name='poll.edit_question')
    # def edit_question(self, request):
    #     data = json.loads(request.data)
    #     question_future = ndb.Key(urlsafe=data["key"]).get_async()
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
    #         return OutgoingMessage(error=INCORRECT_PERMS, data='')
    #     question = question_future.get_result()
    #     question.worded_question = data["worded_question"]
    #     question.type = data["type"]
    #     question.choices = data["choices"]
    #     question.put()
    #     return OutgoingMessage(error='', data='OK')
    #

    #TEST ENDPOINTS
    @endpoints.method(IncomingMessage, OutgoingMessage, path='poll/edit_poll',
                      http_method='POST', name='poll.edit_poll')
    def edit_poll(self, request):
        data = json.loads(request.data)
        poll_future = ndb.Key(urlsafe=data["key"]).get_async()
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        poll = poll_future.get_result()
        if not request_user.organization == poll.organization:
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if 'close' in data and data["close"] is True:
            poll.open = False
            poll.put()
            return OutgoingMessage(error='', data='OK')
        if 'open' in data and data["open"] is True:
            poll.open = True
            poll.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='poll/answer_questions',
                      http_method='POST', name='poll.answer_questions')
    def answer_questions(self, request):
        data = json.loads(request.data)
        poll_key = ndb.Key(urlsafe=data["key"])
        poll_future = poll_key.get_async()
        questions_future = Question.query(Question.poll == poll_key).fetch_async()
        questions_list = list()
        for question in data["questions"]:
            questions_list.append(question["key"])
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        responses_future = Response.query(Response.poll == poll_key, Response.user == request_user.key).fetch_async()
        poll = poll_future.get_result()
        if not poll.organization == request_user.organization:
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not poll.open:
            return OutgoingMessage(error='POLL_CLOSED', data='')
        questions = questions_future.get_result()
        responses = responses_future.get_result()
        if responses:
            return OutgoingMessage(error='Results already submitted', data='')
        future_list = list()
        for question in questions:
            q = None
            for data_question in data["questions"]:
                if data_question["key"] == question.key.urlsafe():
                    q = data_question
                    break
            if not q:
                continue
            if 'new_response' in q:
                r = Response()
                if isinstance(q["new_response"], list):
                    r.answer = q["new_response"]
                else:
                    r.answer = [q["new_response"]]
                r.question = question.key
                r.poll = poll_key
                r.timestamp = datetime.datetime.now()
                r.user = request_user.key
                future_list.append(r.put_async())
        for item in future_list:
            item.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='poll/get_polls',
                      http_method='POST', name='poll.get_polls')
    def get_polls(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        events = Event.query(Event.going == request_user.key).fetch()
        event_tags = list()
        for event in events:
            event_tags.append(event.tag)
        if not request_user.tags:
            request_user.tags = ['@#$%^!^&*()%$#@!@#%^%^*^&*%#%$^']
        if event_tags:
            polls = Poll.query(ndb.AND(ndb.OR(Poll.invited_perms_tags == 'everyone',
                                              Poll.invited_org_tags.IN(request_user.tags),
                                              Poll.invited_perms_tags == request_user.perms,
                                              Poll.invited_event_tags.IN(event_tags),
                                              ),
                                       Poll.organization == request_user.organization)).fetch(20)
        else:
            polls = Poll.query(ndb.AND(ndb.OR(Poll.invited_perms_tags == 'everyone',
                                              Poll.invited_org_tags.IN(request_user.tags),
                                              Poll.invited_perms_tags == request_user.perms,
                                              ),
                                       Poll.organization == request_user.organization)).fetch(20)
        dict_polls = list()
        for poll in polls:
            add = poll.to_dict()
            add["key"] = poll.key
            dict_polls.append(add)
        return OutgoingMessage(error='', data=json_dump(dict_polls))



    @endpoints.method(IncomingMessage, OutgoingMessage, path='poll/more_polls',
                      http_method='POST', name='poll.more_polls')
    def more_polls(self, request):
        count = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        events = Event.query(Event.going == request_user.key).fetch()
        event_tags = list()
        for event in events:
            event_tags.append(event.tag)
        if not request_user.tags:
            request_user.tags = ['@#$%^!^&*()%$#@!@#%^%^*^&*%#%$^']
        if event_tags:
            polls = Poll.query(ndb.AND(ndb.OR(Poll.invited_perms_tags == 'everyone',
                                              Poll.invited_org_tags.IN(request_user.tags),
                                              Poll.invited_perms_tags == request_user.perms,
                                              Poll.invited_event_tags.IN(event_tags),
                                              ),
                                       Poll.organization == request_user.organization)).fetch(20 + count)
        else:
            polls = Poll.query(ndb.AND(ndb.OR(Poll.invited_perms_tags == 'everyone',
                                              Poll.invited_org_tags.IN(request_user.tags),
                                              Poll.invited_perms_tags == request_user.perms,
                                              ),
                                       Poll.organization == request_user.organization)).fetch(20 + count)
        dict_polls = list()
        for poll in polls:
            add = poll.to_dict()
            add["key"] = poll.key
            dict_polls.append(add)
        return OutgoingMessage(error='', data=json_dump(dict_polls))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='poll/get_poll_info',
                      http_method='POST', name='poll.get_poll_info')
    def get_poll_info(self, request):
        key = ndb.Key(urlsafe=json.loads(request.data)["key"])
        poll_future = key.get_async()
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        answers_future = Response.query(Response.poll == key, Response.user == request_user.key).fetch_async()
        poll = poll_future.get_result()
        if not poll.organization == request_user.organization:
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        answers = answers_future.get_result()
        out = poll.to_dict()
        out['key'] = poll.key.urlsafe()
        # responses = list()
        if len(answers) > 0:
            out["response_status"] = True
        # if not(poll.invited_org_tags in request_user.tags or request_user.perms in poll.invited_perms_tags or
        #     request_user.tags
        #TODO: check for users to be in the poll they are requesting

        questions = Question.query(Question.poll == key).fetch()
        question_list = list()
        for question in questions:
            q = question.to_dict()
            for response in answers:
                if question.key == response.question:
                    q['response'] = response.to_dict()
                    break
            q['key'] = question.key
            question_list.append(q)
        out["questions"] = question_list
        return OutgoingMessage(error='', data=json_dump(out))
        # if not check_if_user_in_tags(user=request_user, org_tags=Poll.invited_org_tags,
        #                              perms_tags=Poll.invited_perms_tags, event_tags=Poll.invited_event_tags):

    @endpoints.method(IncomingMessage, OutgoingMessage, path='poll/get_results',
                      http_method='POST', name='poll.get_results')
    def get_results(self, request):
        data = json.loads(request.data)
        poll_key = ndb.Key(urlsafe=data["key"])
        poll_future = poll_key.get_async()
        questions_future = Question.query(Question.poll == poll_key).fetch_async()
        responses_future = Response.query(Response.poll == poll_key).fetch_async()
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        # if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
        #     return OutgoingMessage(error=INCORRECT_PERMS, data='')
        poll = poll_future.get_result()
        if not poll.organization == request_user.organization:
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        questions = questions_future.get_result()
        responses = responses_future.get_result()
        out_results = []
        for question in questions:
            question_dict = question.to_dict()
            question_dict["responses"] = list()
            responses_list = list()
            if question.type == 'multiple_choice':
                results = dict()
                for choice in question.choices:
                    results[choice] = {'name': choice, 'count': 0}
                for response in responses:
                    if response.question == question.key:
                        r = response.to_dict()
                        del r["poll"]
                        del r["answer"]
                        if len(response.answer) > 0:
                            r["answer"] = response.answer[0]
                        responses_list.append({'text': r["answer"], 'key': response.user})
                        for a in response.answer:
                            results[a]['count'] += 1
                output = list()
                for key in results:
                    output.append(results[key])
                question_dict["response_data"] = output
            else:
                for response in responses:
                    if response.question == question.key:
                        r = response.to_dict()
                        del r["poll"]
                        del r["answer"]
                        if len(response.answer) > 0:
                            r["answer"] = response.answer[0]
                        responses_list.append({'text': r["answer"], 'key': response.user})
            question_dict["responses"] = responses_list
            out_results.append(question_dict)
        poll = poll.to_dict()
        poll['questions'] = out_results
        return OutgoingMessage(error='', data=json_dump(poll))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='poll/delete',
                      http_method='POST', name='poll.delete')
    def delete_poll(self, request):
        data = json.loads(request.data)
        poll_key = ndb.Key(urlsafe=data["key"])
        poll_future = poll_key.get_async()
        questions_future = Question.query(Question.poll == poll_key).fetch_async()
        responses_future = Response.query(Response.poll == poll_key).fetch_async()
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        poll = poll_future.get_result()
        if not poll.organization == request_user.organization:
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        questions = questions_future.get_result()
        responses = responses_future.get_result()
        for question in questions:
            question.key.delete()
        for response in responses:
            response.key.delete()
        notifications = Notification.query(Notification.created_key == poll.key).fetch(keys_only=True)
        ndb.delete_multi(notifications)
        poll.key.delete()
        return OutgoingMessage(error='', data='OK')

        # for question in question_list:
        #     responses = question["responses"].get_result()
        #     if question["question"].type == 'multiple':
        #         answer_list = list()
        #         for response in responses:
        # responses_future = Response.query(Response.question in poll.questions).fetch()













#     @endpoints.method(IncomingMessage, OutgoingMessage, path='info/load2/{user_name}/{token}',
#                       http_method='GET', name='info.load2')
#     def load_user_data2(self, request):
#         time_start = datetime.datetime.now()
#         logging.error('user and token: ' + str(request.user_name) + ' ' + str(request.token))
#         request_user = get_user(request.user_name, request.token)
#         if not request_user:
#             return OutgoingMessage(error=TOKEN_EXPIRED, data='')
#         out_data = dict()
#         out_data["perms"] = request_user.perms
#         out_data["accountFilledOut"] = bool(request_user.address and request_user.dob)
#         # line up all the queries
#         events_polls_future = Event.query(Event.going == request_user.key).fetch_async(projection=[Event.tag])
#         organization_users_future = User.query(User.organization == request_user.organization).fetch_async()
#         event_tag_list_future = Event.query(ndb.AND(Event.organization == request_user.organization,
#                                             Event.time_end < datetime.datetime.today() + relativedelta(months=1))
#                                             ).fetch_async(projection=[Event.going, Event.tag])

#         if len(request_user.tags) > 0:
#             events_future = Event.query(ndb.AND(Event.organization == request_user.organization,
#                                         ndb.OR(Event.org_tags.IN(request_user.tags),
#                                         Event.perms_tags == request_user.perms,
#                                         Event.perms_tags == 'everyone',
#                                         Event.going == request_user.key))).order(-Event.time_start).fetch_async(100)
#         else:
#             events_future = Event.query(ndb.AND(Event.organization == request_user.organization,
#                                         ndb.OR(Event.perms_tags == request_user.perms,
#                                         Event.perms_tags == 'everyone',
#                                         Event.going == request_user.key))).order(-Event.time_start).fetch_async(100)
#         organization_future = request_user.organization.get_async()
#         notification_count = 40
#         if request_user.new_notifications:
#             new_notification_future = Notification.query(Notification.key.IN(
#                 request_user.new_notifications)).order(-Notification.timestamp).fetch_async(40)
#         if request_user.new_notifications:
#             if len(request_user.new_notifications) >= 40:
#                 notification_count = 0
#             else:
#                 notification_count = 40 - len(request_user.new_notifications)
#         if request_user.notifications:
#             notifications_future = Notification.query(Notification.key.IN(
#                 request_user.notifications)).order(-Notification.timestamp).fetch_async(notification_count)
#         if request_user.hidden_notifications:
#             hidden_notifications_future = Notification.query(Notification.key.IN(
#                 request_user.hidden_notifications)).order(-Notification.timestamp).fetch_async(30)

# #part 1 of polls
#         events_polls = events_polls_future.get_result()
#         time_middle = datetime.datetime.now()
#         poll_event_tags = list()
#         for event in events_polls:
#             poll_event_tags.append(event.tag)
#         if not request_user.tags:
#             request_user.tags = ['@#$%^!^&*()%$#@!@#%^%^*^&*%#%$^']
#         if poll_event_tags:
#             polls_future = Poll.query(ndb.AND(ndb.OR(Poll.invited_perms_tags == 'everyone',
#                                               Poll.invited_org_tags.IN(request_user.tags),
#                                               Poll.invited_perms_tags == request_user.perms,
#                                               Poll.invited_event_tags.IN(poll_event_tags),
#                                               ),
#                                               Poll.organization == request_user.organization)).\
#                 order(-Poll.timestamp).fetch_async(100)
#         else:
#             polls_future = Poll.query(ndb.AND(ndb.OR(Poll.invited_perms_tags == 'everyone',
#                                               Poll.invited_org_tags.IN(request_user.tags),
#                                               Poll.invited_perms_tags == request_user.perms,
#                                               ),
#                                               Poll.organization == request_user.organization)).\
#                 order(-Poll.timestamp).fetch_async(100)
#         if request_user.tags == ['@#$%^!^&*()%$#@!@#%^%^*^&*%#%$^']:
#             request_user.tags = ['']
# #get results of queries
#         organization_users = organization_users_future.get_result()
#         event_tag_list = event_tag_list_future.get_result()
#         organization = organization_future.get_result()
#         events = events_future.get_result()
#         user_list = list()
#         alumni_list = list()
#         for user in organization_users:
#             user_dict = user.to_dict()
#             del user_dict["hash_pass"]
#             del user_dict["current_token"]
#             del user_dict["organization"]
#             del user_dict["timestamp"]
#             del user_dict["notifications"]
#             del user_dict["new_notifications"]
#             del user_dict["hidden_notifications"]
#             event_tags = list()
#             for event in event_tag_list:
#                 if user.key in event.going:
#                     event_tags.append(event.tag)
#             user_dict["event_tags"] = event_tags
#             user_dict["key"] = user.key.urlsafe()
#             if user.dob:
#                 user_dict["dob"] = user.dob.strftime("%m/%d/%Y")
#             else:
#                 del user_dict["dob"]
#             user_dict["key"] = user.key.urlsafe()
#             if user_dict["perms"] == 'alumni':
#                 alumni_list.append(user_dict)
#             else:
#                 user_list.append(user_dict)
#         out_data["directory"] = {'members': user_list, 'alumni': alumni_list}

#         # # tags section
#         # org_tags = organization.tags
#         # org_tags_list = list()
#         # for tag in request_user.recently_used_tags:
#         #     if tag in org_tags:
#         #         org_tags_list.append({"name": tag, "recent": True})
#         #         org_tags.remove(tag)
#         #     else:
#         #         request_user.recently_used_tags.remove(tag)
#         # for tag in org_tags:
#         #     org_tags_list.append({"name": tag, "recent": False})
#         # # events = event_tags_future.get_result()
#         # event_tags_list = list()
#         # for event in event_tag_list:
#         #     event_tags_list.append({"name": event.tag})
#         # perm_tags_list = [{"name": 'council'}, {"name": 'leadership'}, {"name": 'Everyone'}]
#         # out_data["tags"] = {'org_tags': org_tags_list, 'event_tags': event_tags_list, 'perms_tags': perm_tags_list}

#         # organization info
#         organization_data = dict(name=organization.name, school=organization.school)
#         organization_data["subscribed"] = organization.subscribed
#         organization_data["color"] = organization.color
#         try:
#             organization_data["image"] = images.get_serving_url(organization.image, secure_url=True)
#         except:
#             organization_data["image"] = ''
#         out_data["organization_data"] = organization_data

#         #events info
#         events_data = list()
#         for event in events:
#             dict_event = event.to_dict()
#             dict_event["tags"] = {"org_tags": event.org_tags, "perms_tags": event.perms_tags}
#             dict_event["key"] = event.key
#             events_data.append(dict_event)
#         out_data["events"] = events_data

#         #notifications info
#         out_notifications = list()
#         if request_user.new_notifications:
#             new_notifications = new_notification_future.get_result()
#             for notify in new_notifications:
#                 note = notify.to_dict()
#                 note["new"] = True
#                 note["key"] = notify.key.urlsafe()
#                 out_notifications.append(note)
#         if request_user.notifications:
#             notifications = notifications_future.get_result()
#             for notify in notifications:
#                 note = notify.to_dict()
#                 note["new"] = False
#                 note["key"] = notify.key.urlsafe()
#                 out_notifications.append(note)
#         out_hidden_notifications = list()
#         if request_user.hidden_notifications:
#             hidden_notifications = hidden_notifications_future.get_result()
#             for notify in hidden_notifications:
#                 note = notify.to_dict()
#                 note["key"] = notify.key.urlsafe()
#                 out_hidden_notifications.append(note)
#         out_data["notifications"] = {'notifications': out_notifications,
#                                      'hidden_notifications': out_hidden_notifications,
#                                      'notifications_length': len(request_user.notifications),
#                                      'hidden_notifications_length': len(request_user.hidden_notifications),
#                                      'new_notifications_length': len(request_user.new_notifications)}
#         org_tags_list = list()
#         # logging.error('recently used tags: ' + json_dump(request_user.recently_used_tags))
#         for tag in organization.tags:
#             if tag in request_user.recently_used_tags:
#                 org_tags_list.append({"name": tag, "recent": True})
#             else:
#                 org_tags_list.append({"name": tag, "recent": False})
#         event_tags_list = list()
#         for event in event_tag_list:
#             event_tags_list.append({"name": event.tag})
#         perm_tags_list = [{"name": 'council'}, {"name": 'leadership'}, {"name": 'Everyone'}]
#         out_data["tags"] = {'org_tags': org_tags_list, 'perms_tags': perm_tags_list, 'event_tags': event_tags_list}

# #part 2 of polls
#         dict_polls = list()
#         polls = polls_future.get_result()
#         for poll in polls:
#             add = poll.to_dict()
#             add["key"] = poll.key
#             dict_polls.append(add)
#         out_data["polls"] = dict_polls

#         time_end = datetime.datetime.now()
#         # logging.error('The time it took for initial load:: full time -' + str(time_end-time_start) + '   first half-' +
#         #               str(time_middle-time_start))
#         return OutgoingMessage(error='', data=json_dump(out_data))


    @endpoints.method(IncomingMessage, OutgoingMessage, path='link/get',
                      http_method='POST', name='link.get')
    def get_links(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        links = Link.query(Link.organization == request_user.organization).fetch()
        links_list = list()
        for link in links:
            temp = link.to_dict()
            temp['key'] = link.key.urlsafe()
            links_list.append(temp)
        return OutgoingMessage(error='', data=json_dump(links_list))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='link/create',
                      http_method='POST', name='link.create')
    def create_link(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        organization = request_user.organization.get()
        if not data['group'] in organization.link_groups:
            organization.link_groups.append(data['group'])
            organization.put()
        link = Link()
        link.link = data['link']
        link.title = data['title']
        link.group = data['group']
        link.organization = request_user.organization
        link.put()
        return OutgoingMessage(error='', data=json_dump(link.key.urlsafe()))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='link/edit',
                      http_method='POST', name='link.edit')
    def edit_link(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not 'key' in data:
            OutgoingMessage(error='Missing Key', data='')
        organization_future = request_user.organization.get_async()
        link = ndb.Key(urlsafe=data['key']).get()
        organization = organization_future.get_result()
        if 'title' in data:
            link.title = data['title']
        if 'link' in data:
            link.link = data['link']
        if 'group' in data:
            if not data['group'] in organization.link_groups:
                organization.link_groups.append(data['group'])
                organization.put()
            link.group = data['group']
        link.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='link/delete',
                      http_method='POST', name='link.delete')
    def delete_link(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not 'key' in data:
            return OutgoingMessage(error='Missing key', data='')
        ndb.Key(urlsafe=data['key']).delete()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='link/create_group',
                      http_method='POST', name='link.create_group')
    def create_link_group(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        organization = request_user.organization.get()
        if not data['group'] in organiation.link_groups:
            organization.link_groups.append(data['group'])
            organization.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='link/rename_group',
                      http_method='POST', name='link.create_group')
    def create_link_group(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        organization = request_user.organization.get()
        if not data['group'] in organization.link_groups and data['old_group'] in organization.link_groups:
            organization.link_groups.append(data['group'])
            organization.link_groups.remove(data['old_group'])
            organization.put()
            links = Link.query(Link.group == data['old_group'], Link.organization == request_user.organization).fetch()
            async_list = list()
            for link in links:
                link.group = data['group']
                async_list.append(link.put_async())
            for item in async_list:
                item.get_result()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error='Group not found', data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='link/delete_group',
                      http_method='POST', name='link.delete_group')
    def delete_link_group(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        organization = request_user.organization.get()
        if data['group'] in organization.link_groups:
            organization.link_groups.remove(data['group'])
            links = Link.query(Link.group == data['group'], Link.organization == request_user.organization).fetch(keys_only=True)
            async_list = list()
            for link in links:
                async_list.append(link.delete_async())
            for item in async_list:
                item.get_result()
            organization.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/set_iphone_token',
                      http_method='POST', name='user.set_iphone_token')
    def set_iphone_token(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not data in request_user.iphone_tokens:
            request_user.iphone_tokens.append(data)
            request_user.put()
        return OutgoingMessage(error='', data='OK')


    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/set_android_token',
                      http_method='POST', name='user.set_android_token')
    def set_android_token(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not data in request_user.android_tokens:
            request_user.android_tokens.append(data)
            request_user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/change_profile_image',
                      http_method='POST', name='user.change_profile_image')
    def set_android_token(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        img_data = data.img_data
        mime_type = data.mime
        createFile(request_user.user_name+'prof_pic')
        
        return OutgoingMessage(error='', data='OK')


APPLICATION = endpoints.api_server([RESTApi])


