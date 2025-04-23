// EdgeOne验证工具函数

/**
 * 从cookie字符串中获取指定cookie的值
 */
export function getCookieValue(cookieString: string | null, name: string): string | null {
  if (!cookieString) return null;
  
  const match = cookieString.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

/**
 * 验证EdgeOne签名Cookie
 * @param cookies 完整的cookie字符串
 * @returns 是否通过验证
 */
export function verifyEdgeOneSignature(cookies: string | null): boolean {
  const eoSignature = getCookieValue(cookies, 'EO-Signature');
  const eoPolicy = getCookieValue(cookies, 'EO-Policy');
  
  // 简单验证是否存在（实际生产环境中可能需要更复杂的验证）
  return !!eoSignature && !!eoPolicy;
}

/**
 * 获取客户端IP地址
 */
export function getClientIP(req: Request): string | null {
  // 尝试从各种头部获取IP
  const headers = req.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  
  if (forwardedFor) {
    // x-forwarded-for可能包含多个IP，第一个通常是客户端真实IP
    return forwardedFor.split(',')[0].trim();
  }

  // 其他可能的头部
  return headers.get('cf-connecting-ip') || 
         headers.get('x-real-ip') || 
         headers.get('x-client-ip') || 
         null;
}

/**
 * 根据请求路径决定是否需要验证
 */
export function shouldVerifyRequest(path: string): boolean {
  // 排除不需要验证的路径
  const publicPaths = [
    '/login',
    '/register',
    '/api/auth',
    '/_next/',
    '/images/',
    '/favicon.ico'
  ];
  
  return !publicPaths.some(pp => path.startsWith(pp));
} 