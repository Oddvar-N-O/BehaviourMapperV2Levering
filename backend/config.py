import os
basedir = os.path.abspath(os.path.dirname(__file__))

# contains application-wide configuration, and is loaded in __init__.py

class Config(object):
    DATABASE_USER = 'root'
    DATABASE = 'behaviormapper'
    DATABASE_CONFIG = {
                        'user': 'behavior',
                        'password': 'thisCanBe12Mappings',
                        'host': '127.0.0.1',
                        'port': '3306',
                        'database': 'behaviormapper',
                        }
    UPLOAD_PATH = 'app/static/uploads'
    ALLOWED_EXTENSIONS = {"jpg"}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024