import os
import cv2 as cv
import numpy as np
import requests
from flask import Flask, jsonify, render_template, request
from trained_meme_model import get_results
from train_model import train_custom_model

app = Flask(__name__, template_folder='templates')

def get_meme(n=20):
    url = f"https://meme-api.com/gimme/{n}"
    try:
        response = requests.get(url, timeout=5)
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
    return render_template('meme.html', memes=meme_list)

@app.route('/api/memes')
def get_more_meme():
    count = request.args.get('count', 12, type=int)
    meme_list = get_meme(count)
    return jsonify(meme_list)

@app.route('/meme/pre/trained-model/')
def trained_model():
    return render_template('trained_model.html')

@app.route('/meme/predict/',methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"error":"No image provided"}),400

    file=request.files["image"]

    arr=np.frombuffer(file.read(),np.uint8)
    img=cv.imdecode(arr,cv.IMREAD_COLOR)

    result=get_results(img)

    return jsonify({
        "result":result
    })
    

@app.route('/customise-model')
def custome_model():
    return render_template('customise_model.html')

@app.route('/customise-model/train',methods=["POST"])
def customise_model():

    images=request.files.getlist("images")

    if len(images)==0:
        return jsonify({"error":"No training images received."}),400

    class_label=request.form.get("class_label","custom")
    meme_name=request.form.get("meme_name","newmeme1.png")

    decoded=[]

    for file in images:

        arr=np.frombuffer(file.read(),np.uint8)
        img=cv.imdecode(arr,cv.IMREAD_COLOR)

        if img is not None:
            decoded.append(img)

    try:

        count=train_custom_model(
            images=decoded,
            class_label=class_label,
            meme_name=meme_name
        )

        return jsonify({
            "message":"Training complete!",
            "trained_images":count,
            "category":class_label,
            "meme":meme_name
        })

    except Exception as e:

        return jsonify({"error":str(e)}),400
    
if __name__ == '__main__':
    app.run(debug=True)