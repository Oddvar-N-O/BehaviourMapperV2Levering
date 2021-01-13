from app import app, query_db, init_db, select_db
from datetime import datetime, date
from flask import redirect, url_for
from time import time
import json

@app.route('/hello')
def say_hello_world():
    return {'result': "Koplingen mellom flask og react fungerer WEE!"}

#initdb, testdb og selectdb er kun til bruk for utvikling, må fjernes når det skal tas i bruk
@app.route('/initdb')
def initdb():
    init_db()
    return redirect(url_for("testdb"))

@app.route('/testdb')
def testdb():
    brid = query_db(add_user, user_values, True)
    prid = query_db(add_person, person_values, True)
    event_values = ("kartet", 45,"12991.29291,2929.21", datetime.now().time(), 0, prid)
    map_values = ("kartet", datetime(1998,1,30,12,23,43),datetime(1998,1,30,12,23,43), "zoom", brid)
    kaid = query_db(add_map, map_values, True)
    query_db(add_relation, (kaid, prid), True)
    query_db(add_event, event_values, True)
    return redirect(url_for("selectdb"))    

@app.route('/selectdb')
def selectdb():
    result = {}
    table_names = ("person", "bruker", "kart", "kart_has_person", "hendelse")
    for x in table_names:
        query_result = select_db(("SELECT * FROM {}".format(x)))
        result[x] = query_result
    return json.dumps(result, indent=4, sort_keys=True, default=str)

# Eksempler på bruk av alle felter til hver tabell i databasen.
person_values = ("kartet", 0,"blå", "attributter")
user_values = ("kartet",)
event_values = ("kartet", 45,"12991.29291 2929.21", datetime.now().time(), 0, "må hentes frå forrige eller noe")
map_values = ("kartet", datetime.now(),datetime(1998,1,30,12,23,43), "zoom", "må hentes frå forrige eller noe")

# sql for å bruke alle felt.
add_user = ("INSERT INTO bruker (feideinfo)"
               "VALUES (?)")
add_event = ("INSERT INTO hendelse "
              "(beskrivelse, retning, center_koordinat, tidspunkt, synlig, person_personID) "
              "VALUES (?,?,?,?,?,?)")
add_map = ("INSERT INTO kart "
              "(navn, startdato, sluttdato, zoom, bruker_brukerID) "
              "VALUES (?,?,?,?,?)")
add_person = ('INSERT INTO person (kartID, synlig, farge, deltakende_attributter) VALUES (?,?,?,?)')
add_relation = ("INSERT INTO kart_has_person "
              "(kart_kartID, person_personID) "
              "VALUES (?,?)")