// Test pdf-parse in Node.js
if (typeof global !== 'undefined' && !global.DOMMatrix) {
  global.DOMMatrix = class DOMMatrix {};
}

try {
  const pdf = require('pdf-parse');
  console.log('pdf-parse required successfully!');
} catch (e) {
  console.error('Failed to require pdf-parse:', e);
}
