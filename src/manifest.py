import os

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app


class Manifest(webapp.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = "text/cache-manifest"

        path = os.path.join(os.path.dirname(__file__), 'templates/speckle.manifest')
        self.response.out.write(template.render(path, {}))                        
        
application = webapp.WSGIApplication([('/speckle.manifest', Manifest)], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()