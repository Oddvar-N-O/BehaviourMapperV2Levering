from app import app, query_db, init_db
from flask import redirect, url_for

@app.route('/hello')
def say_hello_world():
    return {'result': "Koplingen mellom flask og react fungerer WEE!"}

@app.route('/testdb')
def testdb():
    # result = query_db(add_user, ("kartet"))
    # print(result)
    # query_db(add_event, ("kartet"))
    # query_db(add_map, ("kartet"))
    # query_db(add_person, ("kartet"))
    query_db(('INSERT INTO person (kartID, synlig) VALUES (?, ?)'), ('kartet', 1))
    return redirect(url_for("query_db"))

@app.route('/initdb')
def initdb():
    init_db()
    return {'result': "database initiated"}

@app.route('/querydb')
def querydb():
    result = query_db(("SELECT * FROM person"), None)
    print(result)
    return {'result': result}

add_user = ("INSERT INTO bruker"
               "VALUE (%s,)")
add_event = ("INSERT INTO hendelse "
              "(beskrivelse, retning, center_koordinat, tidspunkt, synlig, person_personID) "
              "VALUES (%s,%s,%s,%s,%s,%s)")
add_map = ("INSERT INTO kart "
              "(navn, startdato, kartcol, sluttdato, zoom, bruker_brukerID) "
              "VALUES (%s,%s,%s,%s,%s,%s)")
add_person = ("INSERT INTO person "
              "(kartID, synlig, farge, deltakende_attributter) "
              "VALUES (%s, %s, %s, %s)")
add_relation = ("INSERT INTO kart_has_person "
              "(kart_kartID, person_personID) "
              "VALUES (%s, %s)")