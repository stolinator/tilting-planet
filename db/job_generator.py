import pickle
from random import choice, randint, sample

with open('db/wordlist') as f:
    words = f.read().split('\n')

with open('db/techy-names.txt') as f:
    company_suffix = f.read().split('\n')

with open('db/bullet_points.pickle', 'rb') as f:
    bullet_points = pickle.loads(f.read())

with open('db/chain.pickle', 'rb') as f:
    chain = pickle.loads(f.read())

def make_paragraph(psize=(1,10), ssize=(20,50)):
    paragraph = []
    for i in range(randint(*psize)): # number of sentences
        word0, word1 = choice(list(chain.keys()))
        sentence = []
        sentence.append(word0)
        sentence.append(word1)

        for i in range(randint(*ssize)): # words per sentence
            step = (word0, word1)
            nxt = choice(chain[step])
            word0 = word1
            word1 = nxt
            if ('•' in nxt):
                continue
            sentence.append(nxt)
        sentence[0] = sentence[0].capitalize()
        sentence[-1] += '.'
        paragraph.append(' '.join(sentence))
    return ' '.join(paragraph)

def make_bullet_point():
    statement = []
    a, b = choice(bullet_points)
    statement.extend([a, b])
    for i in range(randint(5, 20)):
        nxt = choice(chain[(a, b)])
        a = b
        b = nxt
        if (nxt in bullet_points) or ('•' in nxt):
            continue
        statement.append(nxt)
    statement[1] = statement[1].capitalize()
    return ' '.join(statement)

def make_description():
    structure = []
    structure.append(make_paragraph())
    for i in range(randint(3, 7)):
        structure.append(make_bullet_point())
    return '\n'.join(structure)

def make_title():
    status = ['Chief', 'Lead', 'Senior', 'Junior', 'Advanced', 'Supervising',
        'Designated', 'Level I', 'Level II', 'Level III'
    ]
    modifier = [ 'Data', 'Network', 'Science', 'Engineering', 'Troubleshooting',
                'Software', 'Machine Learning']
    roles = [ 'Scientist', 'Scientist', 'Scientist', 'Analyst', 'Ninja', 'Chef', 'Jedi', 'Engineer', 'Engineer', 'Engineer', 'Engineer', 'Intern',
             'Fellow', 'Oompa Loompa'
    ]
    title = []
    for i in status, modifier:
        if randint(3,10) > 5:
            title.append(choice(i))
    title.append(choice(roles))
    return ' '.join(title)



def make_employer():
    a, b = sample(words, 2)
    name = ' '.join([a.capitalize(), b.capitalize()])
    if randint(1, 10) > 5:
        name += (' ' + choice(company_suffix))
    return name

def make_job():
    return {
        'title': make_title(),
        'employer': make_employer(),
        'description': make_description()
    }
