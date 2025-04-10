# Face Recognition Models

This directory should contain the face-api.js model files required for face recognition in the attendance system.

## Manual Download Instructions

Due to potential issues with automated downloads, please follow these manual steps to download the required models:

1. Go to the official face-api.js GitHub repository: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

2. Download the following model files:

### SSD Mobilenet
- `ssd_mobilenetv1_model-weights_manifest.json`
- `ssd_mobilenetv1_model-shard1`

### Tiny Face Detector
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`

### Face Recognition
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`

### Face Landmark Detection
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`

### Face Expression
- `face_expression_model-weights_manifest.json`
- `face_expression_model-shard1`

3. Place all downloaded files in this directory (`client/public/models/`).

## Alternative Method

You can also use the following curl commands to download the models:

```bash
# SSD Mobilenet
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard1

# Tiny Face Detector
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1

# Face Recognition
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2

# Face Landmark Detection
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1

# Face Expression
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1
```

## Verifying Installation

After downloading the models, verify that all the required files are present in this directory. The face recognition feature will not work without these model files. 