__author__ = 'Derek'
from apiconfig import *
from protorpc import remote
import datetime
import logging

links = endpoints.api(name='links', version='v1',
                      allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                      audiences=[ANDROID_AUDIENCE])


@links.api_class(resource_name='links')
class LinksApi(remote.Service):
    @endpoints.method(IncomingMessage, OutgoingMessage, path='get',
                      http_method='POST', name='link.get')
    def get_links(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        links = Link.query(Link.organization == request_user.organization).fetch()
        organization = request_user.organization.get()
        groups = list()
        for group_name in organization.link_groups:
            group = {'name': group_name, 'links': list()}
            links_list = list()
            for link in links:
                if link.group == group_name:
                    temp_link = link.to_dict()
                    temp_link['key'] = link.key.urlsafe()
                    links_list.append(temp_link)
            group['links'] = links_list
            groups.append(group)
        return OutgoingMessage(error='', data=json_dump(groups))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='create',
                      http_method='POST', name='link.create')
    def create_link(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        organization = request_user.organization.get()
        if not data['group'] in organization.link_groups:
            organization.link_groups.append(data['group'])
            organization.put()
        link = Link()
        link.link = data['link']
        link.title = data['title']
        link.group = data['group']
        link.organization = request_user.organization
        link.put()
        return OutgoingMessage(error='', data=json_dump(link.key.urlsafe()))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='edit',
                      http_method='POST', name='link.edit')
    def edit_link(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not 'key' in data:
            OutgoingMessage(error='Missing Key', data='')
        organization_future = request_user.organization.get_async()
        link = ndb.Key(urlsafe=data['key']).get()
        organization = organization_future.get_result()
        if 'title' in data:
            link.title = data['title']
        if 'link' in data:
            link.link = data['link']
        if 'group' in data:
            if not data['group'] in organization.link_groups:
                organization.link_groups.append(data['group'])
                organization.put()
            link.group = data['group']
        link.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='delete',
                      http_method='POST', name='link.delete')
    def delete_link(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not 'key' in data:
            return OutgoingMessage(error='Missing key', data='')
        ndb.Key(urlsafe=data['key']).delete()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='create_group',
                      http_method='POST', name='link.create_group')
    def create_link_group(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        organization = request_user.organization.get()
        if not data['group'] in organization.link_groups:
            organization.link_groups.append(data['group'])
            organization.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='rename_group',
                      http_method='POST', name='link.create_group')
    def create_link_group(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        organization = request_user.organization.get()
        if not data['group'] in organization.link_groups and data['old_group'] in organization.link_groups:
            organization.link_groups.append(data['group'])
            organization.link_groups.remove(data['old_group'])
            organization.put()
            links = Link.query(Link.group == data['old_group'], Link.organization == request_user.organization).fetch()
            async_list = list()
            for link in links:
                link.group = data['group']
                async_list.append(link.put_async())
            for item in async_list:
                item.get_result()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error='Group not found', data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='delete_group',
                      http_method='POST', name='link.delete_group')
    def delete_link_group(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        organization = request_user.organization.get()
        if data['group'] in organization.link_groups:
            organization.link_groups.remove(data['group'])
            links = Link.query(Link.group == data['group'], Link.organization ==
                               request_user.organization).fetch(keys_only=True)
            async_list = list()
            for link in links:
                async_list.append(link.delete_async())
            for item in async_list:
                item.get_result()
            organization.put()
        return OutgoingMessage(error='', data='OK')
