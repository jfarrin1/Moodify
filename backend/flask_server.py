import MySQLdb
from sklearn.neural_network import MLPRegressor
import sys
import json
import cgi
import pandas as pd
import numpy as np
from flask import Flask, request

	# to run with screen:
	# 1. screen
	# 2. python flask_server.py
	# 3. ctrl A D (detaches screen session)

	# to kill screen run command on server:
	# 1. screen -ls
	# 2. ps -el | grep $(screen instance # from 1.) | grep bash | awk '{print $4}'
	# 3. kill -KILL $(pid from 2.)

app = Flask(__name__)

db = MySQLdb.connect(host="localhost",
		     user = "jfarrin1",
		     passwd = "jfarrin1",
		     db = "jfarrin1")
#cursor object to execute queries 
cur = db.cursor()


@app.route('/')
def runit():
	return "use another port plz"

@app.route('/recommend', methods=['POST'])
def recommend():
	mood_test = map(int,request.form.getlist('moods[]'))
	#print(mood_test)
	result = {}
	cur.execute("SELECT danceability, energy, musical_key, loudness, mode, acousticness, speechiness, instrumentalness, liveness, valence, tempo, duration_ms, time_signature FROM songs")

	acoustics_train = np.zeros(13)
	moods_train = np.zeros(5)
	first = 1
	for row in cur.fetchall():
		if first:
			acoustics_train = np.array(list(row))
			first = 0
		else:
			acoustics_train = np.vstack((acoustics_train, list(row)))

	#print(acoustics_train)
	cur.execute("SELECT happy, sad, nostalgic, relaxing, energizing FROM songs")
	first = 1
	for row in cur.fetchall():
		if first:
			moods_train = np.array(list(row))
			first = 0
		else:
			moods_train = np.vstack((moods_train, list(row)))
	#print(moods_train)

	nn = MLPRegressor(hidden_layer_sizes=(100, 50),  activation='relu', solver='adam', alpha=0.001, batch_size='auto', learning_rate='constant', learning_rate_init=0.01, power_t=0.5, max_iter=1000, shuffle=True, random_state=0, tol=0.0001, verbose=False, warm_start=False, momentum=0.9, nesterovs_momentum=True, early_stopping=False, validation_fraction=0.1, beta_1=0.9, beta_2=0.999, epsilon=1e-08) 

	n = nn.fit(moods_train, acoustics_train)

	prediction = nn.predict(mood_test)
	category = ['danceability', 'energy', 'musical_key', 'loudness', 'mode', 'acousticness', 'speechiness', 'instrumentalness', 'liveness', 'valence', 'tempo', 'duration_ms', 'time_signature']

	acoustics_df = pd.DataFrame(acoustics_train, columns=category)

	scale_factors = [1,1,12,1,1,1,1,1,1,1,acoustics_df.max(axis=0)['tempo'],acoustics_df.max(axis=0)['duration_ms'],acoustics_df.max(axis=0)['time_signature']]
	max_constraint = [1,1,12,1,1,1,1,1,1,1,1,1,1]
	min_constraint = [0,0,0,0,0,0,0,0,0,0,0,0,0]

	#print(len(scale_factors), len(max_constraint), len(min_constraint))

	acoustics_train = np.vstack((acoustics_train, prediction))
	acoustics_train = np.vstack((acoustics_train, max_constraint))
	acoustics_train = np.vstack((acoustics_train, min_constraint))
	acoustics_df = pd.DataFrame(acoustics_train, columns=category)

	for i in range(len(prediction[0])):
		minVal = acoustics_df.min(axis=0)[category[i]]
		maxVal = acoustics_df.max(axis=0)[category[i]]
		value = (prediction[0][i] - minVal) / (maxVal - minVal)
		value *= scale_factors[i]

		if (category[i] in ['musical_key', 'duration_ms', 'mode', 'time_signature']):
			result[category[i]] = int(round(value)) 
		else:
			result[category[i]] = value

	#print(json.dumps(result))
	return json.dumps(result)

@app.route('/performance', methods=['POST'])
def performance():
	liked = int(request.form['liked'])
	matched = int(request.form['matched'])
	user_id = request.form['user_id']
	song_id = request.form['song_id']
	playlist = request.form['playlist']
	#print(liked, matched)
	cur.execute("INSERT INTO results VALUES (%s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE liked = %s, matched = %s, playlist = %s;", (user_id, song_id, liked, matched, playlist, liked, matched, playlist))
	cur.execute("UPDATE performance SET liked = liked + %s;", (liked,))
	cur.execute("UPDATE performance SET matched = matched + %s;", (matched,))
	cur.execute("UPDATE performance SET total = total + 1;")
	db.commit()
	return json.dumps({'test': 1})
	
	
	
@app.after_request
def add_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return response

if __name__ == "__main__":
	app.run(host='0.0.0.0')