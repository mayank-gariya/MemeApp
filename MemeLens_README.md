# 🎭 Meme Lens

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](#)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)](#)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.x-5C3EE8?logo=opencv&logoColor=white)](#)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10-orange)](#)
[![scikit--learn](https://img.shields.io/badge/scikit--learn-RandomForest-F7931E?logo=scikitlearn&logoColor=white)](#)
[![NumPy](https://img.shields.io/badge/NumPy-013243?logo=numpy&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

An AI-powered Flask application that recognizes facial expressions and
hand gestures, maps them to meme templates, and lets users build their
own custom meme recognition model.

## Features

-   🎯 Pre-trained meme prediction using MediaPipe landmarks.
-   📸 Camera capture and gallery upload.
-   🧠 Custom meme model training.
-   🎭 Meme template library.
-   🔍 Similar meme recommendation workflow.
-   🌐 Live meme feed integration.
-   💜 Responsive purple-themed UI.

## Tech Stack

  Layer                Technology
  -------------------- ----------------------------
  Backend              Flask
  Frontend             HTML, CSS, JavaScript
  Vision               OpenCV
  Landmark Detection   MediaPipe Tasks
  ML                   scikit-learn Random Forest
  Numerical            NumPy
  Deployment           Gunicorn, Render

## Folder Structure

``` text
MemeApp/
├── app.py
├── trained_meme_model.py
├── train_model.py
├── models/
│   ├── hand_landmarker.task
│   ├── face_landmarker_v2_with_blendshapes.task
│   └── meme_mixed_model.p
├── static/
│   ├── MemeImgs/
│   ├── assits/
│   ├── favicon/
│   ├── base.css
│   ├── trained_model.css
│   ├── customise_model.css
│   ├── meme.css
│   ├── capture_camera.js
│   ├── customise_model.js
│   ├── load_more.js
│   └── home_popup.js
├── templates/
│   ├── base.html
│   ├── head.html
│   ├── header.html
│   ├── index.html
│   ├── meme.html
│   ├── trained_model.html
│   └── customise_model.html
└── requirements.txt
```

## Python Modules

### `app.py`

Main Flask application.

-   Home, meme feed, trained model, custom model routes.
-   Image upload endpoints.
-   Connects frontend with ML pipeline.

### `trained_meme_model.py`

Runs inference.

-   Loads MediaPipe models.
-   Extracts landmarks.
-   Predicts meme labels.
-   Supports custom model fallback.

### `train_model.py`

Builds custom models.

-   Processes uploaded dataset.
-   Extracts landmarks.
-   Trains Random Forest.
-   Saves custom model and metadata.

## ML Pipeline

1.  Capture or upload image.
2.  Convert to RGB.
3.  MediaPipe extracts landmarks.
4.  Feature vector creation.
5.  Random Forest prediction.
6.  Matching meme displayed.

## Frontend Workflow

  File                   Purpose
  ---------------------- -----------------------------
  `capture_camera.js`    Camera capture & prediction
  `customise_model.js`   Dataset building & training
  `load_more.js`         Infinite meme loading
  `home_popup.js`        Homepage interactions

## Installation

``` bash
git clone https://github.com/mayank-gariya/MemeLens.git
cd MemeLens
python -m venv .venv
```

### Windows

``` bash
.venv\Scripts\activate
```

### macOS/Linux

``` bash
source .venv/bin/activate
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

Run:

``` bash
python app.py
```

Open:

``` text
http://127.0.0.1:5000
```

## Git Commands

``` bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/mayank-gariya/MemeLens.git
git push -u origin main
```

## Deployment (Render)

``` text
Build Command:
pip install -r requirements.txt

Start Command:
gunicorn app:app --workers 1 --threads 2 --timeout 180
```

## Future Improvements

-   FAISS semantic recommendations
-   Multiple persistent custom models
-   Cloud storage for user-trained models
-   Authentication
-   Model progress tracking

## License

MIT

------------------------------------------------------------------------

Built with ❤️ by Mayank Gariya.
