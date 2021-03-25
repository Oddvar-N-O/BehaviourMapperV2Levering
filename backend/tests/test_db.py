import pytest
import json
from backend.behaviourmapper import create_app
from backend.behaviourmapper.db import get_db, init_db

def test_db(client):
    rv = client.get(('/behaviourmapper/initdb'),follow_redirects=True)
    dbtest = {"Users": [1,"openid", "email@email.com"],
        "Event": [1,45,"12991.29291 2929.21","12:12:12",49],
        "Project": [1,"prosjektnamn", "beskrivelse", "kartet", "screenshot", "1998-01-30 12:23:43","1998-01-30 12:23:43","zoom","1","2","3","4",1],
        "Project_has_Event": [1,1],
        "Figures": [1,"bike","blue","./icons/man/bike.png", None]
        }
    print(rv.status_code)
    assert json.loads(rv.data) == dbtest