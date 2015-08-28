__author__ = 'Derek'
import os
import sys
if os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'python27')) not in sys.path:
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'python27')))
from golden_data_set import regenerate_data_set, destroy_data_set
import webapp2


class DataSetHandler(webapp2.RequestHandler):
    def get(self):
        destroy_data_set()
        regenerate_data_set()
        self.response.write("<html><p>Done</p></html>")



app = webapp2.WSGIApplication([
    ('/goldendataset', DataSetHandler)


], debug=True)