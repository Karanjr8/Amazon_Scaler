const fs = require('fs');

const babel = require('@babel/core');
const code = fs.readFileSync('frontend/src/components/Navbar.jsx', 'utf8');

try {
  babel.transformSync(code, {
    presets: ['@babel/preset-react'],
    filename: 'Navbar.jsx'
  });
  console.log('No syntax errors!');
} catch (err) {
  console.error(err.message);
}
