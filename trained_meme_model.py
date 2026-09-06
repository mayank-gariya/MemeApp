import cv2 as cv
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import pickle
from pathlib import Path

script_dir = Path(__file__).parent

model_path = script_dir / "models" / "meme_mixed_model.p"

try:
    with model_path.open('rb') as f:
        model_dict = pickle.load(f)
    model = model_dict['model']
    print("Trained model loaded successfully.")
except FileNotFoundError:
    print("Error: Trained model file not found.")
    exit()

model_path = script_dir / 'models' / 'hand_landmarker.task'
face_model_path = script_dir / 'models' / 'face_landmarker_v2_with_blendshapes.task'

hand_detector = vision.HandLandmarker.create_from_options(
    vision.HandLandmarkerOptions(
        base_options=python.BaseOptions(model_asset_path=str(model_path)),
        num_hands=1
    )
)

face_detector = vision.FaceLandmarker.create_from_options(
    vision.FaceLandmarkerOptions(
        base_options=python.BaseOptions(model_asset_path=str(face_model_path)),
        num_faces=1,
        output_face_blendshapes=True
    )
)

MODEL_EXPECTED_FEATURES = 52
labels = ['angryCat', 'giveMeMoney', 'Iknow', 'middle', 'shock', 'cute', 'totalpeace', 'waitWaht', 'wannafight']


def get_results(img):
    img = cv.flip(img, 1)
    rgb_img = cv.cvtColor(img, cv.COLOR_BGR2RGB)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_img)

    detected_label = "No hand or face detected"
    hand_data = []

    hand_res = hand_detector.detect(mp_img)

    if hand_res.hand_landmarks:
        for hand_landmarks in hand_res.hand_landmarks:
            for landmark in hand_landmarks:
                hand_data.append(landmark.x)
                hand_data.append(landmark.y)

        if len(hand_data) == 42:
            padded_hand = hand_data + [0.0] * (MODEL_EXPECTED_FEATURES - len(hand_data))
            prediction = model.predict([padded_hand])
            detected_label = f"Hand: {labels[int(prediction[0])]}"

    if len(hand_data) == 0:
        face_res = face_detector.detect(mp_img)

        if face_res.face_blendshapes and len(face_res.face_blendshapes) > 0:
            face_data = []

            for blendshape_category in face_res.face_blendshapes[0]:
                face_data.append(blendshape_category.score)

            if len(face_data) == MODEL_EXPECTED_FEATURES:
                prediction = model.predict([face_data])
                detected_label = f"Face Expression: {labels[int(prediction[0])]}"

    return detected_label