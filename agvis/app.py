import subprocess
from flask import Flask, render_template, send_from_directory
import requests

app = Flask(__name__)
app.requests_session = requests.Session()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:path>', methods=['GET'])
def static_proxy(path):
    return send_from_directory('static', path)

def run_app(app_module, host='localhost', port=8810, workers=1):
    try:

        print(f"AGVis will be served at http://{host}:{port}. Static files are located at \"agvis/static\"")
        print("Open your web browser and navigate to the URL to access the application.")
        print("\nStarting AGVis... Press Ctrl+C to stop.")

        command = [
            'gunicorn',
            '-b', f'{host}:{port}',
            '-w', str(workers),
            app_module
        ]
        
        with app.requests_session as session:
            subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f'An error occured while trying to start AGVis: {e}')
    except KeyboardInterrupt:
        print('\nAGVis has been stopped. You may now close the browser.')
    except Exception as e:
        print(f'An unexpected error has occured while trying to start AGVis: {e}')

if __name__ == '__main__':
    run_app()