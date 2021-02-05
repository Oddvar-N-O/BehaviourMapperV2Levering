from behaviormapper import app, query_db, init_db, select_db
from behaviormapper.errorhandlers import InvalidUsage
from datetime import datetime, date
from flask import redirect, url_for, flash, request, session, send_from_directory
from time import time
import json
import logging
from config import Config
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger('HELLO WORLD')

# Set allowed filenames
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS

# Not all done, must add link to map
@app.route('/addproject', methods=['POST'])
@cross_origin()
def addProject():
    add_small_project = ("INSERT INTO Project "
              "(name, description, startdate) "
              "VALUES (?,?,?)")
    small_project_values = (request.form.get('name'), request.form.get('description'), 
                        request.form.get('startdate'))
    query_db(add_small_project, small_project_values)
    return {}
    # Add a new project and link a map

# Usage /getproject?u_id=<u-id>&name=<name> or /getproject?u_id=<u-id>
# Need to add that you first get all projects, then get all info on a project.
@app.route('/getproject', methods=['GET'])
def getProject():
    get_proj_sql = ("SELECT * FROM Project WHERE u_id=? AND name=?")
    proj_values = (request.args.get('u_id'), request.args.get('name'))
    if proj_values[1] == None:
        get_proj_sql = ("SELECT * FROM Project WHERE u_id=?")
        projects = query_db(get_proj_sql, proj_values[0])
        projects = projects[:-1]
    else:
        projects = query_db(get_proj_sql, proj_values, True)
    result = []
    for project in projects:
        if proj_values[1] == None:
            for data in project:
                result.append(data)
        else:
            result.append(project)
    return json.dumps(result)

# Usage /getfigure?description=<desc>&color=<color>
@app.route('/getfigure')
def getFigure():
    get_figure_image_sql =('SELECT image FROM Figures WHERE description=? AND color=?')
    description = request.args.get('description', None)
    color = request.args.get('color', None)
    result = query_db(get_figure_image_sql, (description, color), True)
    image = {"image": ""}
    for res in result:
        image["image"] = res
    try:
        return send_from_directory(app.config['STATIC_URL_PATH'], image["image"])
    except FileNotFoundError:
        abort(404)

@app.route('/getfiguredata')
def getFigureData():
    get_figure_data_sql =("SELECT description, color, id FROM Figures")
    result = select_db(get_figure_data_sql)
    result = result[:-1]
    data = []
    for res in result:
        data.append({"description" : res[0], "color" : res[1], "id" : res[2]})
    return json.dumps(data)

@app.route('/favicon.ico')
def favicon():
    try:
        return send_from_directory(app.config['STATIC_URL_PATH'], "favicon.ico")
    except FileNotFoundError:
        abort(404)

# Not done yet, must be checked with
@app.route('/addevent', methods=['POST'])
def addEvent():
    project_id = 1 # find clever way to get this dynamically
    d_event_values = (request.form.get('direction'), request.form.get('center_coordinate'), 
                        request.form.get('created'), request.form.get('f_id'))
    e_id = query_db(add_event, d_event_values) # Adds to Event table in db
    query_db(add_relation, (project_id, e_id[-1])) # Adds to the relation table in db
    return {}
# add both to event and Project_has_Event

@app.route('/adduser', methods=['POST', 'GET'])
def addUser():
    return {"ERROR": "Not Created yet."}
# add a new user

@app.route('/getuser', methods=['GET'])
def getUser():
    return {"ERROR": "Not Created yet."}
# add a new user

@app.route('/upload', methods=['POST'])
def fileUpload():
    target=os.path.join(Config.UPLOAD_PATH)
    if not os.path.isdir(target):
        os.mkdir(target)
    logger.info("welcome to upload`")
    file = request.files['file']
    unique = 1
    if allowed_file(file.filename):
        filename = secure_filename(file.filename)
        destination="/".join([target, filename])
        while os.path.exists(destination):
            destination="/".join([target, str(unique) + filename])
            unique += 1
    else:
        raise InvalidUsage("Not allowed file ending", status_code=400)
    try:
        file.save(destination)
        return {"file": filename}, 201
    except:
        raise InvalidUsage("Failed to upload image", status_code=500)
    

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
figure_values = ("beskrivelse","blue", "bilde", "attributter")
user_values = ("kartet",)
event_values = [45,"12991.29291 2929.21", "12:12:12"]
project_values = ["prosjektnamn", "beskrivelse", "kartet", datetime(1998,1,30,12,23,43),datetime(1998,1,30,12,23,43), "zoom"]

# sql for å bruke alle felt.
add_user = ("INSERT INTO Users (feideinfo)"
               "VALUES (?)")
add_event = ("INSERT INTO Event "
              "(direction, center_coordinate, created, f_id) "
              "VALUES (?,?,?,?)")
add_project = ("INSERT INTO Project "
              "(name, description, map, startdate, enddate, zoom, u_id) "
              "VALUES (?,?,?,?,?,?,?)")
add_figure = ("INSERT INTO Figures "
                "(description, color, image, other_attributes) "
                "VALUES (?,?,?,?)")
add_relation = ("INSERT INTO Project_has_Event "
              "(p_id, e_id) "
              "VALUES (?,?)")