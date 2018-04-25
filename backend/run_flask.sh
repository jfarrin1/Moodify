#!/bin/bash

while [ 1 ]
do
	echo 'running server'
	python ./flask_server.py &
	sleep 1h
	PID=$(ps aux  | grep flask_server.py | head -n 1 | awk '{print $2}')
	kill -KILL $PID
	#PID=$(fuser 5000/tcp | awk '{print $2}'
	kill -KILL $PID
	echo "$PID"
	sleep 5
done
