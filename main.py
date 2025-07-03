import tempfile
import os
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/")
def main():
    return render_template('home.html')

@app.route("/practicar")
def practice():
    tipo = request.args.get('tipo', default=None)
    return render_template('practice.html', tipo=tipo)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)