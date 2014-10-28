from google.appengine.ext import ndb
import datetime
# MODELS

HTML_EMAIL_1 = """
<div bgcolor="#d4d4d4"><div style="font-size:1px;display:none!important"></div><table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td bgcolor="#d4d4d4" style="padding-top:10px"><table width="650" border="0" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td width="650"><table width="650" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td width="650" bgcolor="#003663" valign="top" padding="" style=""><a href="https://app.netegreek.com" target="_blank"><img src="https://app.netegreek.com/images/NeteGreekLogoSmallWhite.png" width="149" height="40" style="margin-top:20px;margin-left:20px;height:40px;width:149px;" border="0"></a></td></tr><tr width="650"><td bgcolor="#003663" padding="10" style="padding:10px;"></td></tr><tr><table width="650" border="0" cellspacing="0" cellpadding="0"><tr><td width="50" bgcolor="#003663" halign="left"></td><td width="550" bgcolor="#003663" halign="center"><table width="550" bgcolor="#FFFFFF" border="0" halign="center"><tr><td width="550" border="0" style="border:none;"><div style="margin-top:20px;margin-bottom:20px;margin-left: 10px;margin-right:10px;">"""
HTML_EMAIL_2 = """
<a href="https://app.netegreek.com"><img src="https://app.netegreek.com/images/ctabutton.png" width="550" height="50"></a></div></td></tr></table></td><td width="50" bgcolor="#003663"></td></tr></table></tr><tr><td width="650" height="50" bgcolor="#003663"></td></tr></tbody></table><table width="650" cellpadding="0" cellspacing="0" border="0" bgcolor="#d4d4d4" align="center"><tbody><tr><td><table align="center" style="width:100%;max-width:650px;text-align:left;padding-top:15px"><tbody><tr><td colspan="2" style="text-align:center;width:100%"><p style="color:#818181;font-size:12px;padding-top:10px;line-height:25px;font-family:arial;font-color:white;text-align:center"> If you believe you are receiving this email in error please email <a href="mailto:support@netegreek.com" style="">support@netegreek.com</a></p><p style="color:#818181;font-color:white;font-size:12px;padding-top:10px;line-height:25px;font-family:arial;text-align:center"> NeteGreek, LLC. </p></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div>"""

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
    link_groups = ndb.StringProperty(repeated=True)


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

class Link(ndb.Model):
    title = ndb.StringProperty()
    link = ndb.StringProperty()
    group = ndb.StringProperty()
    organization = ndb.KeyProperty()
