from flask import Flask, g
from config import Config
from flask_cors import CORS
import mysql.connector
from mysql.connector import errorcode
from werkzeug.utils import secure_filename

# Create and configure app
app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
app.config["UPLOAD_FOLDER"] = Config.UPLOAD_PATH


# get an instance of the db
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = mysql.connector.connect(**app.config['DATABASE_CONFIG'])
    return db

# initialize db for the first time
def init_db():
    with app.app_context():
        db = get_db()
        for line in app.open_resource('schema.sql', mode='r'):
            db.cursor().execute(line)
        db.cursor().close()
        db.commit()

def query_db(query, values, insert=False, one=False):
    db = get_db()
    cursor = db.cursor(prepared=True)
    cursor.execute(query, values)
    if insert == True:
        lrid = cursor.lastrowid
        cursor.close()
        db.commit()
        return lrid
    rows = cursor.fetchall()
    cursor.close()
    db.commit()
    return (rows[0] if rows else None) if one else rows

def select_db(query, one=False):
    db = get_db()
    cursor = db.cursor(prepared=True)
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    db.commit()
    return (rows[0] if rows else None) if one else rows

# automatically called when application is closed, and closes db connection
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

from behaviormapper import routes
