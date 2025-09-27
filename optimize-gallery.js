const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sourceDir = path.join(__dirname, 'src', 'images');
const previewDir = path.join(__dirname, 'src', 'images', 'optimized');
const fullsizeDir = path.join(__dirname, 'src', 'images', 'fullsize');

async function optimizeImages() {
  try {
    // Create directories if they don't exist
    await fs.mkdir(previewDir, { recursive: true });
    await fs.mkdir(fullsizeDir, { recursive: true });

    // Get all files from source directory
    const files = await fs.readdir(sourceDir);

    // Filter for numbered image files (1.jpg, 2.jpg, etc.)
    const imageFiles = files.filter(file => 
      /^(\d+)\.(jpg|jpeg|png|webp)$/i.test(file) && 
      !file.includes('optimized') &&
      !file.includes('fullsize')
    );

    console.log(`Found ${imageFiles.length} gallery images to optimize...`);

    // Process each image
    for (const file of imageFiles) {
      const sourcePath = path.join(sourceDir, file);
      const previewPath = path.join(previewDir, `${path.parse(file).name}.webp`);
      const fullsizePath = path.join(fullsizeDir, `${path.parse(file).name}.webp`);

      console.log(`\nProcessing: ${file}`);

      // Create preview version (highly compressed)
      console.log('Creating preview version...');
      await sharp(sourcePath)
        .resize({
          width: 400,
          height: 400,
          fit: 'cover',
          position: 'center'
        })
        .webp({ 
          quality: 60,
          effort: 6,
          nearLossless: true,
          reductionEffort: 6
        })
        .toFile(previewPath);

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

      console.log(`✓ Completed: ${path.parse(file).name}`);
    }

    console.log('\nOptimization complete! Next steps:');
    console.log('1. Update Gallery.js to use preview images in the grid');
    console.log('2. Update Gallery.js to use full-size images in the modal');
    console.log('3. Delete original images if satisfied with the results');

  } catch (error) {
    console.error('Error during optimization:', error);
  }
}

optimizeImages();
