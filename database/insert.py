# Alt er kopiert fra https://dev.mysql.com/doc/connector-python/en/connector-python-example-cursor-transaction.html
from __future__ import print_function
from datetime import date, datetime, timedelta
import mysql.connector

cnx = mysql.connector.connect(user='root', database='behaviormapper')
cursor = cnx.cursor()

tomorrow = datetime.now().date() + timedelta(days=1)

add_user = ("INSERT INTO bruker "
               "(brukerID, feideinfo) "
               "VALUES (%s, %s)")
add_event = ("INSERT INTO hendelse "
              "(hendelseID, beskrivelse, retning, center_koordinat, tidspunkt, synlig, person_personID) "
              "VALUES (%s,%s,%s,%s,%s,%s,%s)")
add_map = ("INSERT INTO kart "
              "(kartID, navn, startdato, kartcol, sluttdato, zoom, bruker_brukerID) "
              "VALUES (%s,%s,%s,%s,%s,%s,%s)")
add_person = ("INSERT INTO person "
              "(personID, kartet, synlig, farge, deltakende_attributter) "
              "VALUES (%(personID)s, %(kartet)s, %(synlig)s, %(farge)s, %(deltakende_attributter)s)")
add_relation = ("INSERT INTO kart_has_person "
              "(kart_kartID, person_personID) "
              "VALUES (%s, %s)")


data_employee = ('Geert', 'Vanderkelen', tomorrow, 'M', date(1977, 6, 14))

# Insert new employee
cursor.execute(add_user, data_employee)
emp_no = cursor.lastrowid

# Insert salary information
data_person = {
  'personID': emp_no,
  'kartet': 50000,
  'synlig': tomorrow,
  'farge': date(9999, 1, 1),
  'deltakende_attributter': "Heisann",
}
cursor.execute(add_person, data_person)

# Make sure data is committed to the database
cnx.commit()

cursor.close()
cnx.close()
