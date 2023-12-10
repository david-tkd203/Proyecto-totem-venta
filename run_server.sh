#!/bin/bash

# Activa el entorno virtual si es necesario
source C:\Users\david\OneDrive\Escritorio\proyecto web mobile\proyecto web mobile\proyecto web mobile

# Lanza la aplicación con Gunicorn
gunicorn -w 4 -b 0.0.0.0:5173 server:app

chmod +x run_server.sh
