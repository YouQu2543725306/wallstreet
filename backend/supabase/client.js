//supabase连接
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zintczxoirrkahrlgmyj.supabase.co'
const supabaseAnonKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbnRjenhvaXJya2FocmxnbXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODg0MDAsImV4cCI6MjA2OTI2NDQwMH0.1SZoQZH3XNzRlsvrMYrGWBOg1foyNaSOXMJ9G7ZoREA

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fetchData() {
  try {
    const { data, error } = await supabase
      .from('cards') // 替换为你的表名
      .select('*') // 选择所有列

    if (error) {
      throw error
    }

    console.log(data) // 打印查询结果
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

fetchData()