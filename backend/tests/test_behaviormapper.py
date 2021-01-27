import json
import pytest
import io
from behaviormapper import app
from datetime import datetime, date
import os

basedir = os.path.abspath(os.path.dirname(__file__))


@pytest.fixture
def client():
    testing_client = app.test_client()
    yield testing_client


def test_hello(client):
    rv = client.get('/hello')
    assert json.loads(rv.data) == {'result': "Koplingen mellom flask og react fungerer WEE!"}

def test_db(client):
    rv = client.get(('/initdb'),follow_redirects=True)
    dbtest = {"Users": [1,"kartet"],
        "Event": [1,45,"12991.29291 2929.21","12:12:12",52],
        "Project": [1,"prosjektnamn", "beskrivelse", "kartet","1998-01-30 12:23:43","1998-01-30 12:23:43","zoom",1],
        "Project_has_Event": [1,1],
        "Figures": [1,"bike","blue","./icons/man/bike.png", None]
        }
    assert json.loads(rv.data) == dbtest

def test_faviconico(client):
    rv = client.get(('/favicon.ico'))
    assert rv.status_code != 404

def test_upload_text(client):
    filename = "fake_textfile.txt"
    data = { "file": (io.BytesIO(b"some text data"), filename) }
    rv = client.post(('/upload'), data=data)
    assert rv.status_code == 400

def test_upload_image(client):
    image = "bike.png"
    data = { "file": (open("behaviormapper/static/icons/man/bike.png", 'rb'), image) }
    rv = client.post(('/upload'), data=data)
    assert rv.status_code == 201
    assert rv.json['file'] == image
