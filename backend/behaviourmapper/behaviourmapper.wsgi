activate_this = '/home/stud/oddvarno/public_html/venv/bin/activate_this.py'
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

from behaviourmapper import create_app
application = create_app()