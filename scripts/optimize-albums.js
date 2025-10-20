const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sourceDir = path.join(__dirname, 'src', 'images');
const targetDir = path.join(__dirname, 'src', 'images', 'optimized');

async function optimizeImages() {
  try {
    // Create target directory if it doesn't exist
    await fs.mkdir(targetDir, { recursive: true });

    // Get all files from source directory
    const files = await fs.readdir(sourceDir);

    // Filter for image files and exclude already optimized ones
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file) && 
      !file.includes('optimized') &&
      !file.includes('movies')
    );

    console.log(`Found ${imageFiles.length} album images to optimize...`);

    // Process each image
    for (const file of imageFiles) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, `${path.parse(file).name}.webp`);

      console.log(`Optimizing: ${file}`);

      await sharp(sourcePath)
        .resize({
          width: 300,    // Album covers are square
          height: 300,   // Maintain 1:1 aspect ratio
          fit: 'cover',
          position: 'center'
        })
        .webp({ 
          quality: 65,    // Reduced quality
          effort: 6,      // Maximum compression effort
          nearLossless: true,
          reductionEffort: 6
        })
        .toFile(targetPath);

      console.log(`✓ Created: ${path.parse(file).name}.webp`);
    }

    console.log('\nOptimization complete! You can now:');
    console.log('1. Update the imports in Albums.js to use the new optimized images');
    console.log('2. Delete the original images if you\'re satisfied with the results');

  } catch (error) {
    console.error('Error during optimization:', error);
  }
}

optimizeImages();
