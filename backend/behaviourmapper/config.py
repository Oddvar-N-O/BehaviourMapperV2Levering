import os
basedir = os.path.abspath(os.path.dirname(__file__))

# contains application-wide configuration, and is loaded in __init__.py

class Config(object):
    APPLICATION_ROOT = '/behaviourmapper'
    DATABASE = 'database.db'
    UPLOAD_PATH = 'behaviourmapper/static/uploads'
    STATIC_URL_PATH = os.path.join(basedir, "static")
    ALLOWED_EXTENSIONS = {"jpg", "png", "jpeg", "pdf", "gif"}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
