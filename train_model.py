import cv2 as cv
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from sklearn.ensemble import RandomForestClassifier
import pickle
import json
from pathlib import Path

script_dir = Path(__file__).parent
model_dir = script_dir / "models"
model_dir.mkdir(parents=True, exist_ok=True)

hand_model = model_dir / "hand_landmarker.task"
face_model = model_dir / "face_landmarker_v2_with_blendshapes.task"

MODEL_EXPECTED_FEATURES = 52

hand_detector = vision.HandLandmarker.create_from_options(
    vision.HandLandmarkerOptions(
        base_options=python.BaseOptions(model_asset_path=str(hand_model)),
        num_hands=1
    )
)

face_detector = vision.FaceLandmarker.create_from_options(
    vision.FaceLandmarkerOptions(
        base_options=python.BaseOptions(model_asset_path=str(face_model)),
        num_faces=1,
        output_face_blendshapes=True
    )
)


def extract_features(img):

    img = cv.flip(img,1)

    rgb = cv.cvtColor(img,cv.COLOR_BGR2RGB)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB,data=rgb)

    hand = [0.0]*MODEL_EXPECTED_FEATURES
    face = [0.0]*MODEL_EXPECTED_FEATURES

    hand_res = hand_detector.detect(mp_img)

    if hand_res.hand_landmarks:

        pts=[]

        for h in hand_res.hand_landmarks:
            for lm in h:
                pts.extend([lm.x,lm.y])

        if len(pts)==42:
            hand = pts+[0.0]*(MODEL_EXPECTED_FEATURES-42)

    face_res = face_detector.detect(mp_img)

    if face_res.face_blendshapes:

        pts=[b.score for b in face_res.face_blendshapes[0]]

        if len(pts)==MODEL_EXPECTED_FEATURES:
            face=pts

    return hand+face


def train_custom_model(images,class_label,meme_name):

    X=[]
    y=[]

    for img in images:

        feature=extract_features(img)

        if np.any(feature):
            X.append(feature)
            y.append(class_label)

    if len(X)==0:
        raise ValueError("No valid face or hand detected in dataset.")

    clf=RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    clf.fit(X,y)

    with open(model_dir/"custom_combined_model.pkl","wb") as f:
        pickle.dump(clf,f)

    with open(model_dir/"custom_model_metadata.json","w") as f:

        json.dump({
            "category":class_label,
            "meme":meme_name,
            "dataset_size":len(X)
        },f,indent=4)

    return len(X)