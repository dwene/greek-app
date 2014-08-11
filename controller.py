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

EVERYONE = 'Everyone'


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
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        elif isinstance(obj, ndb.Key):
            return obj.urlsafe()
        elif isinstance(obj, ndb.BlobKey):
            return images.get_serving_url(obj, secure_url=True)
        else:
            return json.JSONEncoder.default(self, obj)


def member_signup_email(user, token):
    user['token'] = token
    signup_link = 'https://greek-app.appspot.com/#/newuser/'+token
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


def add_notification_to_users(notification, users):
    future_list = list()
    for user in users:
        if user.email_prefs == 'all':
            future_list.append(CronEmail(type='notification', pending=True, email=user.email,
                                         title='Notification: ' + notification.title,
                                         content=notification.content).put_async())
        user.new_notifications.append(notification.key)
        future_list.append(user.put_async())
    for item in future_list:
        item.get_result()
    return

def alumni_signup_email(user, request_user, token):
    # to_email = [{'email': user['email'], 'type': 'to'}]
    org = request_user.organization.get()
    user['token'] = token
    signup_link = 'https://greek-app.appspot.com/#/newuser/'+token
    subject = "Registration for NeteGreek App!"
    body = "Hello!\n"
    body += org.name + " at " + org.school + "has requested to add you to their database of alumni. If you would like" \
                                             " to add yourself please go to the following link\n"
    body += signup_link + "\n\n -NeteGreek Team"
    message = dict()
    message["text"] = body
    message["subject"] = subject
    message["from_email"] = 'support@netegreek.com'
    message["from_name"] = 'NeteGreek'
    message["to"] = user['email']
    return message


def send_mandrill_email(from_email, to_emails, subject, body):
    to_send = dict()
    to_send["key"] = 'y8EslL_LZDf4__hJZbbMAQ'
    message = dict()
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
    subject = 'Removal from NeteGreek App'
    body = "Hello\n"
    body += "This if a notice that you have been removed from the organization '" + user.organization.get().name
    body += "' Please email your NeteGreek administrators for more information\n"
    body += "Have a great day\n\n"
    body += "NeteGreek Team"
    CronEmail(type='member_removal', title=subject, content=body, email=user.email,
              pending=True, timestamp=datetime.datetime.now()).put()


def forgotten_password_email(user):
    to_email = [{'email': user.email, 'type': 'to', 'name': user.first_name}]
    from_email = 'support@netegreek.com'
    subject = 'NeteGreek Password Reset'
    token = generate_token()
    user.current_token = token
    user.put()
    link = 'https://greek-app.appspot.com/?token='+token+'#/changepasswordfromtoken'
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
        if user.current_token == token and dt.days < 3:
            return user
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
        try:
            clump = json.loads(request.data)

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
        out["subscribed"] = organization.subscribed
        out["color"] = organization.color
        try:
            out["image"] = images.get_serving_url(organization.image, secure_url=True)
        except:
            out["image"] = ''
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
            new_user.class_year = int(user['class_year'])
            new_user.perms = 'member'
            futures.append(new_user.put_async())
        for future in futures:
            future.get_result()
        return OutgoingMessage(error='', data='OK')

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
            email_item = alumni_signup_email(user, request_user, token)
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
            new_user.perms = 'alumni'
            futures.append(new_user.put_async())
        for future in futures:
            future.get_result()

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
        return OutgoingMessage(error='', data='OK')

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
            removal_email(user_to_remove)
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='info/load',
                      http_method='POST', name='info.load')
    def load_user_data(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        out_data = dict()
        # line up all the queries
        events_polls_future = Event.query(Event.going == request_user.key).fetch_async()
        organization_users_future = User.query(User.organization == request_user.organization).fetch_async()
        event_tag_list_future = Event.query(ndb.AND(Event.organization == request_user.organization,
                                            Event.time_end < datetime.datetime.today() + relativedelta(months=1))
                                            ).fetch_async(projection=[Event.going, Event.tag])

        if len(request_user.tags) > 0:
            events_future = Event.query(ndb.AND(Event.organization == request_user.organization,
                                        ndb.OR(Event.org_tags.IN(request_user.tags),
                                        Event.perms_tags == request_user.perms,
                                        Event.perms_tags == 'everyone',
                                        Event.going == request_user.key))).order(-Event.time_start).fetch_async(30)
        else:
            events_future = Event.query(ndb.AND(Event.organization == request_user.organization,
                                        ndb.OR(Event.perms_tags == request_user.perms,
                                        Event.perms_tags == 'everyone',
                                        Event.going == request_user.key))).order(-Event.time_start).fetch_async(30)
        organization_future = request_user.organization.get_async()
        request_user = get_user(request.user_name, request.token)

        if request_user.new_notifications:
            new_notification_future = Notification.query(Notification.key.IN(
                request_user.new_notifications)).fetch_async(100)
        if request_user.notifications:
            notifications_future = Notification.query(Notification.key.IN(
                request_user.notifications)).order(Notification.timestamp).fetch_async(20)
        if request_user.hidden_notifications:
            hidden_notifications_future = Notification.query(Notification.key.IN(
                request_user.hidden_notifications)).order(-Notification.timestamp).fetch_async(30)

#part 1 of polls
        events_polls = events_polls_future.get_result()

        poll_event_tags = list()
        for event in events_polls:
            poll_event_tags.append(event.tag)
        if not request_user.tags:
            request_user.tags = ['@#$%^!^&*()%$#@!@#%^%^*^&*%#%$^']
        if poll_event_tags:
            polls_future = Poll.query(ndb.AND(ndb.OR(Poll.invited_perms_tags == 'everyone',
                                              Poll.invited_org_tags.IN(request_user.tags),
                                              Poll.invited_perms_tags == request_user.perms,
                                              Poll.invited_event_tags.IN(poll_event_tags),
                                              ),
                                              Poll.organization == request_user.organization)).fetch_async(20)
        else:
            polls_future = Poll.query(ndb.AND(ndb.OR(Poll.invited_perms_tags == 'everyone',
                                              Poll.invited_org_tags.IN(request_user.tags),
                                              Poll.invited_perms_tags == request_user.perms,
                                              ),
                                              Poll.organization == request_user.organization)).fetch_async(20)
#get results of queries
        organization_users = organization_users_future.get_result()
        event_tag_list = event_tag_list_future.get_result()
        organization = organization_future.get_result()
        events = events_future.get_result()
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
            for event in event_tag_list:
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
        out_data["directory"] = {'members': user_list, 'alumni': alumni_list}

        # tags section
        org_tags = organization.tags
        org_tags_list = list()
        for tag in request_user.recently_used_tags:
            if tag in org_tags:
                org_tags_list.append({"name": tag, "recent": True})
                org_tags.remove(tag)
            else:
                request_user.recently_used_tags.remove(tag)
        for tag in org_tags:
            org_tags_list.append({"name": tag, "recent": False})
        # events = event_tags_future.get_result()
        event_tags_list = list()
        for event in event_tag_list:
            event_tags_list.append({"name": event.tag})
        perm_tags_list = [{"name": 'council'}, {"name": 'leadership'}, {"name": 'Everyone'}]
        out_data["tags"] = {'org_tags': org_tags_list, 'event_tags': event_tags_list, 'perms_tags': perm_tags_list}

        # organization info
        organization_data = dict(name=organization.name, school=organization.school)
        organization_data["subscribed"] = organization.subscribed
        organization_data["color"] = organization.color
        try:
            organization_data["image"] = images.get_serving_url(organization.image, secure_url=True)
        except:
            organization_data["image"] = ''
        out_data["organization_data"] = organization_data

        #events info
        events_data = list()
        for event in events:
            dict_event = event.to_dict()
            dict_event["tags"] = {"org_tags": event.org_tags, "perms_tags": event.perms_tags}
            dict_event["key"] = event.key
            events_data.append(dict_event)
        out_data["events"] = events_data

        #notifications info
        out_notifications = list()
        if request_user.new_notifications:
            new_notifications = new_notification_future.get_result()
            for notify in new_notifications:
                note = notify.to_dict()
                note["new"] = True
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        if request_user.notifications:
            notifications = notifications_future.get_result()
            for notify in notifications:
                note = notify.to_dict()
                note["new"] = False
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        out_hidden_notifications = list()
        if request_user.hidden_notifications:
            hidden_notifications = hidden_notifications_future.get_result()
            for notify in hidden_notifications:
                note = notify.to_dict()
                note["key"] = notify.key.urlsafe()
                out_hidden_notifications.append(note)
        out_data["notifications"] = {'notifications': out_notifications,
                                     'hidden_notifications': out_hidden_notifications}

#part 2 of polls
        dict_polls = list()
        polls = polls_future.get_result()
        for poll in polls:
            add = poll.to_dict()
            add["key"] = poll.key
            dict_polls.append(add)
        out_data["polls"] = dict_polls
        return OutgoingMessage(error='', data=json_dump(out_data))

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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/update_user_directory_info',
                      http_method='POST', name='user.update_user_directory_info')
    def update_user_directory_info(self, request):
        user = User.query(User.user_name == request.user_name).get()
        user_data = json.loads(request.data)
        for key, value in user_data.iteritems():
            if not value:
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
            user = User.query(User.email == user_data["email"]).get()
        elif user_data["user_name"]:
            user = User.query(User.user_name == user_data["user_name"]).get()
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/directory',
                      http_method='POST', name='auth.directory')
    def directory(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization_users_future = User.query(User.organization == request_user.organization).fetch_async()
        event_list_future = Event.query(ndb.AND(Event.organization == request_user.organization,
                                        Event.time_end < datetime.datetime.today() + relativedelta(months=1))
                                        ).fetch_async(projection=[Event.going, Event.tag])
        organization_users = organization_users_future.get_result()
        event_list = event_list_future.get_result()
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
        for tag in data['tags']['org_tags']:
            if tag not in request_user.recently_used_tags:
                request_user.recently_used_tags.insert(0, tag)
            if len(request_user.recently_used_tags) > 5:
                request_user.recently_used_tags = request_user.recently_used_tags[:5]
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
        add_notification_to_users(notification, users)
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
                request_user.hidden_notifications)).order(-Notification.timestamp).fetch_async(30)
        out_notifications = list()
        if request_user.new_notifications:
            new_notifications = new_notification_future.get_result()
            for notify in new_notifications:
                note = notify.to_dict()
                note["new"] = True
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        if request_user.notifications:
            notifications = notifications_future.get_result()
            for notify in notifications:
                note = notify.to_dict()
                note["new"] = False
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        out_hidden_notifications = list()
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


    @endpoints.method(IncomingMessage, OutgoingMessage, path='notifications/more_hidden',
                      http_method='POST', name='notifications.more_hidden')
    def more_hidden(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        out_hidden_notifications = list()
        hidden_notifications_future = Notification.query(Notification.key.IN(
            request_user.hidden_notifications)).order(-Notification.timestamp).fetch_async(data + 20)
        hidden_notifications = hidden_notifications_future.get_result()
        for notify in hidden_notifications:
            note = notify.to_dict()
            note["key"] = notify.key.urlsafe()
            out_hidden_notifications.append(note)
        return OutgoingMessage(error='', data=json_dump(out_hidden_notifications))


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
        notifications = list()
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
            futures = list()
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
        out_message = list()
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
        event_data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not check_availability_of_tag(event_data["tag"], request_user.organization):
            return OutgoingMessage(error=TAG_INVALID, data='')
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
        new_event.location = event_data["location"]
        if 'address' in event_data:
            new_event.address = event_data["address"]
        for tag in new_event.org_tags:
            if tag not in request_user.recently_used_tags:
                request_user.recently_used_tags.insert(0, tag)
            if len(request_user.recently_used_tags) > 5:
                request_user.recently_used_tags = request_user.recently_used_tags[:5]
        new_event.perms_tags = event_data["tags"]["perms_tags"]
        new_event.going = [request_user.key]
        if EVERYONE.lower() in event_data["tags"]["perms_tags"] or 'Everyone' in event_data["tags"]["perms_tags"]:
            new_event.perms_tags = ['everyone']
        users = get_users_from_tags(event_data["tags"], request_user.organization, False)
        notification = Notification()
        notification.title = 'Event: ' + event_data["title"]
        notification.type = 'event'
        notification.content = "You have been invited to the event: " + event_data["title"]
        notification.content += ". Please check out your events page for more information!"
        notification.sender_name = "NeteGreek Notification Service"
        notification.sender = new_event.creator
        notification.timestamp = datetime.datetime.now()
        notification.link = '#/app/events/'+new_event.tag
        notification.put()
        future_list = [new_event.put_async(), request_user.put_async()]
        add_notification_to_users(notification, users)
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
                                        Event.going == request_user.key))).order(-Event.time_start).fetch(30)
        else:
            events = Event.query(ndb.AND(Event.organization == request_user.organization,
                                 ndb.OR(Event.perms_tags == request_user.perms,
                                        Event.perms_tags == 'everyone',
                                        Event.going == request_user.key))).order(-Event.time_start).fetch(30)
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
            elif key == "location":
                event.location = value
            elif key == 'address':
                event.address = value
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
        users = get_users_from_tags({'org_tags': event.org_tags, 'perms_tags': event.perms_tags},
                                    request_user.organization, False)
        notification = Notification()
        notification.title = 'Event Updated: ' + event.title
        notification.type = 'event'
        notification.content = "The event " + event.title + " has been updated."
        notification.content += ". Please check out your events page for more information."
        notification.sender_name = "NeteGreek Notification Service"
        notification.sender = request_user.key
        notification.timestamp = datetime.datetime.now()
        notification.link = '#/app/events/'+event.tag
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
        event_tag = json.loads(request.data)
        event_key = Event.query(Event.tag == event_tag).get().key
        users_future = User.query(User.organization == request_user.organization).fetch_async()
        attendance_data_future = AttendanceData.query(ndb.AND(AttendanceData.event == event_key)).fetch_async()
        event_future = Event.query(Event.tag == event_tag).get_async()
        users = users_future.get_result()
        attendance_data = attendance_data_future.get_result()
        event = event_future.get_result()
        data_list = list()
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
        event_key = Event.query(Event.tag == data["event_tag"]).get().key
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
        data = json.loads(request.data)
        event = Event.query(ndb.AND(Event.tag == data["tag"], Event.organization == request_user.organization)).get()
        event_data = AttendanceData.query(AttendanceData.event == event.key).fetch(keys_only=True)
        ndb.delete_multi(event_data)
        event.key.delete()
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
        notification.title = 'Poll: ' + poll.name
        notification.content = 'You have been invited to answer a new poll.'
        notification.content += ' Please visit your polling page for more information.'
        notification.timestamp = datetime.datetime.now()
        notification.sender = request_user.key
        notification.type = 'poll'
        notification.link = '#/app/polls/' + poll.key.urlsafe()
        notification.sender_name = 'NeteGreek Notification Service'
        notification.put()
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
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
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
        poll.key.delete()
        return OutgoingMessage(error='', data='OK')

        # for question in question_list:
        #     responses = question["responses"].get_result()
        #     if question["question"].type == 'multiple':
        #         answer_list = list()
        #         for response in responses:
        # responses_future = Response.query(Response.question in poll.questions).fetch()


APPLICATION = endpoints.api_server([RESTApi])


