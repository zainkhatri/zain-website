const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const optimizedDir = path.join(__dirname, 'src', 'images', 'optimized');
const fullsizeDir = path.join(__dirname, 'src', 'images', 'fullsize');

async function optimizeImages() {
  try {
    // Create fullsize directory if it doesn't exist
    await fs.mkdir(fullsizeDir, { recursive: true });

    // Get all files from optimized directory
    const files = await fs.readdir(optimizedDir);

    // Filter for numbered image files (1.webp, 2.webp, etc.)
    const imageFiles = files.filter(file => 
      /^(\d+|10|12|13)\.webp$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} gallery images to process...`);

    // Process each image
    for (const file of imageFiles) {
      const sourcePath = path.join(optimizedDir, file);
      const fullsizePath = path.join(fullsizeDir, file);

      console.log(`\nProcessing: ${file}`);

      // Create full-size version (better quality)
      console.log('Creating full-size version...');
      await sharp(sourcePath)
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ 
          quality: 85,
          effort: 4
        })
        .toFile(fullsizePath);

      console.log(`✓ Created full-size version: ${file}`);
    }

    console.log('\nProcessing complete!');

  } catch (error) {
    console.error('Error during processing:', error);
  }
}

optimizeImages();