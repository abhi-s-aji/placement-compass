const { createClient } = require('@supabase/supabase-js');
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

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('Testing exec_sql RPC...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: 'SELECT 1;' 
    });
    console.log('exec_sql result:', { data, error });
  } catch (e) {
    console.error('exec_sql catch:', e);
  }

  try {
    const { data, error } = await supabase.rpc('run_sql', { 
      sql: 'SELECT 1;' 
    });
    console.log('run_sql result:', { data, error });
  } catch (e) {
    console.error('run_sql catch:', e);
  }
}

main();
