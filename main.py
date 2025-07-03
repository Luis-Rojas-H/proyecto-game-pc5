import tempfile
import os
from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def main():
    return render_template('home.html')

@app.route("/practice")
def practice():
    return render_template('main_html.html')
<<<<<<< HEAD

@app.route("/filtro")
def filtro():
    return render_template('main_html_face.html')

=======
@app.route("/camara-trasera")
def camaratrasera():
    return render_template('trasera.html')
>>>>>>> c2739cc18849551f55282d244d3e7ea738967a30

if __name__ == "__main__":
    app.run()