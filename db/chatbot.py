from pymongo import MongoClient
from random import choice, randint
from datetime import datetime
from time import sleep
from bson.objectid import ObjectId

client = MongoClient()

db = client['mvp'] # select db named mvp
jobs = db['jobs'] # select collection (table) named stuff
users = db['users']


def random_user():
    all_users = [u for u in users.find({})]
    return choice(all_users) if all_users else None

def get_messages(user):
    return user['messages']

def user_messaged_last(username, employer, messages):
    correspondence = list(filter(lambda msg: (msg['from'] == employer) or ((msg['from'] == username) and (msg['to'] == employer)), messages))
    extract_from = lambda msg: msg['from']
    from_list = list(map(extract_from, correspondence))
    from_list.reverse()
    if username in from_list:
        return from_list.index(employer) > from_list.index(username)
    else:
        return len(correspondence) == 0

def get_employers(user):
    jobs_list = jobs.find({'_id': { '$in': [ObjectId(i) for i in user['accepts']] } })
    employers = [job['employer'] for job in jobs_list]
    return employers

def write_message(user, employer, message):
    update = {'$push': {
        'messages': {
            'to': user['username'],
            'from': employer,
            'text': message,
            'at': datetime.utcnow()
        }
    }}
    query = {'_id':user['_id']}
    users.find_one_and_update(query, update)

while True:
    if randint(1, 10) > 5:
        user = random_user()
        if user:
            employers = get_employers(user)
            if employers:
                employer = choice(employers)
                messages = get_messages(user)
                user_replied = False
                if len(messages):
                    user_replied = user_messaged_last(user['username'], employer, messages)
                empty = len(messages) == 0
                print(f"user: {user['username']} messaged last: {user_replied}")
                if user_replied or empty:
                    print(f"user: {user['username']}, employer: {employer}")
                    # add the speech recognition and response generator here
                    write_message(user, employer, 'hello, world')
    sleep(0.5)
