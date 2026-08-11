const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .neq('slug', 'all')
    .order('created_at', { ascending: true });
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
