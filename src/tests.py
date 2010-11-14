import os 
import simplejson

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app


class TestPage(webapp.RequestHandler):
    def get(self):

        includes = ""
        jsbfile = open(os.path.join(os.path.dirname(__file__), 'speckle.jsb2'), 'r')
        jsbcontent = jsbfile.read()
        jsb = simplejson.loads(jsbcontent)
        jsbfile.close()
        finc = jsb.get('pkgs')[0].get('fileIncludes')
        for jsfile in finc:
            includes = includes + "<script type=\"text/javascript\" src=\"/" + jsfile.get('path') + jsfile.get('text') + "\"></script>"

        path = os.path.join(os.path.dirname(__file__), 'templates/tests.html')
        self.response.out.write(template.render(path, {
            "includes": includes
        }))                        

application = webapp.WSGIApplication([('/tests/', TestPage)], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()