from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/hello')
def say_hello_world():
    return {'result': "Koplingen mellom flask og react fungerer"}

@app.route('/')
def say_hello_world():
    return {'result': "Legg til innlogging her"}

@app.route('/upload')
def say_hello_world():
    return {'result': "Her skal vi upploade kartet"}


@app.route('/selectImage')
def say_hello_world():
    return {'result': "Open Street Map"}
