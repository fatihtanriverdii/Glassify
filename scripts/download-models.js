const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../public/models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const modelFiles = [
  {
    url: 'https://justadudewhohacks.github.io/face-api.js/models/ssd_mobilenetv1_model-weights_manifest.json',
    filename: 'ssd_mobilenetv1_model-weights_manifest.json'
  },
  {
    url: 'https://justadudewhohacks.github.io/face-api.js/models/ssd_mobilenetv1_model-shard1',
    filename: 'ssd_mobilenetv1_model-shard1'
  },
  {
    url: 'https://justadudewhohacks.github.io/face-api.js/models/face_landmark_68_model-weights_manifest.json',
    filename: 'face_landmark_68_model-weights_manifest.json'
  },
  {
    url: 'https://justadudewhohacks.github.io/face-api.js/models/face_landmark_68_model-shard1',
    filename: 'face_landmark_68_model-shard1'
  }
];

async function downloadFile(file) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(modelsDir, file.filename);
    const fileStream = fs.createWriteStream(filePath);
    
    console.log(`Downloading ${file.filename} from ${file.url}`);
    
    https.get(file.url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${file.filename}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${file.filename}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', err => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function downloadModels() {
  try {
    console.log('Creating models directory...');
    console.log('Downloading model files...');
    
    for (const file of modelFiles) {
      await downloadFile(file);
    }
    
    console.log('All models downloaded successfully');
  } catch (error) {
    console.error('Error downloading models:', error);
    process.exit(1);
  }
}

downloadModels(); 