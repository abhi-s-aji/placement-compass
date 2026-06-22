const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('Testing Supabase Connection...');
  const { data, error } = await supabase.from('profiles').select('id, role').limit(5);
  if (error) {
    console.error('Error querying profiles:', error);
  } else {
    console.log('Profiles query success:', data);
  }

  const tables = [
    'profiles', 'projects', 'progress', 'checklist_items',
    'github_data', 'tasks', 'feedback', 'ai_reports',
    'certificates', 'skills_tracker', 'target_skills', 'completed_resources'
  ];
  for (const table of tables) {
    const { data: tblData, error: tblError } = await supabase.from(table).select('*').limit(1);
    if (tblError) {
      console.log(`Table '${table}' query failed:`, tblError.message);
    } else {
      console.log(`Table '${table}' exists.`);
    }
  }
}

main();
