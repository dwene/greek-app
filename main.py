#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
import urllib

from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers
from ndbdatastore import *
from google.appengine.api import mail
from google.appengine.api import urlfetch
import json
import logging


import jinja2
import webapp2

def send_mandrill_email(from_email, to_email, subject, body):
    to_send = {}
    email_out = [{'email': to_email, 'type': 'to'}]
    to_send["key"] = 'y8EslL_LZDf4__hJZbbMAQ'
    message = {}
    message["text"] = body
    message["subject"] = subject
    message["from_email"] = from_email
    message["from_name"] = 'NeteGreek'
    message["to"] = email_out
    to_send["message"] = message
    json_data = json.dumps(to_send)
    result = urlfetch.fetch(url='https://mandrillapp.com/api/1.0/messages/send.json',
                            payload=json_data,
                            method=urlfetch.POST,
                            headers={'Content-Type': 'application/json'})
    logging.error(result)
    return



JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)


class MainHandler(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('index.html')
        template_values = {}
        self.response.write(template.render(template_values))


class ProfilePictureHandler(webapp2.RequestHandler):
    def get(self):
        upload_url = blobstore.create_upload_url('/upload')
        logging.error(upload_url);
        self.response.out.write('<html><body>')
        self.response.out.write('<form action="%s" method="POST" enctype="multipart/form-data">' % upload_url)
        self.response.out.write("""Upload File: <input type="file" name="file"><br> <input type="submit"
            name="submit" value="Submit"> </form></body></html>""")


class UploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        upload_files = self.get_uploads('file')  # 'file' is file upload field in the form
        blob_info = upload_files[0]
        self.redirect('/?key=%s#/app/postNewKeyPictureLink' % blob_info.key())


class TestCron(webapp2.RequestHandler):
    def get(self):
        logging.error('I am actually working wow...')


class SendEmails(webapp2.RequestHandler):
    def get(self):
        emails = CronEmail.query(CronEmail.pending == True).fetch()
        futures = []
        logging.error('I made it to the send emails code')
        for email in emails:
            send_mandrill_email(from_email='support@netegreek.com', to_email=email.email,
                                subject=email.title, body=email.content)

            # mail.send_mail(sender="support@netegreek.com", to=str(email.email),
            #                subject=str(email.title), body=str(email.content))
            email.pending = False
            futures.append(email.put_async())
        for future in futures:
            future.get_result()


class ServeHandler(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, resource):
        resource = str(urllib.unquote(resource))
        blob_info = blobstore.BlobInfo.get(resource)
        self.send_blob(blob_info)
    
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/upload', UploadHandler),
    ('/testcron', TestCron),
    ('/sendemails', SendEmails)

], debug=True)
