const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create basic favicon (SVG)
const faviconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e50914"/>
      <stop offset="100%" stop-color="#b2070f"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
  <path d="M12 8L12 24L24 16L12 8Z" fill="white"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

console.log('Public folder setup complete!');
console.log('Please generate PNG icons using:');
console.log('1. Visit https://favicon.io/');
console.log('2. Upload favicon.svg or create new design');
console.log('3. Download and place logo192.png, logo512.png in public folder');
