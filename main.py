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
@app.route("/camara-trasera")
def camaratrasera():
    return render_template('trasera.html')

if __name__ == "__main__":
    app.run()