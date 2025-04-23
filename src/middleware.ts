import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyEdgeOneSignature, shouldVerifyRequest } from './utils/edgeone';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;

  // 添加 CORS 头
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 如果是OPTIONS请求（预检请求），直接返回200响应
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
  
  // 获取完整的cookie字符串
  const cookies = request.headers.get('cookie');
  
  // 检查是否需要验证该路径的请求
  if (shouldVerifyRequest(path)) {
    // 验证EdgeOne Cookie签名
    const isValidSignature = verifyEdgeOneSignature(cookies);
    
    // 默认情况下，我们只记录而不阻止 - 取消注释下面的代码以强制执行验证
    /*
    if (!isValidSignature) {
      console.log('EdgeOne验证失败:', path);
      return new NextResponse(
        JSON.stringify({ message: '未授权访问' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    */
  }
  
  return response;
}

// 配置匹配的路由
export const config = {
  matcher: [
    // 匹配所有路径，但排除静态资源
    '/((?!_next/static|_next/image|favicon.ico|images|public).*)',
  ],
}; 