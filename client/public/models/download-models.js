/**
 * Script to download face-api.js models
 * 
 * Run with Node.js:
 * node download-models.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Base URL for the models
const BASE_URL = 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/';

// List of models to download
const MODELS = [
  // SSD Mobilenet
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  
  // Tiny Face Detector
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  
  // Face Recognition
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  
  // Face Landmark Detection
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  
  // Face Expression
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

// Download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Main function to download all models
async function downloadModels() {
  try {
    console.log('Starting download of face-api.js models...');
    
    // Create models directory if it doesn't exist
    const modelsDir = path.resolve(__dirname);
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
    
    // Download each model
    for (const model of MODELS) {
      const url = BASE_URL + model;
      const dest = path.join(modelsDir, model);
      
      console.log(`Downloading ${model}...`);
      await downloadFile(url, dest);
    }
    
    console.log('All models downloaded successfully!');
  } catch (error) {
    console.error('Error downloading models:', error);
  }
}

// Run the download
downloadModels(); 