from flask import Flask , render_template , jsonify , request
import requests
from trained_meme_model import get_results
import numpy as np
import cv2 as cv
import os 

app = Flask(__name__ ,template_folder='templates')

def get_meme(n=20):
    url = f"https://meme-api.com/gimme/{n}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.json().get('memes', [])
        return []
    except Exception as e:
        print(f"Error fetching memes: {e}")
        return []       

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/meme')
def meme():
    meme_list = get_meme()
    return render_template('meme.html',memes=meme_list)

@app.route('/api/memes')
def get_more_meme():
    count = request.args.get('count',12,type=int)
    meme_list = get_meme(count)
    return jsonify(meme_list)

@app.route('/meme/pre/trained-model/')
def trained_model():
    return render_template('trained_model.html')

@app.route('/meme/predict/',methods=["POST"])
def predict():
    file = request.files['image']
    
    file_byte = np.frombuffer(file.read(),np.uint8)
    img = cv.imdecode(file_byte,cv.IMREAD_COLOR)
    
    result = get_results(img=img)
    
    return jsonify({
        "result":result
    })

if __name__ == '__main__':
    app.run(debug=True)