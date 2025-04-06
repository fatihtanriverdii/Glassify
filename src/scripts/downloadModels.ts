const fs = require('fs');
const path = require('path');
const axios = require('axios');

const MODEL_URLS: { [key: string]: string } = {
    ssdMobilenetv1: 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/ssd_mobilenetv1_model-weights_manifest.json',
    faceLandmark68Net: 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-weights_manifest.json'
};

const WEIGHTS_URLS: { [key: string]: string[] } = {
    ssdMobilenetv1: [
        'https://raw.githubusercontent.com/vladmandic/face-api/master/model/ssd_mobilenetv1_model-shard1',
        'https://raw.githubusercontent.com/vladmandic/face-api/master/model/ssd_mobilenetv1_model-shard2'
    ],
    faceLandmark68Net: [
        'https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-shard1'
    ]
};

async function downloadFile(url: string, outputPath: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath, response.data);
}

async function main(): Promise<void> {
    const modelsDir = path.join(process.cwd(), 'public', 'models');

    // Create models directory if it doesn't exist
    if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
    }

    console.log('Downloading face-api.js models...');

    // Download model manifests
    for (const [model, url] of Object.entries(MODEL_URLS)) {
        console.log(`Downloading ${model} manifest...`);
        await downloadFile(url, path.join(modelsDir, `${model}-manifest.json`));
    }

    // Download model weights
    for (const [model, urls] of Object.entries(WEIGHTS_URLS)) {
        for (let i = 0; i < urls.length; i++) {
            console.log(`Downloading ${model} weights (${i + 1}/${urls.length})...`);
            await downloadFile(urls[i], path.join(modelsDir, `${model}-shard${i + 1}`));
        }
    }

    console.log('All models downloaded successfully!');
}

main().catch(console.error); 