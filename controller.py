import sys
import endpoints
import logging
import datetime
import hashlib
import uuid
import braintree
import requests
from protorpc import messages
from protorpc import message_types
from protorpc import remote
import json
import pickle
from google.appengine.ext import ndb
import time
import collections
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


EVERYONE = 'Everyone'

class IncomingMessage(messages.Message):
    user_name = messages.StringField(1)
    token = messages.StringField(2)
    data = messages.StringField(3)


class OutgoingMessage(messages.Message):
    error = messages.StringField(1)
    data = messages.StringField(2)

# MODELS


class User(ndb.Model):
    #login stuff
    user_name = ndb.StringProperty()
    hash_pass = ndb.StringProperty()
    current_token = ndb.StringProperty()
    timestamp = ndb.DateTimeProperty()
    #general information
    first_name = ndb.StringProperty()
    last_name = ndb.StringProperty()
    dob = ndb.DateProperty()
    #school/work status
    major = ndb.StringProperty()
    occupation = ndb.StringProperty()
    employer = ndb.StringProperty()
    class_year = ndb.IntegerProperty()
    grad_month = ndb.IntegerProperty()
    grad_year = ndb.IntegerProperty()
    pledge_class = ndb.StringProperty()
    #address stuff
    address = ndb.StringProperty()
    city = ndb.StringProperty()
    state = ndb.StringProperty()
    zip = ndb.IntegerProperty()
    perm_address = ndb.StringProperty()
    perm_city = ndb.StringProperty()
    perm_state = ndb.StringProperty()
    perm_zip = ndb.IntegerProperty()
    #contact info
    email = ndb.StringProperty()
    phone = ndb.StringProperty()
    facebook = ndb.StringProperty()
    twitter = ndb.StringProperty()
    instagram = ndb.StringProperty()
    linkedin = ndb.StringProperty()
    website = ndb.StringProperty()
    #netegreek info
    organization = ndb.KeyProperty()
    tags = ndb.StringProperty(repeated=True)
    perms = ndb.StringProperty()
    prof_pic = ndb.BlobKeyProperty()
    status = ndb.StringProperty()
    position = ndb.StringProperty()
    notifications = ndb.KeyProperty(repeated=True)
    new_notifications = ndb.KeyProperty(repeated=True)
    hidden_notifications = ndb.KeyProperty(repeated=True)
    sent_notifications = ndb.KeyProperty(repeated=True)
    events = ndb.KeyProperty(repeated=True)


class Notification(ndb.Model):
    title = ndb.StringProperty()
    type = ndb.StringProperty()
    content = ndb.TextProperty()
    sender = ndb.KeyProperty()
    sender_name = ndb.StringProperty()
    timestamp = ndb.DateTimeProperty()
    link = ndb.StringProperty()


class Event(ndb.Model):
    title = ndb.StringProperty()
    description = ndb.TextProperty()
    time_start = ndb.DateTimeProperty()
    time_end = ndb.DateTimeProperty()
    time_created = ndb.DateTimeProperty()
    creator = ndb.KeyProperty()
    tag = ndb.StringProperty()
    going = ndb.KeyProperty(repeated=True)
    org_tags = ndb.StringProperty(repeated=True)
    perms_tags = ndb.StringProperty(repeated=True)
    not_going = ndb.KeyProperty(repeated=True)
    images = ndb.BlobKeyProperty(repeated=True)
    organization = ndb.KeyProperty()
    attendance_data = ndb.KeyProperty(repeated=True)


class AttendanceData(ndb.Model):
    user = ndb.KeyProperty()
    time_in = ndb.DateTimeProperty()
    time_out = ndb.DateTimeProperty()
    event = ndb.KeyProperty()
    note = ndb.StringProperty()


class Organization(ndb.Model):
    name = ndb.StringProperty()
    school = ndb.StringProperty()
    type = ndb.StringProperty()
    tags = ndb.StringProperty(repeated=True)
    subscribed = ndb.BooleanProperty(default=False)
    subscription_id = ndb.StringProperty()
    customer_id = ndb.StringProperty()
    payment_token = ndb.StringProperty()
    cancel_subscription = ndb.DateProperty(default=datetime.date(5000, 01, 01))
    trial_period = ndb.BooleanProperty(default=True)
    cost = ndb.FloatProperty(default=1.0)

class CST(datetime.tzinfo):
    def utcoffset(self, dt):
        return datetime.timedelta(hours=-5)

    def dst(self, dt):
        return datetime.timedelta(0)


class DateEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        elif isinstance(obj, ndb.Key):
            return obj.urlsafe()
        elif isinstance(obj, ndb.BlobKey):
            return images.get_serving_url(obj, secure_url=True)
        else:
            return json.JSONEncoder.default(self, obj)


def member_signup_email(user, request_user):
    to_email = [{'email': user['email'], 'type': 'to', 'name': user['first_name']}]
    token = request_user.organization.get().name
    token += user['last_name']
    token += generate_token()
    token = token.replace(" ", "")
    user['token'] = token
    logging.error(token)
    signup_link = 'https://greek-app.appspot.com/#/newuser/'+token
    from_email = 'netegreek@greek-app.appspotmail.com'
    subject = "Registration for NeteGreek App!"
    body = "Hello!\n"
    body += "Your account has been created! To finish setting up your NeteGreek account please follow the link below.\n"
    body += signup_link + "\n\n -NeteGreek Team"
    to_send = {}
    to_send["key"] = 'y8EslL_LZDf4__hJZbbMAQ'
    message = {}
    message["text"] = body
    message["subject"] = subject
    message["from_email"] = 'support@netegreek.com'
    message["from_name"] = 'NeteGreek'
    message["to"] = to_email
    to_send["message"] = message
    json_data = json.dumps(to_send)
    ret_data = {'json_data': json_data, 'user': user}
    return ret_data


def alumni_signup_email(user, request_user):
    to_email = [{'email': user['email'], 'type': 'to'}]
    org = request_user.organization.get()
    token = org.name
    token += user['email']
    token = token.replace("@", "")
    token = token.replace(".", "")
    token += generate_token()
    token = token.replace(" ", "")
    user['token'] = token
    signup_link = 'https://greek-app.appspot.com/#/newuser/'+token
    subject = "Registration for NeteGreek App!"
    body = "Hello!\n"
    body += org.name + " at " + org.school + "has requested to add you to their database of alumni. If you would like" \
                                             " to add yourself please go to the following link\n"
    body += signup_link + "\n\n -NeteGreek Team"
    to_send = {}
    to_send["key"] = 'y8EslL_LZDf4__hJZbbMAQ'
    message = {}
    message["text"] = body
    message["subject"] = subject
    message["from_email"] = 'support@netegreek.com'
    message["from_name"] = 'NeteGreek'
    message["to"] = to_email
    to_send["message"] = message
    json_data = json.dumps(to_send)
    ret_data = {'json_data': json_data, 'user': user}
    return ret_data


def send_mandrill_email(from_email, to_emails, subject, body):
    to_send = {}
    to_send["key"] = 'y8EslL_LZDf4__hJZbbMAQ'
    message = {}
    message["text"] = body
    message["subject"] = subject
    message["from_email"] = from_email
    message["from_name"] = 'NeteGreek'
    message["to"] = to_emails
    to_send["message"] = message
    json_data = json.dumps(to_send)
    result = urlfetch.fetch(url='https://mandrillapp.com/api/1.0//messages/send.json',
                            payload=json_data,
                            method=urlfetch.POST,
                            headers={'Content-Type': 'application/json'})
    return


def removal_email(user):
    to_email = [{'email': user.email, 'type': 'to', 'name': user.first_name}]
    from_email = 'support@netegreek.com'
    subject = 'Removal from NeteGreek App'
    body = "Hello\n"
    body += "This if a notice that you have been removed from the organization '" + user.organization.get().name
    body += "' Please email your NeteGreek administrators for more information\n"
    body += "Have a great day\n\n"
    body += "NeteGreek Team"
    send_mandrill_email(from_email, to_email, subject, body)


def notification_email(title, content, sender, email):
    subject = "NeteGreek Notification: " + title
    body = content
    body += '\nSender: ' + sender
    mail.send_mail('support@netegreek.com', email, subject, body)


def forgotten_password_email(user):
    to_email = [{'email': user.email, 'type': 'to', 'name': user.first_name}]
    from_email = 'support@netegreek.com'
    subject = 'NeteGreek Password Reset'
    token = generate_token()
    user.current_token = token
    user.put()
    link = 'https://greek-app.appspot.com/?token='+token+'#/changepasswordfromtoken'
    logging.error(link)
    body = 'Hello\n'
    body += 'Please follow the link to reset your password. If you believe you are receiving this email in '
    body += 'error please contact your NeteGreek administrator.\n'+ link + '\nHave a great day!\nNeteGreek Team'
    send_mandrill_email(from_email, to_email, subject, body)


def check_form_status(user):
    if user:
        if user.address and user.state and user.dob and user.city and user.major:
            return True
        return False


def json_dump(item):
    return json.dumps(item, cls=DateEncoder)


def wait_for_replies(rpcs):
    error = []
    sent = []
    for item in rpcs:
        try:
            result = item['rpc'].get_result()
            text = result.content
            contents = json.loads(result.content)
            logging.error(contents)
            for content in contents:
                if content['status'] == 'error':
                    error.append(item['user'])
                    logging.error('Im being added to error list')
                else:
                    sent.append(item['user'])
                    logging.error('Im being added to sent list')
        except:
            error.append(item['user'])
    return {'errors': error, 'sent': sent}


# Use a helper function to define the scope of the callback.


def check_if_info_set(key):
    return True


def get_user(user_name, token):
    user = User.query(User.user_name == user_name).get()
    if not user:
        return None
    dt = (datetime.datetime.now() - user.timestamp)
    if user.current_token == token and dt.days < 3:
        return user
    else:
        return None


def username_available(user_name):
    if User.query(User.user_name == user_name).get():
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
    # org_tag_users = []
    # event_tag_users = []
    # perms_tag_users = []
    out_list = []
    _keys_only = False
    if keys_only:
        _keys_only = True
    if "org_tags" in tags and len(tags["org_tags"]):
        org_tag_users_future = User.query(ndb.AND(User.tags.IN(tags["org_tags"]),
                                                  User.organization == organization)).fetch_async(keys_only=True)
    if "perms_tags" in tags and len(tags["perms_tags"]):
        if "everyone" in tags["perms_tags"] or "Everyone" in tags["perms_tags"]:
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
        event_tag_users = events_future.get_result()
        users = []
        for event in event_tag_users:
            users = users + list(set(event) - set(out_list))

    if not _keys_only:
        out_list = ndb.get_multi(out_list)
    logging.error(out_list)
    return out_list


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
            subscription_result = braintree.Subscription.create({
                "payment_method_token": organization.payment_token,
                "plan_id": "normal_monthly_plan",
                "trial_period": False,
                "price": str(float(user_count) * float(organization.cost))
            })
        if not subscription_result.is_success:
            organization.put()
            return OutgoingMessage(error='SUBSCRIPTION_ERROR', data=subscription_result.message)
        organization.subscription_id = subscription_result.subscription.id
        organization.subscribed = True
        organization.trial_period = False
        organization.cancel_subscription = datetime.date(5000, 01, 01)
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
            logging.error(subscription)
            logging.error(organization.subscription_id)
            message["paid_through_date"] = subscription.paid_through_date
            message["subscription_price"] = str(subscription.price)
            message["next_billing_date"] = subscription.next_billing_date
        else:
            message["no_subscription"] = True
            message["premium_end"] = organization.cancel_subscription
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
        return OutgoingMessage(error='', data=json_dump(organization.subscribed))

    # USER REQUESTS

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/register_organization',
                      http_method='POST', name='auth.register_organization')
    def register_organization(self, request):
        try:
            clump = json.loads(request.data)
            logging.error(clump)
            new_org = Organization(name=clump['organization']['name'], school=clump['organization']['school'])
            new_org.put()
            user = clump['user']
            if username_available(user['user_name']):
                new_user = User(user_name=user['user_name'])
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
            return OutgoingMessage(error='', data=json_dump({'token': new_user.current_token, 'perms': new_user.perms}))
        except:
            return OutgoingMessage(error=INVALID_FORMAT + ": " + str(request.data))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='organization/info',
                      http_method='POST', name='auth.organization_info')
    def organization_info(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization = request_user.organization.get()
        out = dict(name=organization.name, school=organization.school)
        out["paid"] = organization.paid
        return OutgoingMessage(error='', data=json_dump(out))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/login',
                      http_method='POST', name='auth.login')
    def login(self, request):
        clump = json.loads(request.data)
        user_name = clump['user_name']
        password = clump['password']
        user = User.query(User.user_name == user_name).get()
        if user and user.hash_pass == hashlib.sha224(password + SALT).hexdigest():
            dt = (datetime.datetime.now() - user.timestamp)
            if dt.seconds/60/60 > 18:
                user.current_token = generate_token()
            user.timestamp = datetime.datetime.now()
            user.put()
            return_item = {'token': user.current_token, 'perms': user.perms}
            return OutgoingMessage(data=json_dump(return_item), error='')
        return OutgoingMessage(error=ERROR_BAD_ID, data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/add_users',
                      http_method='POST', name='auth.add_users')
    def add_users(self, request):

        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        clump = json.loads(request.data)
        logging.error(clump)
        rpcs = []
        for user in clump['users']:
            email_item = member_signup_email(user, request_user)
            rpc = urlfetch.create_rpc()
            urlfetch.make_fetch_call(rpc=rpc,
                                     url='https://mandrillapp.com/api/1.0/messages/send.json',
                                     payload=email_item['json_data'],
                                     method=urlfetch.POST,
                                     headers={'Content-Type': 'application/json'})
            rpcs.append({'rpc': rpc, 'user': email_item['user']})
        rpc_data = wait_for_replies(rpcs)

        for user in rpc_data['sent']:
            new_user = User()
            new_user.email = user['email']
            new_user.organization = request_user.organization
            new_user.user_name = ''
            new_user.current_token = user['token']
            new_user.first_name = user['first_name']
            new_user.last_name = user['last_name']
            new_user.class_year = int(user['class_year'])
            new_user.perms = 'member'
            new_user.put()

        to_send = json_dump({'errors': rpc_data['errors']})
        return OutgoingMessage(error='', data=to_send)





    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/add_alumni',
                      http_method='POST', name='auth.add_alumni')
    def add_alumni(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        clump = json.loads(request.data)
        logging.error(clump)
        rpcs = []
        for user in clump['users']:
            email_item = alumni_signup_email(user, request_user)
            rpc = urlfetch.create_rpc()
            urlfetch.make_fetch_call(rpc=rpc,
                                     url='https://mandrillapp.com/api/1.0/messages/send.json',
                                     payload=email_item['json_data'],
                                     method=urlfetch.POST,
                                     headers={'Content-Type': 'application/json'})
            rpcs.append({'rpc': rpc, 'user': email_item['user']})
        rpc_data = wait_for_replies(rpcs)

        for user in rpc_data['sent']:
            new_user = User()
            new_user.email = user['email']
            if 'first_name' in user:
                new_user.first_name = user['first_name']
            if 'last_name' in user:
                new_user.last_name = user['last_name']
            new_user.organization = request_user.organization
            new_user.user_name = ''
            new_user.current_token = user['token']
            new_user.perms = 'alumni'
            new_user.put()

        to_send = json_dump({'errors': rpc_data['errors']})
        return OutgoingMessage(error='', data=to_send)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/get_users',
                      http_method='POST', name='auth.get_users')
    def get_users(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS)

        organization_users = User.query(User.organization == request_user.organization).fetch()
        user_list = []
        alumni_list = []
        return_object = ''
        for user in organization_users:
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            del user_dict["timestamp"]
            del user_dict["prof_pic"]
            user_dict["key"] = user.key.urlsafe()
            if user_dict["perms"] == 'alumni':
                alumni_list.append(user_dict)
            else:
                user_list.append(user_dict)
            return_object = json_dump({'members': user_list, 'alumni': alumni_list})
        return OutgoingMessage(error='', data=return_object)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/remove_user',
                      http_method='POST', name='auth.remove_user')
    def remove_user(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        logging.error(request.data)
        user_info = json.loads(request.data)
        logging.error(user_info)
        user_to_remove = ndb.Key(urlsafe=user_info["key"]).get()
        if user_to_remove:
            removal_email(user_to_remove)
            user_to_remove.key.delete()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=INVALID_USERNAME, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/new_user',
                      http_method='POST', name='auth.new_user')
    def register_user(self, request):
        logging.error(request.token)
        user = User.query(User.current_token == request.token).get()
        logging.error(user)
        if user and user.user_name == '':
            user_dict = user.to_dict()
            logging.error(user_dict)
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            return OutgoingMessage(error='', data=json_dump(user_dict))
        return OutgoingMessage(error=BAD_FIRST_TOKEN, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/register_credentials',
                      http_method='POST', name='auth.register_credentials')
    def add_credentials(self, request):
        data = json.loads(request.data)
        user = User.query(User.current_token == request.token).get()
        if user and user.user_name == '':
            if not username_available(data["user_name"]):
                return OutgoingMessage(error='INVALID_USERNAME')
            if not len(data["password"]) >= 6:
                return OutgoingMessage(error='INVALID_PASSWORD')
            user.user_name = data["user_name"]
            user.hash_pass = hashlib.sha224(data["password"] + SALT).hexdigest()
            user.current_token = generate_token()
            user.timestamp = datetime.datetime.now()
            user.put()
            return OutgoingMessage(error='', data=json_dump({'token': user.current_token, 'perms': user.perms}))
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
        del user_dict["hidden_notifications"]
        user_dict["key"] = request_user.key.urlsafe()
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
        logging.error(request_object["key"])
        user = ndb.Key(urlsafe=request_object["key"]).get()
        if not user:
            return OutgoingMessage(error=INVALID_USERNAME, data='')
        if request_object["perms"] not in ["leadership", "council", "member"]:
            return OutgoingMessage(error=INVALID_FORMAT, data='')
        user.perms = request_object["perms"]
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/update_user_directory_info',
                      http_method='POST', name='user.update_user_directory_info')
    def update_user_directory_info(self, request):
        user = User.query(User.user_name == request.user_name).get()
        logging.error(user)
        user_data = json.loads(request.data)
        logging.error(user_data)
        for key, value in user_data.iteritems():
            logging.error(key + " " + str(value))
            if not value:
                continue
            if key == "email":
                user.email = value
            elif key == "first_name":
                user.first_name = value
            elif key == "last_name":
                user.last_name = value
            elif key == "dob":
                user.dob = datetime.datetime.strptime(value, '%Y-%m-%d')
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
            elif key == "phone":
                user.phone = value
            elif key == "facebook":
                user.facebook = value
            elif key == "instagram":
                user.instagram = value
            elif key == "twitter":
                user.twitter = value
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
        user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/forgot_password',
                      http_method='POST', name='auth.forgot_password')
    def forgot_password(self, request):
        user_data = json.loads(request.data)
        if len(user_data["email"]) > 1:
            user = User.query(User.email == user_data["email"]).get()
        elif user_data["user_name"]:
            user = User.query(User.user_name == user_data["user_name"]).get()
        if not user:
            return OutgoingMessage(error=INVALID_EMAIL, data='')
        forgotten_password_email(user)
        return OutgoingMessage(error='', data='OK')

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
        logging.error(new_pass)
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/directory',
                      http_method='POST', name='auth.directory')
    def directory(self, request):
        user = get_user(request.user_name, request.token)
        if not user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization_users = User.query(User.organization == user.organization).fetch()
        user_list = []
        alumni_list = []
        for user in organization_users:
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            del user_dict["timestamp"]
            del user_dict["notifications"]
            del user_dict["new_notifications"]
            del user_dict["hidden_notifications"]
            user_dict["key"] = user.key.urlsafe()
            try:
                user_dict["prof_pic"] = images.get_serving_url(user.prof_pic)
            except:
                del user_dict["prof_pic"]
            if user_dict["perms"] == 'alumni':
                alumni_list.append(user_dict)
            else:
                user_list.append(user_dict)
        return_data = json_dump({'members': user_list, 'alumni': alumni_list})
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
        organization = request_user.organization.get()
        if not organization:
            return OutgoingMessage(error='ORGANIZATION_NOT_FOUND', data='')
        if request_object["tag"] not in organization.tags and len(request_object['tag']) > 1:
            organization.tags.append(request_object["tag"])
            organization.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=INVALID_FORMAT, data='')

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
            organization.tags.remove(request_object['tag'])
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
        if request_object["old_tag"] in organization.tags:
            organization.tags.remove(request_object['old_tag'])
            organization.tags.append(request_object['new_tag'])
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
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        org_tags_future = request_user.organization.get_async()
        event_tags_future = Event.query(Event.organization == request_user.organization).fetch_async()
        org_tags = org_tags_future.get_result().tags
        org_tags_list = []
        for tag in org_tags:
            org_tags_list.append({"name": tag})
        event_tags = event_tags_future.get_result()
        event_tags_list = []
        for event in event_tags:
            event_tags_list.append(event.tag)
        perm_tags_list = [{"name": 'council'}, {"name": 'leadership'}, {"name": 'Everyone'}]
        return OutgoingMessage(error='', data=json_dump({'org_tags': org_tags_list,
                                                         'event_tags': event_tags_list,
                                                         'perms_tags': perm_tags_list}))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/send_message',
                      http_method='POST', name='message.send_message')
    def send_message(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        data = json.loads(request.data)
        tags = data['tags']
        users = get_users_from_tags(tags, request_user.organization, False)
        notification = Notification()
        notification.type = 'message'
        notification.content = data['content']
        notification.timestamp = datetime.datetime.now()
        notification.sender = request_user.key
        notification.sender_name = request_user.first_name + ' ' + request_user.last_name
        notification.title = data['title']
        notification.put()
        request_user.sent_notifications.append(notification.key)
        request_user.put()
        futures = []
        for user in users:
            user.new_notifications.append(notification.key)
            futures.append(user.put_async())
        for future in futures:
            future.get_result()
            # if user.notification_email:
            #     name = request_user.first_name + ' ' + request_user.last_name
            #     notification_email(title=notification.title, content=notification.content,
            #                        email=user.email, sender=name)
        return OutgoingMessage(error='', data='OK')

    #-------------------------
    # NOTIFICATION ENDPOINTS
    #-------------------------

    @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/get',
                      http_method='POST', name='notifications.get')
    def get_notifications(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.new_notifications:
            new_notification_future = Notification.query(Notification.key.IN(
                request_user.new_notifications)).fetch_async()
        if request_user.notifications:
            notifications_future = Notification.query(Notification.key.IN(
                request_user.notifications)).order(Notification.timestamp).fetch_async(20)
        if request_user.hidden_notifications:
            hidden_notifications_future = Notification.query(Notification.key.IN(
                request_user.hidden_notifications)).order(Notification.timestamp).fetch_async(20)
        out_notifications = []
        logging.error(request_user.new_notifications)
        if request_user.new_notifications:
            new_notifications = new_notification_future.get_result()
            logging.error(new_notifications)
            for notify in new_notifications:
                note = notify.to_dict()
                logging.error(note)
                sender = notify.sender.get()
                note["new"] = True
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        if request_user.notifications:
            notifications = notifications_future.get_result()
            for notify in notifications:
                note = notify.to_dict()
                sender = notify.sender.get()
                if sender:
                    note["sender"] = sender.first_name + " " + sender.last_name
                else:
                    del note["sender"]
                note["new"] = False
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        out_hidden_notifications = []
        if request_user.hidden_notifications:
            hidden_notifications = hidden_notifications_future.get_result()
            for notify in hidden_notifications:
                note = notify.to_dict()
                note["key"] = notify.key.urlsafe()
                out_hidden_notifications.append(note)
        out = {'notifications': out_notifications, 'hidden_notifications': out_hidden_notifications}
        return OutgoingMessage(error='', data=json_dump(out))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/seen',
                      http_method='POST', name='notifications.seen')
    def see_notification(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        key = ndb.Key(urlsafe=data["notification"])
        if key in request_user.new_notifications:
            request_user.new_notifications.remove(key)
            request_user.notifications.append(key)
            request_user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/hide',
                      http_method='POST', name='notifications.hide')
    def hide_notification(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        key = ndb.Key(urlsafe=data["notification"])
        if key in request_user.notifications:
            request_user.notifications.remove(key)
            request_user.hidden_notifications.append(key)
            request_user.put()
            return OutgoingMessage(error='', data='OK')
        if key in request_user.new_notifications:
            request_user.new_notifications.remove(key)
            request_user.hidden_notifications.append(key)
            request_user.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/hidden_notifications',
                      http_method='POST', name='notifications.hidden_notifications')
    def hidden_notifications(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        hidden_notifications = Notification.query(Notification.key.IN(request_user.hidden_notifications)).fetch()
        notifications = []
        for notification in hidden_notifications:
            notify = notification.to_dict()
            notify["key"] = notification.key.urlsafe()
            notifications.append(notify)
        return OutgoingMessage(error='', data=json_dump(notifications))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/delete',
                      http_method='POST', name='notifications.revoke')
    def revoke_notification(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        data = json.loads(request.data)
        key = ndb.Key(urlsafe=data["message"])
        if key in request_user.sent_notifications:
            futures = []
            request_user.sent_notifications.remove(key)
            futures.append(request_user.put_async())
            notified_users = User.query(User.notifications == key).fetch_async()
            new_notified_users = User.query(User.new_notifications == key).fetch_async()
            hidden_notified_users = User.query(User.hidden_notifications == key).fetch_async()
            users = notified_users.get_result()
            for user in users:
                user.notifications.remove(key)
                futures.append(user.put_async())
            users_new = new_notified_users.get_result()
            for user in users_new:
                user.new_notifications.remove(key)
                futures.append(user.put_async())
            users_hidden = hidden_notified_users.get_result()
            for user in users_hidden:
                user.hidden_notifications.remove(key)
                futures.append(user.put_async())
            futures.append(key.delete_async())
            for future in futures:
                future.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='message/recently_sent',
                      http_method='POST', name='notifications.recently_sent')
    def recently_sent_notification(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not request_user.sent_notifications:
            return OutgoingMessage(error='', data=json_dump(''))
        sent_notifications = Notification.query(Notification.key.IN(request_user.sent_notifications)).order(
                                                                    -Notification.timestamp).fetch(30)
        out_message = []
        for notification in sent_notifications:
            note_dict = notification.to_dict()
            note_dict["key"] = notification.key.urlsafe()
            out_message.append(note_dict)
        return OutgoingMessage(error='', data=json_dump(out_message))

    #-------------------------
    # EVENT ENDPOINTS
    #-------------------------
    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/create',
                      http_method='POST', name='event.create')
    def create_event(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        event_data = json.loads(request.data)
        new_event = Event()
        new_event.creator = request_user.key
        new_event.description = event_data["description"]
        new_event.title = event_data["title"]
        new_event.time_start = datetime.datetime.strptime(event_data["time_start"], '%m/%d/%Y %I:%M %p')
        new_event.time_end = datetime.datetime.strptime(event_data["time_end"], '%m/%d/%Y %I:%M %p')
        new_event.time_created = datetime.datetime.now()
        new_event.tag = event_data["tag"]
        new_event.organization = request_user.organization
        new_event.org_tags = event_data["tags"]["org_tags"]
        new_event.perms_tags = event_data["tags"]["perms_tags"]
        new_event.going = [request_user.key]
        if EVERYONE.lower() in event_data["tags"]["perms_tags"] or 'Everyone' in event_data["tags"]["perms_tags"]:
            new_event.perms_tags = ['everyone']
        users = get_users_from_tags(event_data["tags"], request_user.organization, False)
        notification = Notification()
        notification.title = event_data["title"]
        notification.type = 'event'
        notification.content = "You have been invited to the event: " + event_data["title"]
        notification.content += ". Please check out your events page for more information!"
        notification.sender_name = "NeteGreek Notification Service"
        notification.sender = new_event.creator
        notification.timestamp = datetime.datetime.now()
        notification.link = '#/app/events/'+new_event.tag
        notification.put()
        future_list = [new_event.put_async()]
        for user in users:
            user.new_notifications.append(notification.key)
            future_list.append(user.put_async())
        for item in future_list:
            item.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/check_tag_availability',
                      http_method='POST', name='event.check_tag_availability')
    def check_tag_availability(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        tag = json.loads(request.data)
        event = Event.query(ndb.AND(Event.organization == request_user.organization, Event.tag == tag)).get()
        if event:
            return OutgoingMessage(error=USERNAME_TAKEN, data='')
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
                                            Event.going == request_user.key))).order(-Event.time_start).fetch(30)
        else:
            events = Event.query(ndb.AND(Event.organization == request_user.organization,
                                     ndb.OR(Event.perms_tags == request_user.perms,
                                            Event.perms_tags == 'everyone',
                                            Event.going == request_user.key))).order(-Event.time_start).fetch(30)
        out_events = []
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
        event_tag = request_data["tag"]
        event = Event.query(ndb.AND(Event.tag == event_tag, Event.organization == request_user.organization)).get()
        for key, value in request_data.iteritems():
            if key == "time_start":
                event.time_start = datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p')
            elif key == "time_end":
                event.time_end = datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p')
            elif key == "title":
                event.title = value
            elif key == "description":
                event.description = value
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
        event.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='event/get_check_in_info',
                      http_method='POST', name='event.get_check_in_info')
    def get_check_in_info(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        event_tag = json.loads(request.data)
        event_key = Event.query(Event.tag == event_tag).get().key
        users_future = User.query(User.organization == request_user.organization).fetch_async()
        attendance_data_future = AttendanceData.query(ndb.AND(AttendanceData.event == event_key)).fetch_async()
        event_future = Event.query(Event.tag == event_tag).get_async()
        users = users_future.get_result()
        attendance_data = attendance_data_future.get_result()
        event = event_future.get_result()
        data_list = []
        for user in users:
            user_dict = user.to_dict()
            user_dict["key"] = user.key
            if user.key in event.going:
                user_dict["rsvp"] = 'going'
            elif user.key in event.not_going:
                user_dict["rsvp"] = 'not_going'
            else:
                user_dict["rsvp"] = 'unknown'
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
        event_key = Event.query(Event.tag == data["event_tag"]).get().key
        att_data = AttendanceData.query(ndb.AND(AttendanceData.event == event_key,
                                                AttendanceData.user == user_key)).get()
        if att_data:
            att_data.time_in = datetime.datetime.now()
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
        event_key = Event.query(Event.tag == data["event_tag"]).get().key
        att_data = AttendanceData.query(ndb.AND(AttendanceData.event == event_key,
                                                AttendanceData.user == user_key)).get()
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
        data = json.loads(request.data)
        event = Event.query(ndb.AND(Event.tag == data["tag"], Event.organization == request_user.organization)).get()
        event_data = AttendanceData.query(AttendanceData.event == event.key).fetch(keys_only=True)
        ndb.delete_multi(event_data)
        event.key.delete()
        return OutgoingMessage(error='', data='OK')

APPLICATION = endpoints.api_server([RESTApi])


