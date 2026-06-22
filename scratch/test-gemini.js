const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

async function testModel(name) {
  console.log(`Testing model: ${name}...`);
  try {
    const model = genAI.getGenerativeModel({ model: name });
    const result = await model.generateContent('Say hello in 5 words.');
    console.log(`Success with ${name}:`, result.response.text());
    return true;
  } catch (e) {
    console.log(`Failed with ${name}:`, e.message || e);
    return false;
  }
}

async function main() {
  const models = ['gemini-1.5-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-pro'];
  for (const m of models) {
    const ok = await testModel(m);
    if (ok) {
      console.log(`Found working model: ${m}`);
      break;
    }
  }
}

main();
