// supabase/client.js
import dotenv from 'dotenv';
dotenv.config();               // 读取 .env
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;

// 获取所有卡片数据的接口函数
export async function getCards() {
  const { data, error } = await supabase
    .from('cards')
    .select();
  if (error) {
    throw error;
  }
  return data;
}

// 获取所有卡片数据的接口函数
export async function getCards() {
  const { data, error } = await supabase
    .from('cards')
    .select();
  if (error) {
    throw error;
  }
  return data;
}