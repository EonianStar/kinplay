// 为应用创建环境变量配置
const env = {
  // Supabase配置
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // 应用环境
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // 验证环境变量是否存在
  validateEnv: () => {
    const missingVars = [];
    
    if (!env.SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!env.SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    if (missingVars.length > 0) {
      console.warn(`环境变量缺失: ${missingVars.join(', ')}`);
      return false;
    }
    
    return true;
  }
};

export default env; 