import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('Testing Supabase Connection...');
  const { data, error } = await supabase.from('profiles').select('id, role').limit(5);
  if (error) {
    console.error('Error querying profiles:', error);
  } else {
    console.log('Profiles query success:', data);
  }

  // Let's check what other tables are queryable
  const tables = ['profiles', 'projects', 'progress', 'checklist_items', 'github_data', 'tasks', 'feedback', 'ai_reports', 'certificates', 'skills_tracker', 'target_skills', 'completed_resources'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`Table '${table}' query failed:`, error.message);
    } else {
      console.log(`Table '${table}' exists. Count:`, data);
    }
  }
}

main();
