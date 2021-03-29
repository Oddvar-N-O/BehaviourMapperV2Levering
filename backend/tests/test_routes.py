import io
import json
import pytest
from datetime import datetime, date
from backend.behaviourmapper.config import Config


def test_faviconico(client):
    rv = client.get(('/behaviourmapper/favicon.ico'))
    assert rv.status_code == 200

def test_getfigure(client):
    rv = client.get(('/behaviourmapper/getfigure?description=bike&color=red&u_id=openid'))
    assert rv.status_code == 200

def test_getfiguredata(client):
    rv = client.get(('/behaviourmapper/getfiguredata?u_id=openid'))
    dbtest = '{"description": "bike", "color": "blue", "id": 1}'
    decoded = rv.data.decode(encoding="utf-8", errors="strict")
    assert rv.status_code == 200
    assert decoded[1:50] == dbtest

def test_getfigure_err(client):
    rv = client.get(('/behaviourmapper/getfigure?description=bike&color=12'))
    print(rv.data)
    assert rv.status_code == 400

def test_getevents(client):
    rv = client.get(('/behaviourmapper/getevents?p_id=1&u_id=openid'))
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

def test_upload_image(client):
    image = "bike.png"
    data = { "file": (open("behaviourmapper/static/icons/man/bike.png", 'rb'), image), "p_id": 1, "u_id": "openid"}
    rv = client.post(('/behaviourmapper/upload'), data=data)
    assert rv.status_code == 201
    assert rv.json['file'] == image