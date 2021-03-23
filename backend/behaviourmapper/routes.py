from .db import query_db, init_db, select_db
from .errorhandlers import InvalidUsage
from . import oidc 
from datetime import datetime, date
from flask import Flask, redirect, url_for, flash, request, session, send_from_directory, Blueprint, current_app, g
from time import time
import json
import logging
from .config import Config
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
from werkzeug.exceptions import abort
import shapefile as shp

bp = Blueprint('behaviourmapper', __name__, url_prefix='/behaviourmapper')

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger('')

#This is only for testing 
@bp.route('/')
def index():
    if oidc.user_loggedin:
        return 'Welcome %s' % oidc.user_getfield('email')
    else:
        print(oidc)
        return 'Not logged in'

#This is only for testing 
@bp.route('/login')
@oidc.require_login
def login():
    return 'Welcome %s' % oidc.user_getfield('email')

#This is only for testing 
@bp.route('/oidc_callback')
@oidc.require_login
def oidc_callback():
    return 'Welcome %s' % oidc.user_getfield('email')

# Set allowed filenames
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS

# Not all done, must add link to map
@bp.route('/addproject', methods=['POST'])
@cross_origin()
def addProject():
    add_small_project = ("INSERT INTO Project "
        "(name, description, startdate, zoom, leftX, lowerY, rightX, upperY)"
        "VALUES (?,?,?,?,?,?,?,?)")
    small_project_values = (request.form.get('name'), request.form.get('description'), 
                        request.form.get('startdate'), request.form.get('zoom'),
                        request.form.get('leftX'), request.form.get('lowerY'),
                        request.form.get('rightX'), request.form.get('upperY'))
    p_id = query_db(add_small_project, small_project_values)
    return {"p_id": p_id}
    # Add a new project and link a map

@bp.route('/addinterview', methods=['POST'])
def addInterview():
    add_interview = ("INSERT INTO InterviewEvents (interview, p_id) VALUES (?,?)")
    args = (request.form.get('interview'), request.form.get('p_id'))
    i_id = query_db(add_interview, args)
    return {"i_id": i_id}



# Usage /getproject?u_id=<u-id>&name=<name> or /getproject?u_id=<u-id>
# Need to add that you first get all projects, then get all info on a project.
@bp.route('/getproject', methods=['GET'])
def getProject():
    get_proj_sql = ("SELECT * FROM Project WHERE u_id=? AND name=?")
    proj_values = (request.args.get('u_id'), request.args.get('name'))
    if proj_values[1] == None:
        get_proj_sql = ("SELECT id, name, description, map FROM Project WHERE u_id=?")
        projects = query_db(get_proj_sql, (proj_values[0],))
        projects = projects[:-1]
    else:
        projects = query_db(get_proj_sql, proj_values, True)
    result = []
    for project in projects:
        new_project = []
        if proj_values[1] == None:
            result.append((project[0], project[1], project[2], project[3]))
        else:
            result.append(project)
    return json.dumps(result)

@bp.route('/getprojectmapping', methods=['GET'])
def getProjectMapping():
    get_proj_sql = ("SELECT * FROM Project WHERE id=?")
    proj_values = (request.args.get('p_id'),)
    project = query_db(get_proj_sql, proj_values, True)
    result = []
    for data in project:
         result.append(data)
    return json.dumps(result)

# Usage /getfigure?description=<desc>&color=<color>
@bp.route('/getfigure')
def getFigure():
    get_figure_image_sql =('SELECT image FROM Figures WHERE description=? AND color=?')
    description = request.args.get('description', None)
    color = request.args.get('color', None)
    result = query_db(get_figure_image_sql, (description, color), True)
    image = {"image": ""}
    if result != 0:
        for res in result:
            image["image"] = res
    else:
        raise InvalidUsage("Bad request", status_code=400)
    try:
        return send_from_directory(Config.STATIC_URL_PATH, image["image"])
    except FileNotFoundError:
        abort(404)

@bp.route('/getfiguredata')
def getFigureData():
    get_figure_data_sql =("SELECT description, color, id FROM Figures")
    result = select_db(get_figure_data_sql)
    result = result[:-1]
    data = []
    for res in result:
        data.append({"description" : res[0], "color" : res[1], "id" : res[2]})
    return json.dumps(data)
    
@bp.route('/getmap')
def getMap():
    get_map_sql =('SELECT map FROM Project WHERE id=?')
    args = (request.args.get('p_id'),)
    result = query_db(get_map_sql, args, True)
    image = {"image": ""}
    for res in result:
        image["image"] = "./uploads/" + res
    try:
        return send_from_directory(Config.STATIC_URL_PATH, image["image"])
    except FileNotFoundError:
        abort(404)

@bp.route('/favicon.ico')
def favicon():
    try:
        return send_from_directory(Config.STATIC_URL_PATH, "favicon.ico")
    except FileNotFoundError:
        abort(404)

# Not done yet, must be checked with actual data
@bp.route('/addevent', methods=['POST'])
def addEvent():
    project_id = request.form.get('p_id') 
    # find clever way to get this dynamically
    d_event_values = (request.form.get('direction'), request.form.get('center_coordinate'), 
                        request.form.get('created'), request.form.get('f_id'))
    e_id = query_db(add_event, d_event_values) # Adds to Event table in db
    query_db(add_relation, (project_id, e_id[-1])) # Adds to the relation table in db
    return {}
# add both to event and Project_has_Event

# Henter alle events knyttet til et prosjekt /getevents?p_id=<p_id>
@bp.route('/getevents')
def getEvents():
    return get_events_func(request.args.get("p_id")) 

def get_events_func(p_id):    
    get_eventIds_sql = ("SELECT e_id FROM Project_has_Event WHERE p_id=?")    
    get_event_sql = ("SELECT * FROM Event WHERE id=?")     
    try:         
        int(p_id)    
    except:         
        raise InvalidUsage("Bad arg", status_code=400)

    query_e_ids = query_db(get_eventIds_sql, (p_id,))
    query_e_ids = query_e_ids[:-1]

    e_ids = []
    for e_id in query_e_ids:        
        e_ids.append(e_id[0])    
    # events = []
    events = []

    for e_id in e_ids:
        query_event = query_db(get_event_sql, (str(e_id),), True)
        events.append((query_event[0],query_event[1],query_event[2],query_event[3],query_event[4]))
    return json.dumps(events)

@bp.route('/adduser', methods=['POST', 'GET'])
def addUser():
    return {"ERROR": "Not Created yet."}
# add a new user

@bp.route('/getuser', methods=['GET'])
def getUser():
    return {"ERROR": "Not Created yet."}
# add a new user

@bp.route('/upload', methods=['POST'])
def fileUpload():
    target=os.path.join(Config.UPLOAD_FOLDER)
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
        if unique > 2:
            addMapName(str(unique - 1) + filename, request.form['p_id'])
        else:
            addMapName(filename, request.form['p_id'])
    else:
        raise InvalidUsage("Not allowed file ending", status_code=400)
    try:
        logger.info("file uploaded")
        file.save(destination)
        return {"file": filename}, 201
    except:
        logger.info("Failed to upload image")
        raise InvalidUsage("Failed to upload image", status_code=500)

def getElementXandY(element):
    stringCoord = element.split(",")
    intCoord = list(map(float, stringCoord))
    return intCoord

def findNewCoordinates(leftX, lowerY, rightX, upperY, imgCoordinates):
    imgCoordinates = getElementXandY(imgCoordinates)
    startPoint = [leftX, upperY] 

    lengthMapX = rightX - leftX
    lenghtMapY = upperY - lowerY
    onePixelX = lengthMapX / 615
    onePixelY = lenghtMapY / 684

    pixelsFromStartX = imgCoordinates[0]
    distanceFromX = pixelsFromStartX * onePixelX
    pixelsFromStartY = imgCoordinates[1]
    distanceFromY = pixelsFromStartY * onePixelY
    newX = startPoint[0] + distanceFromX
    newY = startPoint[1] - distanceFromY

    newCoordinates = [newX, newY]
    return newCoordinates

@bp.route('/createarcgis', methods=['POST'])
@cross_origin()
def createARCGIS():
    # step 1 create field. Step 2 populate fields
    # enter folder
    # shapefile = outline of a building and 
    target=os.path.join(Config.STATIC_URL_PATH, "shapefiles")
    if not os.path.isdir(target):
        os.mkdir(target)

    eventsJSON = get_events_func(request.form.get('p_id'))
    events = json.loads(eventsJSON)
    
    imageCoord = []
    for event in events:
        imageCoord.append(event[2])

    get_proj_sql = ("SELECT * FROM Project WHERE id=?")
    pid = (request.form.get('p_id'))
    project_values = query_db(get_proj_sql, (str(pid),), True)
    leftX = float(project_values[8])
    lowerY = float(project_values[9])
    rightX = float(project_values[10])
    upperY = float(project_values[11])

    iconCoord = []

    for coordSet in imageCoord:
        iconCoord.append(findNewCoordinates(leftX, lowerY, rightX, upperY, coordSet))

    
    w = shp.Writer(os.path.join(target, 'tree'))
    # clog her
    w.autoBalance = 1
    w.field('Background', 'C', '40') # image

    point_ID = 1

    """ w.point(leftX, lowerY)
    w.record('lower left corner')
    w.point(leftX, upperY)
    w.record('upper left corner')
    w.point(rightX, lowerY)
    w.record('lower right corner')
    w.point(rightX, upperY)
    w.record('upper right corner') """
    
    for coordinateSet in iconCoord:
        x = coordinateSet[0]
        y = coordinateSet[1]
        w.point(x, y)
        w.record(str(point_ID), 'Point')
        point_ID += 1

    return {}

#initdb, testdb og selectdb er kun til bruk for utvikling, må fjernes når det skal tas i bruk
@bp.route('/initdb')
def initdb():
    init_db()
    return redirect(url_for("behaviourmapper.testdb"))

@bp.route('/testdb')
def testdb():
    u_id = query_db(add_user, user_values)
    f_id = query_db(add_figure, figure_values)
    event_values.append(f_id[-1])
    project_values.append(u_id[-1])
    p_id = query_db(add_project, project_values)
    e_id = query_db(add_event, event_values)
    query_db(add_relation, (p_id[-1], e_id[-1]))
    return redirect(url_for('behaviourmapper.selectdb'))    

@bp.route('/selectdb')
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

def addMapName(mapname, p_id):
    add_map_name_sql = ("UPDATE Project SET map=? WHERE id=?")
    values = (mapname, p_id)
    res = query_db(add_map_name_sql, values, True)
    return {"res": res}

# Eksempler på bruk av alle felter til hver tabell i databasen.
figure_values = ("beskrivelse","blue", "bilde", "attributter")
user_values = ("kartet",)
event_values = [45,"12991.29291 2929.21", "12:12:12"]
project_values = ["prosjektnamn", "beskrivelse", "screenshot", "kartet", datetime(1998,1,30,12,23,43),datetime(1998,1,30,12,23,43), "zoom", 1,2,3,4]

# sql for å bruke alle felt.
add_user = ("INSERT INTO Users (feideinfo)"
               "VALUES (?)")
add_event = ("INSERT INTO Event "
              "(direction, center_coordinate, created, f_id) "
              "VALUES (?,?,?,?)")
add_project = ("INSERT INTO Project "
              "(name, description, screenshot, map, startdate, enddate, zoom, leftX, lowerY, rightX, upperY, u_id) "
              "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
add_figure = ("INSERT INTO Figures "
                "(description, color, image, other_attributes) "
                "VALUES (?,?,?,?)")
add_relation = ("INSERT INTO Project_has_Event "
              "(p_id, e_id) "
              "VALUES (?,?)")