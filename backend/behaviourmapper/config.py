import os
from Crypto.Random import get_random_bytes
basedir = os.path.abspath(os.path.dirname(__file__))

# contains application-wide configuration, and is loaded in __init__.py

class Config(object):
    APPLICATION_ROOT = '/behaviourmapper'
    UPLOAD_FOLDER = os.path.join(basedir, 'static/uploads')
    STATIC_URL_PATH = os.path.join(basedir, "static")
    ALLOWED_EXTENSIONS = {"jpg", "png", "jpeg", "pdf", "gif"}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    CORS_ORIGINS = ["https://www.ux.uis.no/behaviourmapper/", "http://localhost:3000/behaviourmapper/","http://localhost:3000/"]
    
 