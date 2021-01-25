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

def test_db(client):
    rv = client.get(('/initdb'),follow_redirects=True)
    dbtest = {"Users": [1,"kartet"],
        "Event": [1,45,"12991.29291 2929.21","12:12:12",0,52],
        "Project": [1,"prosjektnamn", "beskrivelse", "kartet","1998-01-30 12:23:43","1998-01-30 12:23:43","zoom",1],
        "Project_has_Event": [1,1],
        "Figures": [1,"bike","blue","../icons/man/bike.png", None]
        }
    assert json.loads(rv.data) == dbtest