from flask import Flask
from .config import Config
from flask_cors import CORS
import os

from Crypto.Random import get_random_bytes
# from behaviourmapper.prefixmiddleware import PrefixMiddleware


def create_app(test_config=None):
    # Create and configure app
    app = Flask(__name__, instance_relative_config=True)
    app.secret_key = get_random_bytes(32)
    # CORS implemented so that we don't get errors when trying to access the server from a different server location
    CORS(app)
    app.config.from_object(Config)
    # Not sure if these two are necessary(may be done on the line above).
    app.config["UPLOAD_FOLDER"] = Config.UPLOAD_FOLDER
    app.config["APPLICATION_ROOT"] = Config.APPLICATION_ROOT
    app.config["DATABASE"] = os.path.join(app.instance_path, "behaviourmapper.db")

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    from . import errorhandlers
    app.register_error_handler(errorhandlers.InvalidUsage ,errorhandlers.handle_invalid_usage)

    from . import routes
    app.register_blueprint(routes.bp)

    from . import db
    db.init_app(app)

    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!", app.config["DATABASE"])

    return app


# automatically called when application is closed, and closes db connection
# @app.teardown_appcontext
# def close_connection(exception):
#     db = getattr(g, '_database', None)
#     if db is not None:
#         db.close()

# flask_cors.CORS(app, expose_headers='Authorization')

# from behaviourmapper import routes