import time
from flask import Flask, request, render_template, send_from_directory,Response,jsonify
import os
import random
import threading,subprocess,shutil
from flask_caching import Cache
import socket

host_addr = '10.14.37.165'
# host_addr = socket.gethostbyname(socket.gethostname())

BASE_DIR = os.getcwd()
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 10000 * 1000000
cache = Cache(app, config={'CACHE_TYPE': 'SimpleCache'})
times = []


@app.route('/',methods=['GET','POST'])
# @cache.cached(timeout=600)
def index():
    data = os.listdir('static/libs')
    sorted_data = sorted(data, key=str.lower)
    return render_template('index.html', data=sorted_data)

@app.route('/lib/<lib>', methods=['GET'])
def find_lib(lib):
    query = lib
    libs_dir = 'static/libs'
    files = os.listdir(os.path.join(libs_dir, query))
    file_sizes = [os.path.getsize(os.path.join(libs_dir, query, f)) for f in files]
    file_tuples = list(zip(files, file_sizes))
    sorted_files = sorted(file_tuples, key=lambda x: x[1])
    sorted_files = [f[0] for f in sorted_files]
    archives = [f for f in sorted_files if f.endswith('.tar.gz') or f.endswith('.zip')]
    non_archives = [f for f in sorted_files if not f.endswith('.tar.gz') and not f.endswith('.zip')]
    sorted_files = non_archives + archives
    install = 'pip install ' + ' '.join([f'http://{host_addr}:5000/{libs_dir}/{query}/{i}' for i in sorted_files]) +' --no-deps'
    return render_template('results.html', install=install,lib=query)


@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    libs_dir = 'static/libs'
    files = os.listdir(os.path.join(libs_dir, query))
    file_sizes = [os.path.getsize(os.path.join(libs_dir, query, f)) for f in files]
    file_tuples = list(zip(files, file_sizes))
    sorted_files = sorted(file_tuples, key=lambda x: x[1])
    sorted_files = [f[0] for f in sorted_files]
    archives = [f for f in sorted_files if f.endswith('.tar.gz') or f.endswith('.zip')]
    non_archives = [f for f in sorted_files if not f.endswith('.tar.gz') and not f.endswith('.zip')]
    sorted_files = non_archives + archives
    install = 'pip install ' + ' '.join([f'http://10.13.225.234:5000/{libs_dir}/{query}/{i}' for i in sorted_files]) + '--no-deps'
    return render_template('results.html', install=install)

@app.route('/static/libs/<libs>/<filename>')
@cache.cached(timeout=600)
def download_file(libs,filename):
    with open(f'static/libs/{libs}/'+filename,'rb') as file:
            file_data = file.read()
            return file_data


@app.route('/remove_library/', methods=['POST'])
def remove_lib():
    library_name = request.form.get('library_name')
    if not library_name:
        return jsonify({'error': 'Не указано имя библиотеки'}), 400

    library_path = os.path.join('static/libs', library_name)
    if not os.path.exists(library_path):
        return jsonify({'error': f'Библиотека "{library_name}" не найдена'}), 404

    try:
        shutil.rmtree(library_path)
        return jsonify({'message': f'Библиотека "{library_name}" успешно удалена'}), 200
    except Exception as e:
        return jsonify({'error': f'Ошибка при удалении библиотеки "{library_name}": {e}'}), 500

@app.route('/get_libraries/', methods=['GET'])
def get_libraries():
    all_items = os.listdir('static/libs')
    libraries = [name if os.path.isdir(os.path.join('static/libs', name)) else print() for name in all_items]
    return jsonify({'libraries': libraries})

def download_library(library_name, library_path):
    os.makedirs(library_path, exist_ok=True)
    try:
        subprocess.run(['pip', 'download', library_name, '--dest', library_path,
                        '--trusted-host', 'pypi.org', '--trusted-host', 'files.pythonhosted.org'],
                       check=True)
        print(f'Библиотека "{library_name}" успешно загружена в {library_path}')
    except subprocess.CalledProcessError as e:
        print(f'Ошибка при загрузке библиотеки "{library_name}": {e}')

@app.route('/append_library/', methods=['POST','GET'])
def append_lib():
    if request.method == 'POST':
        library_name = request.form.get('library_name')
        if not library_name:
            return jsonify({'error': 'Не указано имя библиотеки'}), 400
        library_path = os.path.join('static/libs', library_name)
        if os.path.exists(library_path):
            return jsonify({'message': f'Библиотека "{library_name}" уже существует'}), 200
        thread = threading.Thread(target=download_library, args=(library_name, library_path))
        thread.start()
        return jsonify({'message': f'Запрос на загрузку библиотеки "{library_name}" принят'}), 202
    return render_template('add.html')

if __name__ == '__main__':
    app.run(
        debug=False,
        host='10.14.37.165',
        # host='127.0.0.1
        # '
        
            )