import json
import pytest
from behaviormapper import app
from datetime import datetime, date


@pytest.fixture
def client():
    return app.test_client()


def test_hello(client):
    rv = client.get('/hello')
    assert json.loads(rv.data) == {'result': "Koplingen mellom flask og react fungerer WEE!"}

# Kommentert ut til db er convertert til sqlite3
# def test_db(client):
#     rv = client.get(('/initdb'),follow_redirects=True)
#     dbtest = {"bruker": [[1,"kartet"]],
#         "hendelse": [[1,"kartet","45","12991.29291,2929.21","12:12:12",0,1]],
#         "kart": [[1,"kartet","1998-01-30 12:23:43","1998-01-30 12:23:43","zoom",1]],
#         "kart_has_person": [[1,1]],
#         "person": [[1,"kartet",0,"blue","attributter"]]
#         }
#     assert json.loads(rv.data) == dbtest