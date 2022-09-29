from pymongo import MongoClient

client = MongoClient()

db = client['mvp'] # select db named mvp
jobs = db['jobs'] # select collection (table) named stuff
users = db['users']

print("Dropping into interactive shell!")
print("The table names are `jobs` and `users`")
