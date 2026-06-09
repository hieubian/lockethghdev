const sharp = require('sharp');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

const publicDirs = [
  path.join(__dirname, '..', 'apps', 'main', 'public'),
  path.join(__dirname, '..', 'apps', 'self-hosted', 'web', 'public')
];

async function processFile(file) {
  const filename = path.basename(file);
  let size = null;

  if (filename.includes('192x192')) size = 192;
  else if (filename.includes('512x512')) size = 512;
  else if (filename.includes('16x16')) size = 16;
  else if (filename.includes('32x32')) size = 32;
  else if (filename.includes('96x96')) size = 96;
  else if (filename === 'apple-touch-icon.png') size = 180;

  const tempFile = file + '.tmp';
  try {
    let pipeline = sharp(file);
    if (size) {
      pipeline = pipeline.resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
    }
    
    // We can also use sharp's compression
    await pipeline
      .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
      .toFile(tempFile);
      
    const originalSize = fs.statSync(file).size;
    const newSize = fs.statSync(tempFile).size;
    
    fs.renameSync(tempFile, file);
    console.log(`Processed: ${filename} | Size: ${(originalSize/1024).toFixed(1)}KB -> ${(newSize/1024).toFixed(1)}KB`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

async function run() {
  let totalProcessed = 0;
  for (const publicDir of publicDirs) {
    if (!fs.existsSync(publicDir)) continue;
    
    const files = glob.sync('**/*.png', { cwd: publicDir, absolute: true });
    for (const file of files) {
      await processFile(file);
      totalProcessed++;
    }
  }
  console.log(`Done processing ${totalProcessed} files.`);
}

run();
