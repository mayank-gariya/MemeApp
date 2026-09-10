import cv2 as cv
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import pickle
import json
from pathlib import Path

script_dir=Path(__file__).parent
models=script_dir/"models"

pretrained=None

try:
    with open(models/"meme_mixed_model.p","rb") as f:
        pretrained=pickle.load(f)["model"]
except:
    pass

custom_model = None
custom_metadata = {}
custom_model_mtime = None


def load_custom_model():
    global custom_model, custom_metadata, custom_model_mtime

    model_path = models / "custom_combined_model.pkl"
    meta_path = models / "custom_model_metadata.json"

    if not model_path.exists():
        custom_model = None
        custom_metadata = {}
        custom_model_mtime = None
        return

    current_mtime = model_path.stat().st_mtime

    if custom_model is None or current_mtime != custom_model_mtime:

        with open(model_path, "rb") as f:
            custom_model = pickle.load(f)

        if meta_path.exists():
            with open(meta_path, "r") as f:
                custom_metadata = json.load(f)
        else:
            custom_metadata = {}

        custom_model_mtime = current_mtime

        print("Reloaded metadata:", custom_metadata)
        
metadata={}

if (models/"custom_model_metadata.json").exists():
    with open(models/"custom_model_metadata.json") as f:
        metadata=json.load(f)

labels=[
"angryCat",
"giveMeMoney",
"Iknow",
"middle",
"shock",
"huh",
"totalpeace",
"waitWaht",
"wannafight"
]

MODEL_EXPECTED_FEATURES=52

hand=vision.HandLandmarker.create_from_options(
    vision.HandLandmarkerOptions(
        base_options=python.BaseOptions(model_asset_path=str(models/"hand_landmarker.task")),
        num_hands=1
    )
)

face=vision.FaceLandmarker.create_from_options(
    vision.FaceLandmarkerOptions(
        base_options=python.BaseOptions(model_asset_path=str(models/"face_landmarker_v2_with_blendshapes.task")),
        num_faces=1,
        output_face_blendshapes=True
    )
)


def get_results(img):
    load_custom_model()

    img=cv.flip(img,1)
    rgb=cv.cvtColor(img,cv.COLOR_BGR2RGB)

    mp_img=mp.Image(image_format=mp.ImageFormat.SRGB,data=rgb)

    hand_feat=[0.0]*52
    face_feat=[0.0]*52

    h=hand.detect(mp_img)

    if h.hand_landmarks:

        pts=[]

        for hh in h.hand_landmarks:
            for lm in hh:
                pts.extend([lm.x,lm.y])

        if len(pts)==42:
            hand_feat=pts+[0.0]*10

    f=face.detect(mp_img)

    if f.face_blendshapes:

        pts=[b.score for b in f.face_blendshapes[0]]

        if len(pts)==52:
            face_feat=pts

    combined=hand_feat+face_feat

    if custom_model is not None:

        pred=custom_model.predict([combined])[0]

        return {
            "display":f"Custom: {pred}",
            "label":pred,
            "meme":metadata.get("meme","newmeme1.png"),
            "type":"custom"
        }

    if pretrained is not None:

        if np.any(hand_feat):

            pred=int(pretrained.predict([hand_feat])[0])

            return {
                "display":f"Hand: {labels[pred]}",
                "label":labels[pred],
                "meme":labels[pred]+".png",
                "type":"pretrained"
            }

        if np.any(face_feat):

            pred=int(pretrained.predict([face_feat])[0])

            return {
                "display":f"Face Expression: {labels[pred]}",
                "label":labels[pred],
                "meme":labels[pred]+".png",
                "type":"pretrained"
            }

    return {
        "display":"No hand or face detected",
        "label":"",
        "meme":"",
        "type":"none"
    }