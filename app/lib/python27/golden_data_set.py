__author__ = 'anakin'
from ndbdatastore import *
from apiconfig import generate_token, hash_password
from time import sleep
from dateutil.relativedelta import relativedelta


def setup_organization(organization_key, local_development):
    netebot = User.query(User.user_name == "netebot").get().key
    create_chatter(organization_key, netebot)
    if local_development:
        sleep(0.25)
    generate_calendars(organization_key)
    if local_development:
        sleep(0.25)
    setup_events(organization_key, netebot)
    return


def setup_events(organization, netebot_key):
    feature = Feature()
    feature.name = "events"
    feature.expires = datetime.datetime.now() + relativedelta(months=1)
    feature.organization = organization
    futures = []
    futures.append(feature.put_async())
    event = Event()
    event.organization = organization
    event.calendar = Calendar.query(Calendar.name == "council", Calendar.organization == organization).get().key
    event.creator = netebot_key
    event.time_start = feature.expires
    event.time_end = feature.expires + relativedelta(hours=1)
    event.title = "Events Trial End Date"
    event.description = "Events trial will end on this day unless you decide to upgrade to premium events."
    event.time_created = datetime.datetime.now()
    futures.append(event.put_async())
    for future in futures:
        future.get_result()
    return


def regenerate_data_set():
    organization_key = create_organization()
    netebot = create_netebot()
    user_key = create_creator(organization_key)
    create_luke(organization_key)
    setup_organization(organization_key, True)
    create_link(organization_key)


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


def create_netebot():
    netebot = User()
    netebot.first_name = 'NeteBot'
    netebot.user_name = 'netebot'
    netebot.perms = 'council'
    netebot.timestamp = datetime.datetime.now()
    netebot.email = 'support@netegreek.com'
    key = netebot.put()
    sleep(0.15)
    return key



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



def create_luke(org_key):
    luke = User()
    luke.organization = org_key
    luke.user_name = 'lskywalker'
    luke.hash_pass = hash_password('password', luke.user_name)
    luke.perms = 'council'
    luke.email = 'luke@gmail.com'
    luke.first_name = 'Luke'
    luke.last_name = 'Skywalker'
    luke.current_token = generate_token()
    luke.timestamp = datetime.datetime.now()
    key = luke.put()
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
    content = '''
Welcome to NeteGreek, thanks for signing up!

Here is a quick run through of what we offer so far:

CHATTER
Chatter allows anyone to post, comment and like. But leaders can set make a chatter important so they don't have to worry about all your posts about the Bachelor getting in the way.

DIRECTORY
Have everyone's information close on hand. Quickly text or email anyone directly from the directory. You can even keep in touch with your organization's alumni after they graduate so you can stalk them and keep inviting them back for fundraisers.

EVENTS
The calendar keeps you up to date with everything that is happening in the organization. Now the freshman don't have to keep asking where the meeting is. We have also made it easy to keep attendance at meetings with our event check-in system so it's harder to get away with skipping out -- sorry 'bout that.

LINKS
You know that really important release form that you lost and was supposed to turn in signed tomorrow? Luckily for you it was added to the link page so don't have to worry about asking the right person for another copy. Now hopefully you have enough ink.

NOTIFICATIONS
We knew you didn't get enough of these everyday. Just wanted to make sure you felt good when everyone is commenting on your chatter. Oh, and when we launch our iPhone/Android apps, they'll even make your phone ding.

HELP/CONTACT
Need someone to talk to? No, really -- we're here for you. If you have a question, we'll answer it (if we can). We also want to know everything you think about our app so we can make it better for you. We're probably working on it right now, so let us know you care by saying hi sometime.

Thanks!

Jake and Derek
Co-Founders of NeteGreek
    '''
    chatter.organization = org_key
    chatter.content = content
    chatter.author = user_key
    chatter.important = True
    chatter.timestamp = datetime.datetime.now()
    chatter.following = [user_key]
    key = chatter.put()
    return key


def create_event(creator, organization):
    event = Event()
    event.address = "Death Star, Galaxy Far Far Away"
    event.location = "Death Star, Galaxy Far Far Away"
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
    sleep(0.25)

def create_link(organization_key):
    group = LinkGroup()
    group.name = "Sith Rules"
    group.organization = organization_key
    group.links = []
    group.put()
    link = Link()
    link.organization = organization_key
    link.title = "How to kill a Jedi"
    link.link = "starwars.wikia.com/wiki/Jedi_hunter"
    link.group = group.key
    group.links = [link.put()]
    group.put()
    sleep(0.25)





