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

@app.route('/addproject', methods=['POST'])
@cross_origin()
def addProject():
    add_small_project = ("INSERT INTO Project "
              "(name, description, startdate) "
              "VALUES (?,?,?)")
    project_values = (request.form.get('name'), request.form.get('description'), 
                        request.form.get('startdate'))
    query_db(add_small_project, project_values)
    return {}
    # Add a new project and link a map

# @app.route('getproject', methods=['GET'])
# def getProject():


@app.route('/addevent', methods=['POST'])
def addEvent():
    print(request)
# add both to event and Project_has_Event

@app.route('/adduser', methods=['POST'])
def addUser():
    print(request)
# add a new user

@app.route('/upload', methods=['POST'])
def fileUpload():
    target=os.path.join(UPLOAD_FOLDER)
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
    u_id = query_db(add_user, user_values)
    f_id = query_db(add_figure, figure_values)
    event_values.append(f_id[-1])
    project_values.append(u_id[-1])
    p_id = query_db(add_project, project_values)
    e_id = query_db(add_event, event_values)
    query_db(add_relation, (p_id[-1], e_id[-1]))
    return redirect(url_for("selectdb"))    

@app.route('/selectdb')
def selectdb():
    result = {"Figures": "", "Users": "", "Project": "", "Project_has_Event": "", "Event": ""}
    table_names = ("Figures", "Users", "Project", "Project_has_Event", "Event")
    for x in table_names:
        query_result = select_db(("SELECT * FROM {}".format(x)), True)
        temp_result = []
        for query in query_result:
            temp_result.append(query)
        result[x] = temp_result
    return json.dumps(result, indent=4, sort_keys=True, default=str)

# Eksempler på bruk av alle felter til hver tabell i databasen.
figure_values = ("beskrivelse","blue", "attributter")
user_values = ("kartet",)
event_values = [45,"12991.29291 2929.21", "12:12:12", 0]
project_values = ["prosjektnamn", "beskrivelse", "kartet", datetime(1998,1,30,12,23,43),datetime(1998,1,30,12,23,43), "zoom"]

# sql for å bruke alle felt.
add_user = ("INSERT INTO Users (feideinfo)"
               "VALUES (?)")
add_event = ("INSERT INTO Event "
              "(direction, center_coordinate, created, visible, f_id) "
              "VALUES (?,?,?,?,?)")
add_project = ("INSERT INTO Project "
              "(name, description, map, startdate, enddate, zoom, u_id) "
              "VALUES (?,?,?,?,?,?,?)")
add_figure = ("INSERT INTO Figures "
                "(description, color, other_attributes) "
                "VALUES (?,?,?)")
add_relation = ("INSERT INTO Project_has_Event "
              "(p_id, e_id) "
              "VALUES (?,?)")