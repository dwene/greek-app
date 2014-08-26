from google.appengine.ext import ndb
import datetime
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
    pledge_class_semester = ndb.StringProperty(default='Fall')
    pledge_class_year = ndb.IntegerProperty(default=2014)
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
    recently_used_tags = ndb.StringProperty(repeated=True)
    email_prefs = ndb.StringProperty(default='all')


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
    location = ndb.StringProperty()
    address = ndb.StringProperty()
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
    cancel_subscription = ndb.DateProperty()
    trial_period = ndb.BooleanProperty(default=True)
    cost = ndb.FloatProperty(default=1.0)
    color = ndb.StringProperty(default='color1')
    image = ndb.BlobKeyProperty()


class Poll(ndb.Model):
    questions = ndb.KeyProperty(repeated=True)
    results_org_tags = ndb.StringProperty(repeated=True)  # people who get the results of this poll
    results_perms_tags = ndb.StringProperty(repeated=True)  # people who get the results of this poll
    results_event_tags = ndb.StringProperty(repeated=True)  # people who get the results of this poll
    name = ndb.StringProperty()
    description = ndb.TextProperty()
    organization = ndb.KeyProperty()
    invited_org_tags = ndb.StringProperty(repeated=True)
    invited_perms_tags = ndb.StringProperty(repeated=True)
    invited_event_tags = ndb.StringProperty(repeated=True)
    open = ndb.BooleanProperty(default=True)
    allow_changes = ndb.BooleanProperty(default=True)
    answered_users = ndb.KeyProperty(repeated=True)
    creator = ndb.KeyProperty()
    timestamp = ndb.DateTimeProperty()
    show_names = ndb.BooleanProperty()
    viewers = ndb.StringProperty()


class Question(ndb.Model):
    type = ndb.StringProperty()
    index = ndb.IntegerProperty()
    worded_question = ndb.StringProperty()
    choices = ndb.StringProperty(repeated=True)
    responses = ndb.KeyProperty(repeated=True)
    poll = ndb.KeyProperty()


class Response(ndb.Model):
    user = ndb.KeyProperty()
    answer = ndb.StringProperty(repeated=True)
    timestamp = ndb.DateTimeProperty()
    question = ndb.KeyProperty()
    poll = ndb.KeyProperty()


class CronEmail(ndb.Model):
    type = ndb.StringProperty()
    pending = ndb.BooleanProperty(default=True)
    email = ndb.StringProperty()
    content = ndb.TextProperty()
    title = ndb.StringProperty()
    timestamp = ndb.DateTimeProperty(default=datetime.datetime.now())