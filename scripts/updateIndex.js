const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
// Replace any script block or leftover code with our external reference and strip everything after it
html = html.replace(/<script[^>]*src="js\/bundle\.js"[^>]*>[\s\S]*$/,
    '<script src="js/bundle.js" type="text/javascript"></script>\n');
fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html cleaned to external script only');
