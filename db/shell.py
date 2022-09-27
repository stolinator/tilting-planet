from pymongo import MongoClient

client = MongoClient()

db = client['mvp'] # select db named mvp
jobs = db['jobs'] # select collection (table) named stuff

print("Dropping into interactive shell!")
print("The table name is jobs.")
