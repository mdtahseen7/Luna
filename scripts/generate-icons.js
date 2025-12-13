const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const src = path.join(publicDir, 'logo.png');

    if (!fs.existsSync(src)) {
      console.error('Source logo not found at public/logo.png');
      process.exit(1);
    }

    const icons = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
      { name: 'icon-192x192.png', size: 192 },
      { name: 'icon-256x256.png', size: 256 },
      { name: 'icon-384x384.png', size: 384 },
      { name: 'icon-512x512.png', size: 512 },
    ];

    for (const icon of icons) {
      const out = path.join(publicDir, icon.name);
      await sharp(src)
        .resize(icon.size, icon.size, { fit: 'cover' })
        .png({ compressionLevel: 9, quality: 90 })
        .toFile(out);
      console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Generate favicon.ico (using 32x32 as base)
    const icoPath = path.join(publicDir, 'favicon.ico');
    await sharp(src)
      .resize(32, 32, { fit: 'cover' })
      .toFile(icoPath);
    console.log(`✓ Generated favicon.ico`);

    console.log('\n✨ All icons generated successfully!');
  } catch (e) {
    console.error('❌ Failed to generate icons:', e);
    process.exit(1);
  }
})();
