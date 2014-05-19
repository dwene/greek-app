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

# TODO: Replace the following lines with client IDs obtained from the APIs
# Console or Cloud Console.
WEB_CLIENT_ID = 'testtodolist007'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
ANDROID_AUDIENCE = WEB_CLIENT_ID


class Response(messages.Message):
    """Greeting that stores a message."""
    message = messages.StringField(1)

class UserCreds(messages.Message):
    user_name = messages.StringField(1)
    password = messages.StringField(2)
    email = messages.StringField(3)
    first_name = messages.StringField(4)
    last_name = messages.StringField(5)
    current_token = messages.StringField(6)

class ListItem(ndb.Model):
    title = ndb.StringProperty()
    checked = ndb.BooleanProperty(default=False)
    timestamp = ndb.DateTimeProperty()
    user_key = ndb.KeyProperty()

class User(ndb.Model):
    user_name = ndb.StringProperty()
    hash_pass = ndb.StringProperty()
    first_name = ndb.StringProperty()
    email = ndb.StringProperty()
    last_name = ndb.StringProperty()
    current_token = ndb.StringProperty()
    previous_token = ndb.StringProperty()
    time_stamp = ndb.DateTimeProperty()

def dumpJSON(item):
    dthandler = lambda obj: (
        obj.isoformat()
        if isinstance(obj, datetime.datetime)
        or isinstance(obj, datetime.date)
        else None)
    logging.debug(item)
    return json.dumps(item, dthandler)

def get_key_from_token(token):
    user = User.query().filter(User.current_token == token).get()
    if user:
        return user.key
    return 0


def itemListToJSON(token):

    dthandler = lambda obj: (
        obj.isoformat()
        if isinstance(obj, datetime.datetime)
        or isinstance(obj, datetime.date)
        else None)
    try:
        itemlist = ListItem.query().filter(ListItem.user_key == get_key_from_token(token)).fetch(projection=[ListItem.title, ListItem.checked, ListItem.timestamp])
        printlist = []
        for item in itemlist:
            printlist.append({'id': item.key.urlsafe(), 'title': item.title, 'checked': item.checked,
                            'timestamp': item.timestamp.isoformat()})
        logging.error('I made it')
        logging.error(printlist)
        return json.dumps(printlist, dthandler)
        return 'error'
    except:
        return 'error'


@endpoints.api(name='todolist', version='v1', allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE])
class RESTApi(remote.Service):
    USER_TOKEN = endpoints.ResourceContainer(message_types.VoidMessage, token=messages.StringField(1,
                                              variant=messages.Variant.STRING))

    """TODO REQUESTS"""
    @endpoints.method(USER_TOKEN, Response, path='getlist/{token}', http_method='GET', name='listItem.getList')
    def greeting_get(self, request):
        return Response(message=itemListToJSON(request.token))


    ADD_ITEM = endpoints.ResourceContainer(message_types.VoidMessage,
                                           token=messages.StringField(1, variant=messages.Variant.STRING),
                                           title=messages.StringField(2, variant=messages.Variant.STRING))

    @endpoints.method(ADD_ITEM, Response, path='addItem/{token}/{title}', http_method='POST', name='listItem.addItem')
    def add_item(self, request):
        key = get_key_from_token(request.token)
        if key != 0:
            newitem = ListItem(title=request.title, timestamp=datetime.datetime.now(), user_key=key)
            newitem.put()
        printitem = {'id': newitem.key.urlsafe(), 'timestamp': newitem.timestamp.isoformat()}
        return Response(message=dumpJSON(printitem))

    ID_RESOURCE = endpoints.ResourceContainer(message_types.VoidMessage,
                                              id=messages.StringField(2, variant=messages.Variant.STRING),
                                              token=messages.StringField(1, variant=messages.Variant.STRING))

    @endpoints.method(ID_RESOURCE, Response, path='checkItem/{token}/{id}', http_method='POST', name='listItem.checkItem')
    def check_item(self, request):
        key = ndb.Key(urlsafe=request.id)
        item = key.get()
        if item.checked:
            item.checked = False
        else:
            item.checked = True
        item.put()
        return Response(message='ok')

    @endpoints.method(ID_RESOURCE, Response, path='removeItem/{token}/{id}', http_method='DELETE', name='listItem.removeItem')
    def remove_item(self, request):
        try:
            key = ndb.Key(urlsafe=request.id)
            item = key.get()
            item.key.delete()
            return Response(message='ok')
        except:
            return Response(message='error')

    @endpoints.method(USER_TOKEN, Response, path='deleteChecked/{token}', http_method='DELETE', name='listItem.deleteChecked')
    def delete_checked(self, request):
        key = get_key_from_token(request.token)
        items = ListItem.query(ListItem.user_key == key).filter(ListItem.checked == True).fetch()
        logging.error(items)
        for item in items:
            item.key.delete()
        return Response(message='ok')


    """USER REQUESTS"""

    USER_PASS = endpoints.ResourceContainer(message_types.VoidMessage
                                            , user_name=messages.StringField(1, variant=messages.Variant.STRING)
                                            , password=messages.StringField(2, variant=messages.Variant.STRING))

    REGISTER = endpoints.ResourceContainer(UserCreds)
    @endpoints.method(REGISTER, UserCreds, path='auth/register',
                      http_method='POST', name='auth.register')
    def register_user(self, request):
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
            return Response(message='error')

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

        return Response(message='error')

APPLICATION = endpoints.api_server([RESTApi])
