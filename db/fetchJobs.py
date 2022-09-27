import os
import requests
import json
from random import sample
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

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

client = MongoClient() # assumes mongodb://localhost:27017

db = client['mvp']
table = db['jobs']
with open('images.json') as f:
    photos = json.loads(f.read())

for job in jobs:
    table.insert_one({
        'title': job['PositionTitle'],
        'employer': job['DepartmentName'],
        'description': ','.join(job['UserArea']['Details']['MajorDuties']),
        'url': job['PositionURI'],
        'photos': sample(photos, 5)
    })
