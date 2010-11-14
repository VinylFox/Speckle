import os 
import cgi
import urllib2
import simplejson

# used to test loading indicator
#from time import sleep

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

class APIProjects(webapp.RequestHandler):
    def get(self):
        
        account = cgi.escape(self.request.get('account'))
        token = cgi.escape(self.request.get('token'))
        baseurl = 'http://' + account + '.letsfreckle.com/api/'
        
        url = baseurl + 'projects.json?token=' + token

        try:
            response = urllib2.urlopen(url)
            the_data = response.read()
            status = 200
            success = 'true'
            jsn = simplejson.loads(the_data)
            if jsn[0].get('project'):
                d = [e.get('project') for e in jsn]
                the_data = simplejson.dumps(d)
        except:
            the_data = '[]'
            status = 401
            success = 'false'
        
        values = {
            'success': success,
            'status': status,
            'data': the_data
        }
        
        path = os.path.join(os.path.dirname(__file__), 'templates/api.json')
        self.response.out.write(template.render(path, values))

class APITags(webapp.RequestHandler):
    def get(self):

        account = cgi.escape(self.request.get('account'))
        token = cgi.escape(self.request.get('token'))
        baseurl = 'http://' + account + '.letsfreckle.com/api/'
        
        url = baseurl + 'tags.json?token=' + token

        try:
            response = urllib2.urlopen(url)
            the_data = response.read()
            status = 200
            success = 'true'
            jsn = simplejson.loads(the_data)
            if jsn[0].get('tag'):
                d = [e.get('tag') for e in jsn]
                the_data = simplejson.dumps(d)
        except:
            the_data = '[]'
            status = 401
            success = 'false'
        
        values = {
        	'success': success,
            'status': status,
            'data': the_data
        }
        
        path = os.path.join(os.path.dirname(__file__), 'templates/api.json')
        self.response.out.write(template.render(path, values))

class APIEntries(webapp.RequestHandler):
    def get(self):
        
        account = cgi.escape(self.request.get('account'))
        token = cgi.escape(self.request.get('token'))
        baseurl = 'http://' + account + '.letsfreckle.com/api/'
        search_date_from = cgi.escape(self.request.get('search_date_from'))
        
        data = "&search[from]="+ search_date_from
        
        url = baseurl + 'entries.json?token=' + token + data

        # used to test loading indicator
        #sleep(10)
        
        try:
            response = urllib2.urlopen(url)
            the_data = response.read()
            status = 200
            success = 'true'
            jsn = simplejson.loads(the_data)
            if jsn[0].get('entry'):
                d = [e.get('entry') for e in jsn]
                the_data = simplejson.dumps(d)
        except:
            the_data = '[]'
            status = 401
            success = 'false'
        
        values = {
        	'success': success,
            'status': status,
            'data': the_data
        }
        
        path = os.path.join(os.path.dirname(__file__), 'templates/api.json')
        self.response.out.write(template.render(path, values))

    def post(self):

        account = cgi.escape(self.request.get('account'))
        token = cgi.escape(self.request.get('token'))
        baseurl = 'http://' + account + '.letsfreckle.com/api/'
        
        minutes = cgi.escape(self.request.get('minutes'))
        project_id = cgi.escape(self.request.get('project_id'))
        desc = cgi.escape(self.request.get('desc'))
        date = cgi.escape(self.request.get('date'))
        data = '<?xml version="1.0" encoding="UTF-8"?><entry><minutes>'+minutes+'</minutes><user>'+account+'</user><project-id type="integer">'+project_id+'</project-id><description>'+desc+'</description><date>'+date+'</date></entry>'        
        url = baseurl + 'entries.xml'
        
        request = urllib2.Request(url)
        request.add_header('X-FreckleToken', token)
        request.add_header('Content-type', 'text/xml')
        
        try:
            response = urllib2.urlopen(request, data)
            status = response.info().getheader('Status')
            # commented out because the response codes from Freckle's API are pointless, it inserts the entry either way.
            #if status == '201' or status == 201 or status == '401' or status == 401:
            success = 'true'
            #else:
            #    success = 'false'
        except:
            status = 401
            success = 'true'
        
        values = {
        	'success': success,
            'status': status,
            'data': '[]'
        }
        
        path = os.path.join(os.path.dirname(__file__), 'templates/api.json')
        self.response.out.write(template.render(path, values))

application = webapp.WSGIApplication([('/api/projects', APIProjects), ('/api/tags', APITags), ('/api/entries', APIEntries)], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()