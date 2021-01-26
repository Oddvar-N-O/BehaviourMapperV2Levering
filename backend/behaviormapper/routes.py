from behaviormapper import app, query_db, init_db, select_db
from datetime import datetime, date
from flask import redirect, url_for, flash, request, session
from time import time
import json
import logging
from config import Config
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger('HELLO WORLD')

UPLOAD_FOLDER = Config.UPLOAD_PATH
ALLOWED_EXTENSIONS = Config.ALLOWED_EXTENSIONS



@app.route('/hello')
def say_hello_world():
    return {"result": "Koplingen mellom flask og react fungerer WEE!"}

#initdb, testdb og selectdb er kun til bruk for utvikling, må fjernes når det skal tas i bruk
@app.route('/initdb')
def initdb():
    init_db()
    return redirect(url_for("testdb"))

@app.route('/testdb')
def testdb():
    brid = query_db(add_user, user_values)
    prid = query_db(add_person, person_values)
    event_values = ("kartet", 45,"12991.29291,2929.21", "12:12:12", 0, prid[-1])
    map_values = ("kartet", datetime(1998,1,30,12,23,43),datetime(1998,1,30,12,23,43), "zoom", brid[-1])
    kaid = query_db(add_map, map_values)
    query_db(add_relation, (kaid[-1], prid[-1]))
    query_db(add_event, event_values)
    return redirect(url_for("selectdb"))    

@app.route('/selectdb')
def selectdb():
    result = {"Person": "", "Users": "", "Map": "", "Map_has_Person": "", "Event": ""}
    table_names = ("Person", "Users", "Map", "Map_has_Person", "Event")
    for x in table_names:
        query_result = select_db(("SELECT * FROM {}".format(x)), True)
        temp_result = []
        for query in query_result:
            temp_result.append(query)
        result[x] = temp_result
    return json.dumps(result, indent=4, sort_keys=True, default=str)


@app.route('/upload', methods=['POST'])
@cross_origin()
def fileUpload():
    target=os.path.join(UPLOAD_FOLDER,'test_docs')
    if not os.path.isdir(target):
        os.mkdir(target)
    logger.info("welcome to upload`")
    file = request.files['file'] 
    filename = secure_filename(file.filename)
    destination="/".join([target, filename])
    file.save(destination)
    session['uploadFilePath']=destination
    response="Whatever you wish too return"
    return response

# flask_cors.CORS(app, expose_headers='Authorization')

# Eksempler på bruk av alle felter til hver tabell i databasen.
person_values = ("kartet", 0,"blue", "attributter")
user_values = ("kartet",)
event_values = ("kartet", 45,"12991.29291 2929.21", datetime.now().time(), 0, "må hentes frå forrige eller noe")
map_values = ("kartet", datetime.now(),datetime(1998,1,30,12,23,43), "zoom", "må hentes frå forrige eller noe")

# sql for å bruke alle felt.
add_user = ("INSERT INTO Users (feideinfo)"
               "VALUES (?)")
add_event = ("INSERT INTO Event "
              "(description, direction, center_coordinate, created, visible, p_id) "
              "VALUES (?,?,?,?,?,?)")
add_map = ("INSERT INTO Map "
              "(name, startdate, enddate, zoom, u_id) "
              "VALUES (?,?,?,?,?)")
add_person = ('INSERT INTO Person (m_id, visible, color, other_attributes) VALUES (?,?,?,?)')
add_relation = ("INSERT INTO Map_has_Person "
              "(k_id, p_id) "
              "VALUES (?,?)")