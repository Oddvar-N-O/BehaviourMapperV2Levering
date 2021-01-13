from flask import Flask, g
from config import Config
from flask_cors import CORS
# from flask_mysql_connector import MySQL
import mysql.connector
from mysql.connector import errorcode

# Create and configure app
app = Flask(__name__)
CORS(app)
# mysql = MySQL(app)
app.config.from_object(Config)
app.config["UPLOAD_FOLDER"] = Config.UPLOAD_PATH


# get an instance of the db
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = mysql.connector.connect(user=app.config['DATABASE_USER'], database=app.config['DATABASE'])
        # try: 
        #     db = g._database = mysql.connector.connect(user=app.config['DATABASE_USER'], database=app.config['DATABASE'])
        #     # db = g._database = mysql.connector.connect(**app.config['DATABASE_CONFIG'])
        # except mysql.connector.Error as err:
        #     if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        #         print("Something is wrong with your user name or password")
        #     elif err.errno == errorcode.ER_BAD_DB_ERROR:
        #         print("Database does not exist")
        #     else:
        #         print(err)
    return db

# initialize db for the first time
def init_db():
    with app.app_context():
        db = get_db()
        for line in app.open_resource('schema.sql', mode='r'):
            print(line)
            db.cursor().execute(line)
        db.commit()

def query_db(query, values, one=False):
    db = get_db()
    cursor = db.cursor(prepared=True)
    cursor.execute(query, values)
    
    result = cursor.fetchall()
    cursor.close()
    db.commit()
    return (result[0] if result else None) if one else result

# automatically called when application is closed, and closes db connection
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

from app import routes