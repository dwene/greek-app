import json
from protorpc import messages
from protorpc import message_types
from google.appengine.ext import ndb
from google.appengine.api import images
import endpoints
from ndbdatastore import *
import datetime


__author__ = 'Derek'
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



def is_admin(user):
    try:
        if user.perms is COUNCIL or user.perms is LEADERSHIP:
            return True
        return False
    except TypeError:
        print "Input was not ndb.User"


def json_dump(item):
    return json.dumps(item, cls=DateEncoder)



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
