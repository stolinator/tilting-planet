import os
#import requests
import json
from random import sample
from pymongo import MongoClient
from dotenv import load_dotenv
from job_generator import make_job

load_dotenv()
"""
url = 'https://data.usajobs.gov/api/search'
headers = {
    'User-Agent': os.environ['API_USER_AGENT'],
    'Authorization-Key': os.environ['API_KEY']
}
params = {
    'Keyword': 'software engineer',
    'Page': 1,
    'ResultsPerPage': 500, # this is the max
}

req = requests.get(url, headers=headers, params=params)

data = json.loads(req.content.decode())

jobs = [job['MatchedObjectDescriptor'] for job in data['SearchResult']['SearchResultItems']]
"""
client = MongoClient() # assumes mongodb://localhost:27017

db = client['mvp']
table = db['jobs']

with open('db/images.json') as f: # this should be a json file with an array of url strings to images
    photos = json.loads(f.read())
for i in range(500):
    job = make_job()
    job['photos'] = sample(photos, 5)
    job['url'] = 'https://www.google.com'
    table.insert_one(job)
"""
for job in jobs:
    table.insert_one({
        'title': job['PositionTitle'],
        'employer': job['DepartmentName'],
        'description': ','.join(job['UserArea']['Details']['MajorDuties']),
        'url': job['PositionURI'],
        'photos': sample(photos, 5)
    })
"""
