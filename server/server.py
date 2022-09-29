import os
from flask import Flask, render_template, request, session, redirect, url_for
import json
from random import shuffle
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()

def convert(job):
    d = { key: job[key] for key in ['title', 'description', 'employer', 'url', 'photos'] }
    d['id'] = str(job['_id'])
    return d

app = Flask(__name__)
app.secret_key = os.environ['SECRET']
app.config['MONGO_URI'] = os.environ['MONGO_URI']
mongo = PyMongo(app)

@app.route('/')
def index():
    if 'username' in session:
        return render_template('index.html')
    else:
        return redirect(url_for('login'))

@app.route('/messages', methods=['GET', 'POST'])
def matches():
    if request.method == 'GET':
        if 'username' in session:
            return mongo.db.users.find_one({'username': session['username']})['messages']
        else:
            return []
    elif request.method == 'POST':
        msg = json.loads(request.data.decode())
        mongo.db.users.find_one_and_update({'username': session['username']}, { '$push': {'messages': msg } })
        return [], 201

@app.route('/user')
def user():
    print('a user request! should have already logged in')
    if 'username' in session:
        return {'username': session['username']}

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['username'] = request.form['username']
        if not mongo.db.users.find_one({'username': session['username']}):
            mongo.db.users.insert_one({'username': session['username'], 'accepts': [], 'rejects': [], 'messages': []})
        return redirect(url_for('index'))
    else:
        return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/jobs', methods=['GET', 'POST'])
def jobs():
    if request.method == 'GET':
        seen = []
        user = mongo.db.users.find_one({'username': session['username']})
        seen.extend(user['accepts'])
        seen.extend(user['rejects'])
        seen = [ObjectId(i) for i in seen]
        print('='*10, 'seen:', seen)
        jobs = [convert(job) for job in mongo.db.jobs.find({'_id': { '$nin': seen} })]
        shuffle(jobs)
        return jobs
    if request.method == 'POST':
        user = mongo.db.users.find_one({'username': session['username']})
        data = json.loads(request.data.decode())
        print(data)
        print(user)
        if data['accept']:
            user['accepts'].extend([data['id']])
            mongo.db.users.find_one_and_update({'_id': user['_id']}, { '$push': {'accepts': data['id']}})
        else:
            user['rejects'].extend([data['id']])
            mongo.db.users.find_one_and_update({'_id': user['_id']}, { '$push': {'rejects': data['id']}})
        return [], 201

@app.route('/jobs/accepted', methods=['GET', 'DELETE'])
def accepted():
    if request.method == 'GET':
        user = mongo.db.users.find_one({'username': session['username']})
        accepted = [ObjectId(job) for  job in user['accepts']]
        return [convert(job) for job in mongo.db.jobs.find({'_id': {'$in': accepted}})]
    if request.method == 'DELETE':
        print('delete method sent to server', json.loads(request.data.decode())['id'])
        data = json.loads(request.data.decode())
        mongo.db.users.find_one_and_update(
            {'username': session['username']},
            {'$pull': {'accepts': data['id']}, '$push': {'rejects': data['id']}}
        )
        return [], 201
