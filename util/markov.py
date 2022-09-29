import pickle
import re
from string import punctuation, whitespace, ascii_letters, digits
from random import choice, randint


chain = {}
for filename in ['scraped_gov_jobs.txt', 'google_jobs.txt']:#, '1400-0.txt']:
    with open(filename) as f:
        data = f.read()

    words = []
    # split input into words, remove formatting
    for line in data.split('\n'):
        for word in line.split():
            for char in [*punctuation, *whitespace, *digits ]:
                word = word.replace(char, '')
            word = word.replace('"', '')
            words.append(word.lower())

    for i in range(len(words) - 2 ):
        nxt = chain.setdefault((words[i], words[i+1]), [])
        nxt.append(words[i+2])

#print(chain)
def starts_with_bullet_point(pair):
    return pair[0] == '•'

bullet_points = list( filter(starts_with_bullet_point, list(chain.keys())) )

with open('chain.pickle', 'wb') as f:
    f.write(pickle.dumps(chain))

with open('bullet_points.pickle', 'wb') as f:
    f.write(pickle.dumps(bullet_points))


