import os
basedir = os.path.abspath(os.path.dirname(__file__))

# contains application-wide configuration, and is loaded in __init__.py

class Config(object):
    DATABASE = 'database.db'
    UPLOAD_PATH = 'behaviormapper/static/uploads'
    STATIC_URL_PATH = os.path.join(basedir, "behaviormapper/static")
    ALLOWED_EXTENSIONS = {"jpg", "png", "jpeg", "pdf", "gif"}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    # QGISZIP = os.path.join(basedir, "behaviormapper/static/shapefiles")
