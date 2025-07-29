//supabase 初始化
const { createClient } = require('@supabase/supabase-js');


const supabaseUrl = 'https://zintczxoirrkahrlgmyj.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbnRjenhvaXJya2FocmxnbXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODg0MDAsImV4cCI6MjA2OTI2NDQwMH0.1SZoQZH3XNzRlsvrMYrGWBOg1foyNaSOXMJ9G7ZoREA"
const supabase = createClient(supabaseUrl, supabaseKey)


//  test
async function fetchCharacters() {
    const { data, error } = await supabase
      .from('cards')
      .select();
  
    if (error) {
      console.error('search error:', error);
    } else {
      console.log('search result:', data);
    }
  }
  
  fetchCharacters();
  