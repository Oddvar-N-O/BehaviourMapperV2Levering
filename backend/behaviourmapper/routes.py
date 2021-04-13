import json
import logging
import os
import zipfile
from datetime import date, datetime
from time import time

import shapefile as shp
from flask import (Blueprint, Flask, abort, current_app, flash, g, redirect,
                   request, send_file, send_from_directory, session, url_for)
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename

from . import oidc
from .config import Config
from .db import init_db, query_db, select_db
from .errorhandlers import InvalidUsage

bp = Blueprint('behaviourmapper', __name__, url_prefix="/behaviourmapper")
# bp = Blueprint('behaviourmapper', __name__)

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger('')

# Add possibility to be rerouted to frontend loginsite.
@bp.route('/logout')
@oidc.require_login
def logout():
    session.pop('username', None)
    oidc.logout()
    return redirect("https://auth.dataporten.no/openid/endsession", )

@bp.route('/login')
@oidc.require_login
def login():
    if oidc.user_loggedin:
        email = oidc.user_getfield('email')
        openid = oidc.user_getfield('sub')
        if not userInDB(openid):
            addUser(openid, email)
        session['username'] = openid
        return redirect('http://localhost:3000/behaviourmapper/startpage')
        # return redirect('https://www.ux.uis.no/behaviourmapper/startpage')
    else:
        raise InvalidUsage("Bad request", status_code=400)

@oidc.require_login
def authenticateUser(u_id):
    if 'username' in session:
        if session['username'] == u_id:
            return True
        else:
            return False
    return False

def userInDB(openid):
    find_user = ("SELECT email FROM Users WHERE openid=?")
    res = query_db(find_user, (openid,), True)
    if res == 0:
        return False
    elif res != 0:
        return True

def addUser(openid, email):
    add_user = ("INSERT INTO Users (openid, email)"
               "VALUES (?,?)")
    query_db(add_user, (openid, email))

def clearSession(openid):
    clear_session = ("DELETE FROM Session WHERE openid=?")
    res = query_db(clear_session, (openid,), True)
    return res

@bp.route('/getuseremail', methods=['GET'])
def getUserEmail():
    if authenticateUser(request.args.get('u_id')):
        get_user_email = ("SELECT email FROM Users WHERE openid=? ")
        values = (request.args.get('u_id'),)
        res = query_db(get_user_email, values, True)
        return json.dumps(res[0])
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

# Set allowed filenames
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@bp.route('/addproject', methods=['POST'])
def addProject():
    if authenticateUser(request.form.get('u_id')):
        add_small_project = ("INSERT INTO Project "
            "(name, description, startdate, originalsize, zoom, leftX, lowerY, rightX, upperY, u_id)"
            "VALUES (?,?,?,?,?,?,?,?,?,?)")
        small_project_values = (request.form.get('name'), request.form.get('description'), 
                            request.form.get('startdate'), request.form.get('zoom'),
                            request.form.get('originalsize'), request.form.get('leftX'), 
                            request.form.get('lowerY'), request.form.get('rightX'), 
                            request.form.get('upperY'), request.form.get('u_id'))
        p_id = query_db(add_small_project, small_project_values)
        return {"p_id": p_id}
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

@bp.route('/updateproject')
def updateProject():
    if authenticateUser(request.args.get('u_id')):
        update_sql = "UPDATE Project SET enddate=? WHERE id=? AND u_id=?"
        values = (request.args.get('enddate'),request.args.get('p_id'),request.args.get('u_id'))
        query_db(update_sql, values)
        return {"Status": "Success"}
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

@bp.route('/addinterview', methods=['POST'])
def addInterview():
    if authenticateUser(request.form.get('u_id')):
        add_interview = ("INSERT INTO InterviewEvents (interview, p_id) VALUES (?,?)")
        args = (request.form.get('interview'), request.form.get('p_id'))
        i_id = query_db(add_interview, args)
        return {"i_id": i_id}
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)



# Usage /getproject?u_id=<u-id>&name=<name> or /getproject?u_id=<u-id>
# Need to add that you first get all projects, then get all info on a project.
@bp.route('/getproject', methods=['GET'])
def getProject():
    if authenticateUser(request.args.get('u_id')):
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
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)
        

@bp.route('/getprojectmapping', methods=['GET'])
def getProjectMapping():
    if authenticateUser(request.args.get('u_id')):
        get_proj_sql = ("SELECT * FROM Project WHERE id=?")
        proj_values = (request.args.get('p_id'),)
        project = query_db(get_proj_sql, proj_values, True)
        result = []
        for data in project:
            result.append(data)
        return json.dumps(result)
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

# Henter alle events knyttet til et prosjekt /getevents?p_id=<p_id>
@bp.route('/getevents')
def getEvents():
    if authenticateUser(request.args.get('u_id')):
        return get_events_func(request.args.get("p_id"))
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

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

# Usage /getfigure?description=<desc>&color=<color>
@bp.route('/getfigure')
def getFigure():
    if authenticateUser(request.args.get('u_id')):  
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
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

@bp.route('/getimagefromID')
def getImageFromID():
    if authenticateUser(request.args.get('u_id')):
        get_figure_image_sql =('SELECT image FROM Figures WHERE id=?')
        f_id = request.args.get('f_id', None)

        result = query_db(get_figure_image_sql, (f_id,), True)
        image = {"image": ""}
        for res in result:
            image["image"] = res
        try:
            return send_from_directory(current_app.config['STATIC_URL_PATH'], image["image"])
        except FileNotFoundError:
            abort(404)
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

@bp.route('/getfiguredata')
def getFigureData():
    if authenticateUser(request.args.get('u_id')):
        get_figure_data_sql =("SELECT description, color, id FROM Figures")
        result = select_db(get_figure_data_sql)
        result = result[:-1]
        data = []
        for res in result:
            data.append({"description" : res[0], "color" : res[1], "id" : res[2]})
        return json.dumps(data)
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)
    
    
@bp.route('/getmap')
def getMap():
    if authenticateUser(request.args.get('u_id')):
        get_map_sql =('SELECT map FROM Project WHERE id=?')
        args = (request.args.get('p_id'),)
        result = query_db(get_map_sql, args, True)
        image = {"image": ""}
        if result != 0 and result[0] != None:
            for res in result:
                image["image"] = "./uploads/" + res
            try:
                return send_from_directory(Config.STATIC_URL_PATH, image["image"])
            except FileNotFoundError:
                abort(404)
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)
    

@bp.route('/favicon.ico')
def favicon():
    try:
        return send_from_directory(Config.STATIC_URL_PATH, "favicon.ico")
    except FileNotFoundError:
        abort(404)

@bp.route('/addevent', methods=['POST'])
def addEvent():
    if authenticateUser(request.form.get('u_id')):
        add_event = ("INSERT INTO Event "
              "(direction, center_coordinate, created, image_size_when_created, f_id) "
              "VALUES (?,?,?,?,?)")
        project_id = request.form.get('p_id') 
        d_event_values = (request.form.get('direction'), request.form.get('center_coordinate'), 
                            request.form.get('created'), request.form.get('image_size'), request.form.get('f_id'))
        e_id = query_db(add_event, d_event_values) # Adds to Event table in db
        add_relation = ("INSERT INTO Project_has_Event "
              "(p_id, e_id) "
              "VALUES (?,?)")
        query_db(add_relation, (project_id, e_id[-1])) # Adds to the relation table in db
        return {}
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)
# add both to event and Project_has_Event

@bp.route('/upload', methods=['POST'])
def fileUpload():
    if authenticateUser(request.form.get('u_id')):
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
                if request.form.get('map') == "true":
                    addMapName(str(unique - 1) + filename, request.form.get('p_id'), request.form.get('u_id'))
                elif request.form.get('map') == "false":
                    screenshot(str(unique - 1) + filename, request.form.get('p_id'), request.form.get('u_id'))
            else:
                if request.form.get('map') == "true":
                    addMapName(filename, request.form.get('p_id'), request.form.get('u_id'))
                elif request.form.get('map') == "false":
                    screenshot(filename, request.form.get('p_id'), request.form.get('u_id'))
        else:
            raise InvalidUsage("Not allowed file ending", status_code=400)
        try:
            logger.info("file uploaded")
            file.save(destination)
            return {"file": filename}, 201
        except:
            logger.info("Failed to upload image")
            raise InvalidUsage("Failed to upload image", status_code=500)
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)
    

def screenshot(image_name, p_id, u_id):
    screenshot_sql = ("UPDATE Project SET screenshot=? WHERE id=? AND u_id=?")
    screenshot = (image_name, p_id, u_id)
    query_db(screenshot_sql, screenshot)

@bp.route('/getscreenshot')
def getScreenshot():
    if authenticateUser(request.args.get('u_id')):
        get_map_sql =('SELECT screenshot FROM Project WHERE id=? AND u_id=?')
        args = (request.args.get('p_id'),request.args.get('u_id'))
        result = query_db(get_map_sql, args, True)
        image = {"image": ""}
        if result != 0:
            for res in result:
                if type(res) != int:
                    image["image"] = "./uploads/" + res
        try:
            return send_from_directory(current_app.config['STATIC_URL_PATH'], image["image"])
        except FileNotFoundError:
            abort(404)
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

def getElementXandY(element):
    stringCoord = element.split(",")
    intCoord = list(map(float, stringCoord))
    return intCoord

def findNewCoordinates(leftX, lowerY, rightX, upperY, imgCoordinates, screenSize):
    imgCoordinates = getElementXandY(imgCoordinates)
    screenSize = getElementXandY(screenSize)
    startPoint = [leftX, upperY] 

    lengthMapX = rightX - leftX
    lenghtMapY = upperY - lowerY
    onePixelX = lengthMapX / screenSize[0]
    onePixelY = lenghtMapY / screenSize[1]

    pixelsFromStartX = imgCoordinates[0]
    distanceFromX = pixelsFromStartX * onePixelX
    pixelsFromStartY = imgCoordinates[1]
    distanceFromY = pixelsFromStartY * onePixelY
    newX = startPoint[0] + distanceFromX
    newY = startPoint[1] - distanceFromY

    newCoordinates = [newX, newY]
    return newCoordinates

@bp.route('/createarcgis', methods=['POST'])
def createARCGIS():
    if authenticateUser(request.form.get('u_id')):
        # step 1 create field. Step 2 populate fields
        # enter folder
        # shapefile = outline of a building and 
        target=os.path.join(Config.STATIC_URL_PATH, "shapefiles")
        if not os.path.isdir(target):
            os.mkdir(target)

        eventsJSON = get_events_func(request.form.get('p_id'))
        events = json.loads(eventsJSON)
        
        imageCoord = []
        screenSize = []
        for event in events:
            if type(event) == list:
                imageCoord.append(event[2])
                screenSize.append(event[3])

        get_proj_sql = ("SELECT * FROM Project WHERE id=?")
        pid = (request.form.get('p_id'))
        project_values = query_db(get_proj_sql, (str(pid),), True)
        leftX = float(project_values[9])
        lowerY = float(project_values[10])
        rightX = float(project_values[11])
        upperY = float(project_values[12])

        iconCoord = []

        for i in range(len(imageCoord)):
            iconCoord.append(findNewCoordinates(leftX, lowerY, rightX, upperY, imageCoord[i], screenSize[i]))
        # autoincrement
        arcgis_filename = "yote",
        # location = 'behaviormapper/static/shapefiles/tree'
        w = shp.Writer('behaviourmapper/static/shapefiles/test')

        
        # w = shp.Writer(os.path.join(target, 'tree'))
        # clog her
        w.autoBalance = 1
        w.field('Background', 'C', '40') # image

        point_ID = 1
        
        for coordinateSet in iconCoord:
            x = coordinateSet[0]
            y = coordinateSet[1]
            w.point(x, y)
            w.record(str(point_ID), 'Point')
            point_ID += 1

        with zipfile.ZipFile('QGIS_SHAPEFILES.zip', 'w', compression=zipfile.ZIP_DEFLATED) as my_zip:
            absPath = os.path.abspath('shapefiles')
            filesLocation = 'behaviourmapper/static/shapefiles'
            for filename in os.listdir(filesLocation):
                f = os.path.join(filesLocation, filename)
                if os.path.isfile(f):
                    my_zip.write(f)
    
        return exportARCGIS()
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

def exportARCGIS(): #path, ziph):
    placement = os.path.abspath('QGIS_SHAPEFILES.zip')
    try:
        return send_file(placement)
    except FileNotFoundError:
        abort(404)

def addMapName(mapname, p_id, u_id):
    add_map_name_sql = ("UPDATE Project SET map=? WHERE id=? AND u_id=?")
    values = (mapname, p_id, u_id)
    res = query_db(add_map_name_sql, values, True)
    return {"res": res}
