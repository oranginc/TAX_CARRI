import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Remove OpenAI dependency and use fetch directly

// Define the images to generate
const imagesToGenerate = [
  {
    filename: 'feature1.jpg',
    prompt: 'A dynamic scene of a taxi driver driving a taxi in a busy city, realistic style',
  },
  {
    filename: 'feature2.jpg',
    prompt: 'A modern illustration representing taxi industry trends, futuristic design',
  },
  {
    filename: 'feature3.jpg',
    prompt: 'An inspirational image of a successful career transition, a smiling professional taxi driver',
  },
  {
    filename: 'company1.jpg',
    prompt: 'A modern logo for 第一交通株式会社, minimal design, corporate style',
  },
  {
    filename: 'company2.jpg',
    prompt: 'A modern logo for 日本交通株式会社, minimal design, corporate style',
  },
  {
    filename: 'company3.jpg',
    prompt: 'A modern logo for グリーンキャブ, minimal design, corporate style',
  },
];

const outputDir = path.join(process.cwd(), 'public', 'images');

async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate image: ${errorText}`);
    }
    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('Error generating image for prompt:', prompt, error);
    throw error;
  }
}

async function downloadImage(imageUrl: string, outputPath: string) {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to download image from ${imageUrl}: ${res.statusText}`);
  }
  const buffer = await res.buffer();
  fs.writeFileSync(outputPath, buffer);
  console.log(`Saved image to ${outputPath}`);
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const imageInfo of imagesToGenerate) {
    console.log(`Generating image for ${imageInfo.filename}...`);
    try {
      const imageUrl = await generateImage(imageInfo.prompt);
      const outputPath = path.join(outputDir, imageInfo.filename);
      await downloadImage(imageUrl, outputPath);
    } catch (error) {
      console.error(`Failed to generate or download image for ${imageInfo.filename}`, error);
    }
  }
}

main().catch((error) => {
  console.error('Error in image generation script:', error);
  process.exit(1);
});
