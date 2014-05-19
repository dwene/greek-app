import endpoints
import logging
import datetime
import hashlib
import uuid
from protorpc import messages
from protorpc import message_types
from protorpc import remote
import json
from google.appengine.ext import ndb
import time
from endpoints_proto_datastore.ndb import EndpointsModel
import collections


WEB_CLIENT_ID = 'greek-app'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
ANDROID_AUDIENCE = WEB_CLIENT_ID

"""error codes for returning errors"""
ERROR_BAD_ID = 'BAD_TOKEN'


class IncomingMessage(messages.Message):
    user_name = messages.StringField(1)
    token = messages.StringField(2)
    blob = messages.StringField(3)

class OutgoingMessage(messages.Message):
    error = messages.StringField(1)
    blob = messages.StringField(2)

"""MODELS"""
class User(ndb.Model):
    user_name = ndb.StringProperty()
    hash_pass = ndb.StringProperty()
    current_token = ndb.StringProperty()
    previous_token = ndb.StringProperty()
    timestamp = ndb.DateTimeProperty()
    first_name = ndb.StringProperty()
    last_name = ndb.StringProperty()
    email = ndb.StringProperty()
    dob = ndb.DateProperty()
    address = ndb.StringProperty()
    city = ndb.StringProperty()
    state = ndb.StringProperty()
    zip = ndb.IntegerProperty()
    phone = ndb.IntegerProperty()
    class_year = ndb.IntegerProperty()
    is_alumni = ndb.BooleanProperty()
    organization = ndb.KeyProperty()

class Organization(ndb.Model):
    name = ndb.StringProperty()
    school = ndb.StringProperty()



def dumpJSON(item):
    dthandler = lambda obj: (
        obj.isoformat()
        if isinstance(obj, datetime.datetime)
        or isinstance(obj, datetime.date)
        else None)
    logging.debug(item)
    return json.dumps(item, dthandler)

def check_auth(message):
    user = User.fetch(User.user_name == message.user_name)
    if user.current_token == message.token:
        return user.key
    else:
        return False


def get_key_from_token(token):
    user = User.query().filter(User.current_token == token).get()
    if user:
        return user.key
    return 0

@endpoints.api(name='netegreek', version='v1', allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE])
class RESTApi(remote.Service):
    USER_TOKEN = endpoints.ResourceContainer(message_types.VoidMessage, token=messages.StringField(1,
                                              variant=messages.Variant.STRING))

    ORG_IN = endpoints.ResourceContainer(IncomingMessage,
                                        user_name=messages.StringField(1, variant=messages.Variant.STRING),
                                        token=messages.StringField(2, variant=messages.Variant.STRING),
                                        blob=messages.StringField(3, variant=messages.Variant.STRING))
    """USER REQUESTS"""
    @endpoints.method(ORG_IN, OutgoingMessage, path='auth/register',
                      http_method='POST', name='auth.register')
    def register_organization(self, request):
        clump = json.loads(request.blob)
        new_org = Organization(name=clump.organization.name, school=clump.organization.school)
        new_org.put()
        new_user = User(user_name=clump.user.user_name)
        new_user.hash_pass = hashlib.sha224(clump.user.password + "we will we will rock you rock you, we will we will"
                                                                  " rock you rock you. buddy.").hexdigest()
        new_user.first_name = clump.user.first_name
        new_user.last_name = clump.user.last_name
        new_user.email = clump.user.email
        new_user.organization = new_org.key
        new_user.put()
        return OutgoingMessage(error='', blob='OK')
"""
    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/register',
                      http_method='POST', name='auth.register')
    def add_users(self, request):

        user = User()
        user.user_name = request.user_name
        user.first_name = request.first_name
        user.last_name = request.last_name
        user.email = request.email
        user.hash_pass = hashlib.sha224(request.password + "this is a random string to help in the salting progress "
                                                           "blah").hexdigest()
        user.current_token = str(uuid.uuid4())
        user.time_stamp = datetime.datetime.now()
        user.put()
        time.sleep(.25)
        try:
            return UserCreds(current_token=user.current_token, first_name=user.first_name, last_name=user.last_name)
        except:
            return OutgoingMessage(message='error')

    @endpoints.method(USER_PASS, UserCreds, path='auth/login/{user_name}/{password}',
                      http_method='GET', name='auth.login')
    def login_user(self, request):
        user = User.query().filter(User.user_name == request.user_name).get()
        logging.error(user)
        if user:
            if user.hash_pass == hashlib.sha224(request.password + "this is a random string to help in the salting"
                                                                   " progress blah").hexdigest():
                user.current_token = str(uuid.uuid4())
                user.time_stamp = datetime.datetime.now()
                user.put()
                time.sleep(.5)
                return UserCreds(current_token=user.current_token, first_name=user.first_name, last_name=user.last_name)

        return OutgoingMessage(message='error')
"""
APPLICATION = endpoints.api_server([RESTApi])
