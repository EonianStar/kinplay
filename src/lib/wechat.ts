import { auth } from './firebase';
import { signInWithCustomToken } from 'firebase/auth';

interface WechatLoginResponse {
  code: string;
  state: string;
}

class WechatAuthService {
  private static instance: WechatAuthService;
  private appId: string;
  private redirectUri: string;

  private constructor() {
    this.appId = process.env.NEXT_PUBLIC_WECHAT_APP_ID || '';
    // 确保 redirectUri 是完整的 URL
    this.redirectUri = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/auth/wechat/callback`
      : '';
  }

  public static getInstance(): WechatAuthService {
    if (!WechatAuthService.instance) {
      WechatAuthService.instance = new WechatAuthService();
    }
    return WechatAuthService.instance;
  }

  // 生成用于微信登录的 URL
  public getQRCodeUrl(): string {
    const state = this.generateState();
    const scope = 'snsapi_login';
    
    // 存储 state 用于验证
    if (typeof window !== 'undefined') {
      localStorage.setItem('wechat_auth_state', state);
    }

    return `https://open.weixin.qq.com/connect/qrconnect?appid=${this.appId}&redirect_uri=${encodeURIComponent(
      this.redirectUri
    )}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
  }

  // 处理微信登录回调
  public async handleCallback(response: WechatLoginResponse): Promise<void> {
    const storedState = localStorage.getItem('wechat_auth_state');
    
    if (response.state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    localStorage.removeItem('wechat_auth_state');

    try {
      // 发送 code 到后端获取 Firebase Custom Token
      const tokenResponse = await fetch('/api/auth/wechat/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: response.code }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get Firebase token');
      }

      const { customToken } = await tokenResponse.json();
      
      // 使用 Custom Token 登录 Firebase
      await signInWithCustomToken(auth, customToken);
    } catch (error) {
      console.error('微信登录失败:', error);
      throw error;
    }
  }

  // 生成随机 state 参数
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

export const wechatAuth = WechatAuthService.getInstance(); 