import MySQLdb
from sklearn.neural_network import MLPRegressor
import sys
import json
import cgi

#fs = cgi.FieldStorage() #data passed in ajax POST
#mood_test = []
#for key in fs.keys():
#	mood_test.append(fs.getvalue(key))

mood_test = [0, 1, 1, 2, 3]

sys.stdout.write("Content-Type: application/json")
sys.stdout.write("\n")
sys.stdout.write("\n")
result = {}

db = MySQLdb.connect(host="localhost",
		     user = "jfarrin1",
		     passwd = "jfarrin1",
		     db = "jfarrin1")
#cursor object to execute queries 
cur = db.cursor()
cur.execute("SELECT danceability, energy, musical_key, loudness, mode, acousticness, speechiness, instrumentalness, liveness, valence, tempo, duration_ms, time_signature FROM songs")

acoustics_train = []
moods_train = []
for row in cur.fetchall():
	items = []
	for x in row:
		items.append(int(x))
	acoustics_train.append(items)

cur.execute("SELECT happy, sad, nostalgic, relaxing, energizing FROM songs")
for row in cur.fetchall():
	items = []
	for x in row:
		items.append(int(x))
	moods_train.append(items)

nn = MLPRegressor(hidden_layer_sizes=(100,),  activation='relu', solver='adam', alpha=0.001, batch_size='auto', learning_rate='constant', learning_rate_init=0.01, power_t=0.5, max_iter=1000, shuffle=True, random_state=0, tol=0.0001, verbose=False, warm_start=False, momentum=0.9, nesterovs_momentum=True, early_stopping=False, validation_fraction=0.1, beta_1=0.9, beta_2=0.999, epsilon=1e-08) 

n = nn.fit(moods_train, acoustics_train)

prediction = nn.predict(mood_test)

category = ['danceability', 'energy', 'musical_key', 'loudness', 'mode', 'acousticness', 'speechiness', 'instrumentalness', 'liveness', 'valence', 'tempo', 'duration_ms', 'time_signature']
for i in range(len(prediction)):
	result[category[i]] = prediction[i]

db.close()

sys.stdout.write(json.dumps(result,indent=1))
sys.stdout.write("\n")
sys.stdout.close()
