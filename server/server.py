import os
from flask import Flask, render_template, request
from flask_pymongo import PyMongo
from dotenv import load_dotenv

load_dotenv()

def convert(job):
    d = { key: job[key] for key in ['title', 'description', 'employer', 'url', 'photos'] }
    d['id'] = str(job['_id'])
    return d

app = Flask(__name__)
app.config['MONGO_URI'] = os.environ['MONGO_URI']
mongo = PyMongo(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/jobs', methods=['GET', 'POST'])
def jobs():
    if request.method == 'GET':
        jobs = [convert(job) for job in mongo.db.jobs.find()]
        return jobs
