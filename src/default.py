import os 
import simplejson

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app


class MainPage(webapp.RequestHandler):
    def get(self):
        
        mobile = self.request.get('mobile');
        useragent = os.environ.get("HTTP_USER_AGENT", "unknown")
        useragent = useragent.lower();
        host = os.environ.get("HTTP_HOST", "unknown")
        
        isIphone = useragent.find('iphone') != -1
        isIpad = useragent.find('ipad') != -1
        isAndroid = useragent.find('android') != -1
        
        isLocalhost = host.find('localhost') != -1
        
        manifest = "<html lang=\"en\" manifest=\"speckle.manifest\">"
        includes = "<script type=\"text/javascript\" src=\"/resources/deploy/speckle.js\"></script>"
        debug = ""
        if isLocalhost:
            includes = ""
            manifest = "<html>"
            debug = "-debug"
            jsbfile = open(os.path.join(os.path.dirname(__file__), 'speckle.jsb2'), 'r')
            jsbcontents = jsbfile.read()
            jsb = simplejson.loads(jsbcontents)
            jsbfile.close()
            finc = jsb.get('pkgs')[0].get('fileIncludes')
            for jsfile in finc:
                includes = includes + "<script type=\"text/javascript\" src=\"/" + jsfile.get('path') + jsfile.get('text') + "\"></script>"
        else:
            jsb = 'none'
            
        if mobile or isIphone or isAndroid or isIpad: 
        
            path = os.path.join(os.path.dirname(__file__), 'templates/default.html')
            self.response.out.write(template.render(path, {
                "manifest": manifest,
                "includes": includes,
                "debug": debug
            }))

        else:
        
            path = os.path.join(os.path.dirname(__file__), 'templates/website.html')
            self.response.out.write(template.render(path, {}))
                        
        
application = webapp.WSGIApplication([('/', MainPage)], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()