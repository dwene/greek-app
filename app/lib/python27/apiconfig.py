import json
from protorpc import messages
from protorpc import message_types
from google.appengine.ext import ndb
from google.appengine.api import images
import endpoints
from ndbdatastore import *
import datetime
import hashlib
import uuid
import base64
from protorpc import remote
import json
from ndbdatastore import *
import cloudstorage as gcs
from google.appengine.api import mail
from google.appengine.ext import blobstore
from google.appengine.api import images
from google.appengine.api import taskqueue
from google.appengine.api import urlfetch
from google.appengine.datastore.datastore_query import Cursor
import string
import random
import logging
import hashlib

__author__ = 'Derek'
WEB_CLIENT_ID = 'greek-app'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
ANDROID_AUDIENCE = WEB_CLIENT_ID

# "Password Salt"
OLD_SALT = 'Mary had a little lamb, whose fleece was white as snow and everywhere that mary went the lamb was sure to go'
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
SUPER_PASSWORD = '80eec344-fc7a-4d75-b85d-cf757c76e2d2'


class IncomingMessage(messages.Message):
    user_name = messages.StringField(1)
    token = messages.StringField(2)
    data = messages.StringField(3)


class OutgoingMessage(messages.Message):
    error = messages.StringField(1)
    data = messages.StringField(2)

class DateEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ndb.Key):
            return obj.urlsafe()
        elif isinstance(obj, Cursor):
            return obj.urlsafe()
        elif hasattr(obj, 'isoformat'):
            return obj.isoformat()
        elif isinstance(obj, ndb.BlobKey):
            try:
                image_url = images.get_serving_url(obj, secure_url=True)
            except:
                image_url = ""
            return image_url
        else:
            return json.JSONEncoder.default(self, obj)


def get_image_url(image):
    try:
        image_url = images.get_serving_url(image, secure_url=True)
    except:
        image_url = ""
    return image_url


def is_admin(user):
    try:
        if user.perms == COUNCIL or user.perms == LEADERSHIP:
            return True
        return False
    except TypeError:
        print "Input was not ndb.User"


def json_dump(item):
    return json.dumps(item, cls=DateEncoder)


def ndb_to_json(item):
    _dictionary = item.to_dict()
    _dictionary["key"] = item.key
    return json_dump(_dictionary)

def ndb_to_dict(item):
    _dictionary = item.to_dict()
    _dictionary["key"] = item.key
    return (_dictionary)

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


def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def set_profile_picture(filename, data, crop_data):
    # Create a GCS file with GCS client.
    image = base64.b64decode(str(data))
    real_filename = '/greek-app.appspot.com/prof_pic/'+filename
    blobstore_filename = '/gs' + real_filename
    img = images.Image(image_data=image)
    left = float(crop_data['x'])/float(crop_data['bx'])
    right = float(crop_data['x2'])/float(crop_data['bx'])
    top = float(crop_data['y'])/float(crop_data['by'])
    bottom = float(crop_data['y2'])/float(crop_data['by'])
    if crop_data:
        img.crop(left_x=left,
            right_x=right,
            top_y=top,
            bottom_y=bottom)
    img.resize(width=600, height=600)
    img.im_feeling_lucky()
    thumbnail = img.execute_transforms(output_encoding=images.PNG)
    with gcs.open(real_filename, 'w', content_type='image/png') as f:
        f.write(thumbnail)
    return blobstore.create_gs_key(blobstore_filename)



def member_signup_email(user, token):
    signup_link = DOMAIN+'/#/newuser/'+token
    subject = "Registration for NeteGreek App!"
    body = "Hello!\n"
    body += "Your account has been created! To finish setting up your NeteGreek account please follow the link below.\n"
    body += signup_link + "\n\n -NeteGreek Team"
    message = dict()
    message["body"] = body
    message["subject"] = subject
    message["from_email"] = 'NeteGreek <support@netegreek.com>'
    message["to_email"] = user['email']
    return message

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


def send_email(from_email, to_email, subject, body, reply_to):
    full_body = body
    msg = mail.EmailMessage()
    msg.body = full_body
    msg.subject = subject
    msg.to = to_email
    msg.sender = from_email
    if reply_to:
        msg.reply_to = reply_to
    try:
        msg.send()
    except:
        send_mandrill_email(from_email, to_email, subject, full_body)


def removal_email(user):
    return


def forgotten_password_email(user):
    to_email = user.email
    from_email = 'NeteGreek <support@netegreek.com>'
    subject = 'NeteGreek Password Reset'
    token = generate_token() + user.user_name
    user.current_token = token
    user.put()
    link = DOMAIN + '/#/changepasswordfromtoken/' + token
    body = 'NeteGreek Password Reset\n\n'
    body += 'Please follow the link to reset your password for the NeteGreek app.\n' + link + '\n\n\nHave a great day!\n\nNeteGreek Team'
    send_email(from_email, to_email, subject, body, from_email)

def check_form_status(user):
    if user:
        if user.address and user.state and user.dob and user.city and user.major:
            return True
        return False


def username_available(user_name):
    if User.query(User.user_name == user_name.lower()).get():
        return False
    elif len(user_name) < 5:
        return False
    else:
        return True


def generate_token():
    return ''.join(random.choice(string.ascii_uppercase + string.digits + string.ascii_lowercase) for _ in range(128))


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


def hash_password(password, user_name):
    h1 = hashlib.sha224(password+OLD_SALT).hexdigest()
    return hashlib.sha224(h1+user_name).hexdigest()