import json
import logging
import os
import shutil
import zipfile
import csv
from datetime import date, datetime
from time import time, sleep

import shapefile as shp
from flask import (Blueprint, Flask, abort, current_app, flash, g, redirect,
                   request, send_file, send_from_directory, session, url_for)
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename

from . import oidc
from .config import Config
from .db import init_db, query_db, select_db
from .errorhandlers import InvalidUsage

if os.getenv('FLASK_ENV') == "development":
    bp = Blueprint('behaviourmapper', __name__, url_prefix="/behaviourmapper")    
else:
    bp = Blueprint('behaviourmapper', __name__)

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
        if os.getenv('FLASK_ENV') == "development":
            return redirect('http://localhost:3000/behaviourmapper/startpage')   
        else:
            return redirect('https://www.ux.uis.no/behaviourmapper/startpage')
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
            "(name, description, startdate, originalsize, zoom, leftX, lowerY, rightX, upperY, u_id, questions)"
            "VALUES (?,?,?,?,?,?,?,?,?,?,?)")
        small_project_values = (request.form.get('name'), request.form.get('description'), 
                            request.form.get('startdate'), request.form.get('zoom'),
                            request.form.get('originalsize'), request.form.get('leftX'), 
                            request.form.get('lowerY'), request.form.get('rightX'), 
                            request.form.get('upperY'), request.form.get('u_id'),
                            request.form.get('questions'))
        p_id = query_db(add_small_project, small_project_values)
        return {"p_id": p_id}
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)


@bp.route('/deleteproject', methods=['POST'])
def deleteProject():
    if authenticateUser(request.form.get('u_id')):
        p_id = request.form.get('p_id')
        deleteAllEvents(p_id)
        deleteImage(p_id)

        delete_project = ("DELETE FROM Project WHERE id=?")
        deleteInterviewRelatedDatabaseObjects(p_id)
        res = query_db(delete_project, (p_id,), True)
        return res
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

def deleteInterviewRelatedDatabaseObjects(p_id):
    try:         
        int(p_id)    
    except:         
        raise InvalidUsage("Bad arg", status_code=400)
    get_InterviewIds_sql = ("SELECT id FROM InterviewObjects WHERE p_id=?")
    query_io_ids = query_db(get_InterviewIds_sql, (p_id,))
    query_io_ids = query_io_ids[:-1]

    delete_Interview_object_sql = ("DELETE FROM InterviewObjects WHERE p_id=?")
    query_db(delete_Interview_object_sql, (p_id,))

    get_figureIds_sql = ("SELECT if_id FROM InterviewObjects_has_InterviewFigures WHERE io_id=?")
    for io_id in query_io_ids:
        query_if_ids = query_db(get_figureIds_sql, (io_id[0],))
        query_if_ids = query_if_ids[:-1]
    
        for if_id in query_if_ids:
            delete_IO_has_IF_sql = ("DELETE FROM InterviewObjects_has_InterviewFigures WHERE if_id=?")
            delete_Interview_Figure_sql = ("DELETE FROM InterviewFigures WHERE id=?")
            query_db(delete_IO_has_IF_sql, (if_id[0],))
            query_db(delete_Interview_Figure_sql, (if_id[0],))

    return 'Deleted all Interview related Information'

def deleteAllEvents(p_id):
    delete_event = ("DELETE FROM Event WHERE id=?")
    eventsJSON = get_events_func(p_id)
    events = json.loads(eventsJSON)
    for event in events:
        e_id = event[0]
        deleteProjectHasEvent(e_id)
        res = query_db(delete_event, (e_id,), True)
    return "deleted all events"

def deleteProjectHasEvent(e_id):
    delete_project_has_event = ("DELETE FROM Project_has_Event WHERE e_id=?")
    res = query_db(delete_project_has_event, (e_id,), True)
    return res

@bp.route('/deleteevent', methods=['POST'])
def deleteEvent():
    if authenticateUser(request.form.get('u_id')):
        p_id = request.form.get('p_id')
        number = int(request.form.get('number'))
        
        eventsJSON = get_events_func(p_id)
        events = json.loads(eventsJSON)
        
        event = events[number]
        e_id = event[0]
        res = deleteProjectHasEvent(e_id)
        
        delete_event = ("DELETE FROM Event WHERE id=?")
        res = query_db(delete_event, (e_id,), True)
        
        return {}
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

@bp.route('/updateeventwithcomment', methods=['POST'])
def updateEventWithComment():
    if authenticateUser(request.form.get('u_id')):
        p_id = request.form.get('p_id')
        whichEvent = int(request.form.get('whichEvent'))
        e_id = json.loads(get_events_func(p_id))[whichEvent][0] 
        
        update_event = ("UPDATE Event SET comment=? WHERE id=?")
        query_db(update_event, (request.form.get('comment'), e_id,), True)
        
        return {}
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

def deleteImage(p_id):
    find_image_name = ("SELECT map, screenshot FROM Project WHERE id=?") 
    image_names = query_db(find_image_name, (p_id,), True)
    target=os.path.join(Config.UPLOAD_FOLDER)
    for filename in os.listdir(target):
        if filename == image_names[0] or filename == image_names[1]:
            location = os.path.join(target, filename)
            if os.path.isfile(location):
                os.remove(location)

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
        add_interview = ("INSERT INTO InterviewObjects (interview, p_id) VALUES (?,?)")
        args = (request.form.get('interview'), request.form.get('p_id'))
        i_id = query_db(add_interview, args)
        return {"i_id": i_id}
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

@bp.route('/updateinterview', methods=['POST'])
def updateInterview():
    if authenticateUser(request.form.get('u_id')):
        add_interview = ("UPDATE InterviewObjects SET interview=? WHERE id=?")
        args = (request.form.get('interview'), request.form.get('io_id'))
        i_id = query_db(add_interview, args)
        return {"i_id": i_id}
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

@bp.route('/getquestionsfromproject')
def getQuestionsFromProject():
    if authenticateUser(request.args.get('u_id')):
        get_questions = ('SELECT questions FROM Project WHERE id=?')
        values = (request.args.get('p_id'),)
        questions = query_db(get_questions, values, True)
        return {'questions': questions[0]}
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
            get_proj_sql = ("SELECT id, name, description, screenshot FROM Project WHERE u_id=?")
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
    events = []

    for e_id in e_ids:
        query_event = query_db(get_event_sql, (str(e_id),), True)
        events.append((query_event[0],query_event[1],query_event[2],query_event[3],query_event[4], query_event[5], query_event[6]))
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
        if result != 0:
            for res in result:
                image["image"] = res
        else:
            return {}
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
        get_figure_data_sql =("SELECT description, color, id, descriptionNO FROM Figures")
        result = select_db(get_figure_data_sql)
        result = result[:-1]
        data = []
        for res in result:
            data.append({"description" : res[0], "color" : res[1], "id" : res[2], "descriptionNO" : res[3]})
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

@bp.route('/updateiconsize')
def addSizeToProject():
    if authenticateUser(request.form.get('u_id')):
        update_sql = ("UPDATE Project SET iconSize=? WHERE id=?")
        values = (request.args.get('iconSize'), request.args.get('p_id'))
        query_db(update_sql, values)
        return {"Status": "Success"}
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

@bp.route('/addevent', methods=['POST'])
def addEvent():
    if authenticateUser(request.form.get('u_id')):
        add_event = ("INSERT INTO Event "
              "(direction, center_coordinate, created, image_size_when_created, f_id) "
              "VALUES (?,?,?,?,?)")
        project_id = request.form.get('p_id') 
        d_event_values = (request.form.get('direction'), request.form.get('center_coordinate'), 
                        request.form.get('created'), request.form.get('image_size'), 
                        request.form.get('f_id'))
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
    if type(imgCoordinates) == str:
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

# When InterviewEvents are added to db, they need to be added here.
@bp.route('/exporttocsv', methods=['POST'])
def exportToCsv():
    if authenticateUser(request.form.get('u_id')):
        project_fromdb = query_db('SELECT * FROM Project WHERE u_id=? AND id=? ', (request.form.get('u_id'),request.form.get('p_id')), True)
        if project_fromdb[15] != "0":
            all_interview_objects_fromdb = query_db('SELECT * FROM InterviewObjects WHERE p_id=?', (request.form.get('p_id'),))
            writeInterviewObjectsToCSV(all_interview_objects_fromdb)
            clearEventsCSV()
        else:
            all_events_fromdb = query_db('SELECT e_id FROM Project_has_Event WHERE p_id=?', (request.form.get('p_id'),))
            writeEventsToCSV(all_events_fromdb)
            clearInterviewObjectsCSVs()
        writeProjectToCSV(project_fromdb)
        zip_files('csvfiles', 'w', 'All')
        return sendFileToFrontend('csvfiles.zip')
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

def writeProjectToCSV(project_fromdb):
    project_data = ({
        'id':project_fromdb[0], 
        'name':project_fromdb[1],
        'description':project_fromdb[2],
        'map':project_fromdb[3],
        'screenshot':project_fromdb[4],
        'startdate':project_fromdb[5],
        'enddate':project_fromdb[6],
        'originalsize':project_fromdb[7],
        'zoom':project_fromdb[8],
        'leftX':project_fromdb[9],
        'lowerY':project_fromdb[10],
        'rightX':project_fromdb[11],
        'upperY':project_fromdb[12],
        'iconSize':project_fromdb[13],
        'questions':project_fromdb[15]})
    proj_fieldnames = ['id', 'name','description','map','screenshot','startdate','enddate','originalsize','zoom','leftX','lowerY','rightX','upperY','iconSize','questions']
    with open(os.path.join(Config.CSVFILES_FOLDER, "project.csv"), 'w+') as f:
        writer = csv.DictWriter(f, proj_fieldnames)
        writer.writeheader()
        writer.writerow(project_data)

def writeEventsToCSV(all_events_fromdb):
    event_data, events = [], []
    for event in all_events_fromdb:
        if event != 0:
            events.append(query_db('SELECT * FROM Event WHERE id=?', (event[0],), True))
    for data in events:
        if data[6] != 0:
            figure = (query_db('SELECT description, color FROM Figures WHERE id=?', (data[6],), True))
            event_data.append({
                'id':data[0], 
                'direction':data[1], 
                'center_coordinate':data[2],
                'image_size_when_created': data[3],
                'created': data[4],
                'comment': data[5],
                'f_id': data[6],
                'description': figure[0],
                'color': figure[1]})
    event_fieldnames = ['id', 'direction', 'center_coordinate', 'image_size_when_created', 'created', 'comment', 'f_id', 'description', 'color']
    with open(os.path.join(Config.CSVFILES_FOLDER, "events.csv"), 'w+') as f:
        writer = csv.DictWriter(f, event_fieldnames)
        writer.writeheader()
        for i in range(len(event_data)):
            writer.writerow(event_data[i])


def writeInterviewObjectsToCSV(all_interview_objects_fromdb):
    interview_object_with_figure_ids, io_data = [], []
    for interview_object in all_interview_objects_fromdb:
        if interview_object != 0:
            interview_object_with_figure_ids.append([interview_object,getAllInterviewObjectsFigures(interview_object[0])])
    for interview_object in interview_object_with_figure_ids:
        if interview_object != 0:
            io_data.append({
                'id':interview_object[0][0], 
                'interview':interview_object[0][1], 
                'p_id':interview_object[0][2],
                'if_ids': interview_object[1],
            })
    fieldnames = ['id', 'interview', 'p_id', 'if_ids']
    with open(os.path.join(Config.CSVFILES_FOLDER, "interviewObjects.csv"), 'w+') as f:
        writer = csv.DictWriter(f, fieldnames)
        writer.writeheader()
        for i in range(len(io_data)):
            writer.writerow(io_data[i])
    writeInterviewObjectFiguresToCSV(interview_object_with_figure_ids)


def writeInterviewObjectFiguresToCSV(interview_object_with_figure_ids):
    iof_data = []
    for interview_object in interview_object_with_figure_ids:
        if interview_object[1] != 0:
            for figure_id in interview_object[1]:
                if figure_id != 0:
                    figure_data = query_db('SELECT * FROM InterviewFigures WHERE id=?', (figure_id,), True)
                    iof_data.append({
                        'id':figure_data[0], 
                        'points': figure_data[1],
                        'color': figure_data[2],
                        'type': figure_data[4]
                    })
    fieldnames = ['id','points', 'color', 'type']
    with open(os.path.join(Config.CSVFILES_FOLDER, "interviewObjectFigures.csv"), 'w+') as f:
        writer = csv.DictWriter(f, fieldnames)
        writer.writeheader()
        for i in range(len(iof_data)):
            writer.writerow(iof_data[i])


def getAllInterviewObjectsFigures(figure_id):
    figure_ids = []
    if_ids = query_db('SELECT if_id FROM InterviewObjects_has_InterviewFigures WHERE io_id=?', (figure_id,))
    for if_id in if_ids:
        if if_id != 0:
            figure_ids.append(if_id[0])
    return figure_ids


def clearEventsCSV():
    with open(os.path.join(Config.CSVFILES_FOLDER, "events.csv"), 'w+') as f:
        writer = csv.DictWriter(f, "")
        writer.writeheader()
        writer.writerow({})


def clearInterviewObjectsCSVs():
    with open(os.path.join(Config.CSVFILES_FOLDER, "interviewObjectFigures.csv"), 'w+') as f:
        writer = csv.DictWriter(f, "")
        writer.writeheader()
        writer.writerow({})
    with open(os.path.join(Config.CSVFILES_FOLDER, "interviewObjects.csv"), 'w+') as f:
        writer = csv.DictWriter(f, "")
        writer.writeheader()
        writer.writerow({})


def findEventColorAndDesciription(f_id):
    if f_id == '':
        return None
    get_DescCol_sql = ("SELECT description, color FROM Figures WHERE id=?")
    query_res = query_db(get_DescCol_sql, (f_id,), True)
    res = ['empty', 'space']
    res[0] = query_res[0]
    if query_res[1] == 'blue':
        res[1] = 'Man'
    elif query_res[1] == 'red':
        res[1] = 'Woman'
    elif query_res[1] == 'green':
        res[1] = 'Child'
    elif query_res[1] == 'yellow':
        res[1] = 'Group'
    else:
        return None
    return res

def generateDictOfEvents(events):
    actionDict = {}
    # 1-16 men, 17-32 women, 33-48 children, 49+ = groups
    
    for event in events:
        f_id = event[len(event)-1]
        actionGroup = findEventColorAndDesciription(f_id)
        if actionGroup != None:
            if type(event) == list:
                action = actionGroup[0]
                if action not in actionDict:
                    listOfEvents = []
                    listOfEvents.append(event)
                    actionDict[action] = listOfEvents
                elif action in actionDict:
                    existingListOfEvents = actionDict[action]
                    existingListOfEvents.append(event)
                    actionDict[action] = existingListOfEvents

    dictAllEventsOfGroup = {'Events': events, 'Man': [], 'Woman': [], 'Child': [], 'Group': []}

    sortedDict = {}
    for eventType in dict.keys(actionDict):
        allExamplesOfAction = actionDict[eventType]
        eventTypeGroupsort = {'Man': [], 'Woman': [], 'Child': [], 'Group': [], 'All': []}
        sortedDict[eventType] = eventTypeGroupsort

        for event in allExamplesOfAction:
            eventTypeGroupsort = sortedDict[eventType]
            f_id = event[len(event)-1]
            actionGroup = findEventColorAndDesciription(f_id)
            personType = actionGroup[1]
            
            entireEventList = eventTypeGroupsort['All']
            entireEventList.append(event)
            eventTypeGroupsort['All'] = entireEventList

            actionListByPersonType = eventTypeGroupsort[personType]
            actionListByPersonType.append(event)
            eventTypeGroupsort[personType] = actionListByPersonType

            allPersonTypeEvents = dictAllEventsOfGroup[personType]
            allPersonTypeEvents.append(event)
            dictAllEventsOfGroup[personType] = allPersonTypeEvents

    sortedDict['all'] = dictAllEventsOfGroup
    return sortedDict

@bp.route('/createarcgis', methods=['POST'])
def createARCGIS():
    if authenticateUser(request.form.get('u_id')):
        target=os.path.join(Config.STATIC_URL_PATH, "shapefiles")
        if not os.path.isdir(target):
            os.mkdir(target)
        
        get_proj_sql = ("SELECT * FROM Project WHERE id=?")
        pid = (request.form.get('p_id'))
        project_values = query_db(get_proj_sql, (str(pid),), True)

        leftX = float(project_values[9])
        lowerY = float(project_values[10])
        rightX = float(project_values[11])
        upperY = float(project_values[12])

        geografiskSpørreundersøkelse = project_values[15]
        path = ""

        if geografiskSpørreundersøkelse != "0":
            sortedInterviewObjectsJSON = getInterviewFiguresSorted(pid)
            sortedInterviewObjects = json.loads(sortedInterviewObjectsJSON)
            
            mode = 'w'
            for io in range(len(sortedInterviewObjects)):
                interviewObjectDict = sortedInterviewObjects[io]
                
                interviewFolderList = writeGeographicQuestioningShapefiles(interviewObjectDict, leftX, lowerY, rightX, upperY, io)
                if mode  == 'w':
                    zip_files('geographicQuestioning', str(mode), interviewFolderList)
                    mode = 'a'
                else:
                    zip_files('geographicQuestioning', str(mode), interviewFolderList)
                resetGeographicFolderNames()
            return sendFileToFrontend('geographicQuestioning.zip')

        if geografiskSpørreundersøkelse == "0":
            eventsJSON = get_events_func(pid)
            events = json.loads(eventsJSON)
            sortedEvents = generateDictOfEvents(events)
            sendTheseFoldersList = writeBehaviorMapper(sortedEvents, leftX, lowerY, rightX, upperY)
            zip_files('shapefiles', 'w', sendTheseFoldersList)
            return sendFileToFrontend('shapefiles.zip')

        return "empty file"
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

def makeFolder(location, foldername):
    path = os.path.join(location, foldername)
    os.mkdir(path)

def writeBehaviorMapper(sortedEvents, leftX, lowerY, rightX, upperY):
    path = Config.SHAPEFILES_FOLDER
    sendTheseFoldersList = []
    for key in dict.keys(sortedEvents):
        innerDict = sortedEvents[key]
        for innerKey in dict.keys(innerDict):
            foldername = key + innerKey
            exists = doesFolderExist(path, foldername)
            filename = foldername

            if exists == False:
                makeFolder(path, foldername)

            if exists == True: # for senere utvikling av vilkårlige ikoner
                filename = findFileName(path, foldername)

            eventGroup = innerDict[innerKey]

            shapeFileName = path + '/' + str(foldername) + '/' + str(filename)
            
            w = shp.Writer(shapeFileName)
            w.field('Background', 'C', '40')
            point_ID = 1

            if len(eventGroup) != 0:
                sendTheseFoldersList.append(foldername)
            
            for event in eventGroup:
                newCoords = findNewCoordinates(leftX, lowerY, rightX, upperY, event[2], event[3])
                x = newCoords[0]
                y = newCoords[1]
                w.point(x, y)
                w.record(str(point_ID), 'Point')
                point_ID += 1
            w.close()
    return sendTheseFoldersList

def writeGeographicQuestioningShapefiles(interviewObjectDict, leftX, lowerY, rightX, upperY, interviewObjectNumber):
    sendTheseFoldersList = []
    path = Config.GEOGRAPHIC_QUESTIONING_FOLDER
    for objectType in dict.keys(interviewObjectDict):
        innerDict = interviewObjectDict[objectType]
        for context in dict.keys(innerDict):
            dictObjectByContext = innerDict[context]
            if len(dictObjectByContext) > 0:
                filename = objectType + context
                
                foldername = objectType + context + '_INtObj_' + str(interviewObjectNumber+1)
                incrementGeographicFolderNames(filename, foldername)
                sendTheseFoldersList.append(foldername)
                exists = doesFolderExist(path, foldername)
                if exists == True:
                    filename = findFileName(path, foldername)
                
                dictObjectByContext = innerDict[context]
                point_ID = 0
                shapeFileName = path + '/' + foldername + '/' + filename
                if dictObjectByContext != []:
                    w = shp.Writer(shapeFileName)
                    w.field('Background', 'C', '40')
                    for i in range(len(dictObjectByContext)):
                        drawnObject = dictObjectByContext[i]
                        coordinateList = drawnObject[1]
                        floatCoordinateList = getElementXandY(drawnObject[1])
                        pairsOfCoordinates = getPairsOfCoordinatesFromFloatList(floatCoordinateList)
                        screenSizeWhenCreated = drawnObject[3]
                        for j in range(len(pairsOfCoordinates)):
                            coordinates = pairsOfCoordinates[j]
                            newCoords = findNewCoordinates(leftX, lowerY, rightX, upperY, coordinates, screenSizeWhenCreated)
                            pairsOfCoordinates[j] = newCoords
                        if objectType == 'Line':
                            w.line([pairsOfCoordinates])
                            w.record(str(point_ID), str(objectType))
                        elif objectType == 'Area':
                            w.poly([pairsOfCoordinates])
                            w.record(str(point_ID), str(objectType))
                        elif objectType == 'Point':
                            coord = pairsOfCoordinates[0]
                            w.point(coord[0], coord[1])
                            w.record(str(point_ID), str(objectType))
                        point_ID += 1
                    w.close()
    return sendTheseFoldersList

def incrementGeographicFolderNames(oldfoldername, newname):
    path = Config.GEOGRAPHIC_QUESTIONING_FOLDER
    for filename in os.listdir(path):
        foldername_path = os.path.join(path, filename)
        if os.path.isdir(foldername_path):
            if filename == oldfoldername:
                newname_path = os.path.join(path, newname)
                os.rename(foldername_path, newname_path)
   
def resetGeographicFolderNames():
    path = Config.GEOGRAPHIC_QUESTIONING_FOLDER
    files = os.listdir(path)
    for filename in os.listdir(path):
        foldername_path = os.path.join(path, filename)
        if os.path.isdir(foldername_path):
            filename_split = filename.split('_')
            if len(filename_split) > 1:
                newname = filename_split[0]
                newname_path = os.path.join(path, newname)
                os.rename(foldername_path, str(newname_path))

def getPairsOfCoordinatesFromFloatList(listOfCoordinates):
    allCoords = []
    cordNum = 0
    pairXY = []
    for coord in listOfCoordinates:
        pairXY.append(coord)
        cordNum += 1
        if cordNum == 2:
            allCoords.append(pairXY)
            pairXY = []
            cordNum = 0  
    return allCoords

def getInterviewFiguresSorted(p_id):
    try:         
        int(p_id)    
    except:         
        raise InvalidUsage("Bad arg", status_code=400)
    get_InterviewIds_sql = ("SELECT id FROM InterviewObjects WHERE p_id=?")
    query_io_ids = query_db(get_InterviewIds_sql, (p_id,))
    
    query_io_ids = query_io_ids[:-1]

    interviewObjectDict = []
    for io_id in query_io_ids:

        get_figureIds_sql = ("SELECT if_id FROM InterviewObjects_has_InterviewFigures WHERE io_id=?")     
        query_if_ids = query_db(get_figureIds_sql, (io_id[0],))
        query_if_ids = query_if_ids[:-1]

        if_ids = []
        for if_id in query_if_ids:
            if_ids.append(if_id[0])

        get_figure_sql = ("SELECT * FROM InterviewFigures WHERE id=?")


        dictAllInterviewFigureTypes = {}
        for if_id in if_ids:
            query_figure = query_db(get_figure_sql, (str(if_id),), True)
            emotionalContext = findEmotionalContext(query_figure[2])

            if query_figure[-1] not in dictAllInterviewFigureTypes:
                dictByContext = {'Positive': [], 'Negative': [], 'Neutral': []}

                objectInContext = dictByContext[emotionalContext]
                objectInContext.append((query_figure[0],query_figure[1],query_figure[2],query_figure[3], query_figure[4]))
                dictByContext[emotionalContext] = objectInContext

                dictAllInterviewFigureTypes[query_figure[-1]] = dictByContext
            else:
                innerDict = dictAllInterviewFigureTypes[query_figure[-1]]  
                objectInContext = innerDict[emotionalContext]
                objectInContext.append((query_figure[0],query_figure[1],query_figure[2],query_figure[3], query_figure[4]))
                innerDict[emotionalContext] = objectInContext
                dictAllInterviewFigureTypes[query_figure[-1]] = innerDict
        interviewObjectDict.append(dictAllInterviewFigureTypes)
    return json.dumps(interviewObjectDict)

def findEmotionalContext(color):
    context = None
    if color == "#008000":
        context = 'Positive'
    elif color == "#ff0000":
        context = 'Negative'
    elif color == "#000000":
        context = 'Neutral'
    return context

@bp.route('/addinterviewfigure', methods=['POST'])
def addInterviewFigure():
    if authenticateUser(request.form.get('u_id')):
        add_int_figure = ('INSERT INTO InterviewFigures'
            '(points, color, image_size_when_created, type)'
            'VALUES (?,?,?,?)')
        add_relation = ('INSERT INTO InterviewObjects_has_InterviewFigures (io_id, if_id) VALUES (?,?)')
        
        add_int_values = (request.form.get('points'),request.form.get('color'),request.form.get('image_size'),request.form.get('type'))
        ief_id = query_db(add_int_figure, add_int_values, True)
        relation_values = (request.form.get('io_id'), ief_id)
        query_db(add_relation, relation_values, True)
        return {}
    else:
        logger.info("Not logged in.")
        raise InvalidUsage("Bad request", status_code=400)

def doesFolderExist(location, folderName):
    folder = os.path.join(location, folderName)
    if os.path.exists(folder):
        return True
    return False
 
def findFileName(path, foldername):
    filesLocation = os.path.join(path, foldername)
    for filename in os.listdir(filesLocation):
        if filename.endswith((".shp", "_files")):
            return filename
    return foldername


def sendFileToFrontend(file):
    placement = os.path.join(Config.ZIPFILES_FOLDER, file)
    try:
        return send_file(placement)
    except FileNotFoundError:
        print('File Not Found')
        abort(404)

def zip_files(typeOfFiles, zipfileAction, modifiedFoldersList):
    with zipfile.ZipFile(os.path.join(Config.ZIPFILES_FOLDER, (typeOfFiles + '.zip')), str(zipfileAction), compression=zipfile.ZIP_DEFLATED) as my_zip:
        absPath = os.path.abspath(typeOfFiles)
        if typeOfFiles == "csvfiles":
            filesLocation = Config.CSVFILES_FOLDER
        elif typeOfFiles == "shapefiles":
            filesLocation = Config.SHAPEFILES_FOLDER
        elif typeOfFiles == 'geographicQuestioning':
            filesLocation = Config.GEOGRAPHIC_QUESTIONING_FOLDER
        for filename in os.listdir(filesLocation):
            f = os.path.join(filesLocation, filename)
            arcname = f[len(filesLocation) + 1:]
            if os.path.isfile(f):
                if str(zipfileAction) != 'a':
                    my_zip.write(f, arcname=arcname)
            elif os.path.isdir(f): #shapefiles / geoq
                if modifiedFoldersList != 'All':
                    if filename in modifiedFoldersList:
                        for root, dirs, files in os.walk(f): #bikeall, areapositive
                            for fname in files: # add files
                                my_zip.write(os.path.join(root, fname),
                                os.path.relpath(os.path.join(root, fname),
                                os.path.join(f, '..')))
                else:
                    for root, dirs, files in os.walk(f):
                        for fname in files:
                            my_zip.write(os.path.join(root, fname),
                            os.path.relpath(os.path.join(root, fname),
                            os.path.join(f, '..')))

def addMapName(mapname, p_id, u_id):
    add_map_name_sql = ("UPDATE Project SET map=? WHERE id=? AND u_id=?")
    values = (mapname, p_id, u_id)
    res = query_db(add_map_name_sql, values, True)
    return {"res": res}
