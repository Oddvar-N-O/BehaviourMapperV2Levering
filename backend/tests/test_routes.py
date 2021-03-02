import os
import io
import json
import pytest
from datetime import datetime, date
from backend.behaviourmapper.config import Config

basedir = os.path.abspath(os.path.dirname(__file__))


def test_faviconico(client):
    rv = client.get(('/behaviourmapper/favicon.ico'))
    assert rv.status_code == 200

def test_getfigure(client):
    rv = client.get(('/behaviourmapper/getfigure?description=bike&color=red'))
    assert rv.status_code == 200

def test_getfiguredata(client):
    rv = client.get(('/behaviourmapper/getfiguredata'))
    dbtest = '{"description": "bike", "color": "blue", "id": 1}'
    decoded = rv.data.decode(encoding="utf-8", errors="strict")
    assert rv.status_code == 200
    assert decoded[1:50] == dbtest

def test_getfigure_err(client):
    rv = client.get(('/behaviourmapper/getfigure?description=bike&color=12'))
    assert rv.status_code == 400

def test_getevents(client):
    rv = client.get(('/behaviourmapper/getevents?p_id=1'))
    defaultEvent = b'[[1, 45, "12991.29291 2929.21", "12:12:12", 20]]'
    assert rv.status_code == 200
    assert rv.data == defaultEvent

def test_getevents_err(client):
    rv = client.get(('/behaviourmapper/getevents?p_id=bike'))
    assert rv.status_code == 400  

def test_upload_text(client):
    filename = "fake_textfile.txt"
    data = { "file": (io.BytesIO(b"some text data"), filename) }
    rv = client.post(('/behaviourmapper/upload'), data=data)
    assert rv.status_code == 400

def test_upload_image(client, app):
    image = "bike.png"
    path = os.path.join(Config.STATIC_URL_PATH + "\\icons\\man\\bike.png")
    data = { "file": (open(path, 'rb'), image), "p_id": 1}
    rv = client.post(('/behaviourmapper/upload'), data=data)
    assert rv.status_code == 201
    assert rv.json['file'] == image