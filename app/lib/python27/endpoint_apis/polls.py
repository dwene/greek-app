from apiconfig import *
from protorpc import remote
import datetime
from notifications import Notifications


polls = endpoints.api(name='polls', version='v1',
                      allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                      audiences=[ANDROID_AUDIENCE])


@polls.api_class(resource_name='polls')
class PollsApi(remote.Service):
    @endpoints.method(IncomingMessage, OutgoingMessage, path='create',
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
        if 'show_names' in data:
            poll.show_names = bool(data["show_names"])
        if 'viewers' in data:
            poll.viewers = data["viewers"]
        poll.organization = request_user.organization
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
        notification.content = request_user.first_name + " " + request_user.last_name + ' invited you to answer the poll: ' + poll.name
        notification.timestamp = datetime.datetime.now()
        notification.sender = request_user.key
        notification.type = 'poll'
        notification.link = 'app/polls/' + poll.key.urlsafe()
        notification.created_key = poll.key
        notification.put()
        send_email = True
        if 'send_email' in data:
            send_email = send_email['data']
        for item in async_list:
            poll.questions.insert(0, item.get_result())
        poll_key = poll.put()
        Notifications.add_notification_to_users(notification, users, {'type': 'poll', 'key': poll_key})
        return OutgoingMessage(error='', data=json_dump({'key': poll.key.urlsafe()}))

    #TEST ENDPOINTS
    @endpoints.method(IncomingMessage, OutgoingMessage, path='edit_poll',
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='answer_questions',
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='get_polls',
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



    @endpoints.method(IncomingMessage, OutgoingMessage, path='more_polls',
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='get_poll_info',
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='get_results',
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
        # if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
        #     return OutgoingMessage(error=INCORRECT_PERMS, data='')
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='delete',
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
        notifications = Notification.query(Notification.created_key == poll.key).fetch(keys_only=True)
        ndb.delete_multi(notifications)
        poll.key.delete()
        return OutgoingMessage(error='', data='OK')
