import sqlite3

import click
from flask import current_app
from flask import g
from flask.cli import with_appcontext

# https://github.com/pallets/flask/blob/93dd1709d05a1cf0e886df6223377bdab3b077fb/examples/tutorial/flaskr/db.py

# get an instance of the db
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE"], detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

# initialize db for the first time
def init_db():
    """Clear existing data and create new tables."""
    db = get_db()

    with current_app.open_resource("schema.sql") as f:
        db.executescript(f.read().decode("utf8"))


def close_db(e=None):
    """If this request connected to the database, close the
    connection.
    """
    db = g.pop("db", None)

    if db is not None:
        db.close()

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)

@click.command("init-db")
@with_appcontext
def init_db_command():
    init_db()
    click.echo("Initialized the database.")


def query_db(query, values, one=False):
    db = get_db()
    cursor = db.execute(query, values)
    rows = cursor.fetchall()
    rows.append(cursor.lastrowid)
    cursor.close()
    db.commit()
    return (rows[0] if rows else None) if one else rows

def select_db(query, one=False):
    db = get_db()
    cursor = db.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    db.commit()
    return (rows[0] if rows else None) if one else rows