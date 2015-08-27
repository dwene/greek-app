__author__ = 'anakin'
from ndbdatastore import *
from apiconfig import generate_token
from endpoint_apis.auth import hash_password
from time import sleep
from dateutil.relativedelta import relativedelta


def regenerate_data_set():
    organization_key = create_organization()
    user_key = create_creator(organization_key)
    chatter_key = create_chatter(organization_key, user_key)
    generate_calendars(organization_key)
    create_link(organization_key)
    create_event(user_key, organization_key)


def destroy_data_set():
    ndb.delete_multi(User.query().fetch(keys_only=True))
    ndb.delete_multi(Notification.query().fetch(keys_only=True))
    ndb.delete_multi(Message.query().fetch(keys_only=True))
    ndb.delete_multi(Calendar.query().fetch(keys_only=True))
    ndb.delete_multi(Event.query().fetch(keys_only=True))
    ndb.delete_multi(AttendanceData.query().fetch(keys_only=True))
    ndb.delete_multi(PaymentInformation.query().fetch(keys_only=True))
    ndb.delete_multi(Poll.query().fetch(keys_only=True))
    ndb.delete_multi(Question.query().fetch(keys_only=True))
    ndb.delete_multi(Response.query().fetch(keys_only=True))
    ndb.delete_multi(EmailTask.query().fetch(keys_only=True))
    ndb.delete_multi(PushTask.query().fetch(keys_only=True))
    ndb.delete_multi(Link.query().fetch(keys_only=True))
    ndb.delete_multi(LinkGroup.query().fetch(keys_only=True))
    ndb.delete_multi(Chatter.query().fetch(keys_only=True))
    ndb.delete_multi(ChatterComment.query().fetch(keys_only=True))
    ndb.delete_multi(Organization.query().fetch(keys_only=True))


def create_creator(org_key):
    anakin = User()
    anakin.organization = org_key
    anakin.user_name = 'admin'
    anakin.hash_pass = hash_password('password', anakin.user_name)
    anakin.perms = 'council'
    anakin.email = 'anakin@gmail.com'
    anakin.first_name = 'Anakin'
    anakin.last_name = 'Skywalker'
    anakin.current_token = generate_token()
    anakin.timestamp = datetime.datetime.now()
    key = anakin.put()
    sleep(0.15)
    return key


def create_organization():
    organization = Organization()
    organization.school = "Jedi Temple"
    organization.name = "Sith Lords Anonymous"
    organization.color = "cyan"
    organization.type = "fraternity"
    key = organization.put()
    sleep(0.15)
    return key



def generate_calendars(org_key):
    #Do this last
    organization = org_key.get()
    public = Calendar()
    public.organization = organization.key
    public.name = 'public'
    public.users = User.query(User.organization == organization.key).fetch(keys_only=True)
    everyone = Calendar()
    everyone.organization = organization.key
    everyone.name = "everyone"
    everyone.users = User.query(User.perms.IN(['council', 'leadership', 'members']),
                                User.organization == organization.key).fetch(keys_only=True)
    leadership = Calendar()
    leadership.organization = organization.key
    leadership.name = "leadership"
    leadership.users = User.query(User.perms.IN(['council', 'leadership']),
                                  User.organization == organization.key).fetch(keys_only=True)
    council = Calendar()
    council.name = 'council'
    council.organization = organization.key
    council.users = User.query(User.perms.IN(['council']),
                               User.organization == organization.key).fetch(keys_only=True)
    organization.calendars.append(public.put())
    organization.calendars.append(everyone.put())
    organization.calendars.append(leadership.put())
    organization.calendars.append(council.put())
    organization.put()
    sleep(0.15)


def create_chatter(org_key, user_key):
    chatter = Chatter()
    chatter.organization = org_key
    chatter.content = "Welcome to NeteGreek 2.0! This is our new feature called Chatter! " + \
        "Check it out and let us know if you have any questions!"
    chatter.author = user_key
    chatter.important = True
    chatter.timestamp = datetime.datetime.now()
    chatter.following = [user_key]
    key = chatter.put()
    sleep(0.15)
    return key


def create_event(creator, organization):
    event = Event()
    event.address = "Death Star, Galaxy Far Far Away"
    event.creator = creator
    event.description = "I'm becoming Darth Vader and swearing my allegience to the Empire!"
    event.title = "Anakin becomes Darth Vader"
    event.calendar = Calendar.query(Calendar.name == 'everyone', Calendar.organization == organization).get().key
    event.time_start = datetime.datetime.now() + relativedelta(days=5)
    event.time_end = datetime.datetime.now() + relativedelta(days=5) + relativedelta(minutes=60)
    event.organization = organization
    event.put()
    feature = Feature()
    feature.name = 'events'
    feature.expires = datetime.datetime.now() + relativedelta(months=1)
    feature.organization = organization
    feature.put()
    sleep(0.15)

def create_link(organization_key):
    group = LinkGroup()
    group.name = "Sith Rules"
    group.organization = organization_key
    group.links = []
    group.put()
    link = Link()
    link.organization = organization_key
    link.title = "How to kill a Jedi"
    link.link = "http://starwars.wikia.com/wiki/Jedi_hunter"
    link.group = group.key
    group.links = [link.put()]
    group.put()
    sleep(0.15)





