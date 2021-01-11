from flask import Flask, g
from config import Config
from flask_cors import CORS
import mysql.connector

# Create and configure app
app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
app.config["UPLOAD_FOLDER"] = Config.UPLOAD_PATH


# get an instance of the db
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = mysql.connect(user=app.config['DATABASE_USER'], database=app.config['DATABASE'])
    return db

@app.route('/hello')
def say_hello_world():
    return {'result': "Koplingen mellom flask og react fungerer WEE!"}


# automatically called when application is closed, and closes db connection
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()