from flask import Flask, g
from config import Config
from flask_cors import CORS, cross_origin
import sqlite3
import mysql.connector
from mysql.connector import errorcode
from Crypto.Random import get_random_bytes
from behaviourmapper.prefixmiddleware import PrefixMiddleware

# Create and configure app
app = Flask(__name__)
app.secret_key = get_random_bytes(32)
# CORS implemented so that we don't get errors when trying to access the server from a different server location
CORS(app)
app.config.from_object(Config)
app.config["UPLOAD_FOLDER"] = Config.UPLOAD_PATH
app.config["APPLICATION_ROOT"] = Config.APPLICATION_ROOT
app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix='/behaviourmapper')


# get an instance of the db
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(app.config['DATABASE'])
    db.row_factory = sqlite3.Row
    return db

# initialize db for the first time
def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

def query_db(query, values, one=False):
    db = get_db()
    cursor = db.execute(query, values)
    rows = cursor.fetchall()
    rows.append(cursor.lastrowid)
    cursor.close()
    db.commit()
    return (rows[0] if rows else None) if one else rows

def select_db(query, one=False):
    db = get_db()
    cursor = db.execute(query)
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

# flask_cors.CORS(app, expose_headers='Authorization')

from behaviourmapper import routes
