import { NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { initAdmin } from '@/lib/firebase-admin';

// 初始化 Firebase Admin
initAdmin();

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    // 使用 code 从微信获取访问令牌
    const tokenResponse = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${
        process.env.WECHAT_APP_ID
      }&secret=${
        process.env.WECHAT_APP_SECRET
      }&code=${code}&grant_type=authorization_code`
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token from WeChat');
    }

    const tokenData = await tokenResponse.json();

    // 获取用户信息
    const userInfoResponse = await fetch(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${
        tokenData.access_token
      }&openid=${tokenData.openid}`
    );

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from WeChat');
    }

    const userInfo = await userInfoResponse.json();

    // 创建或更新用户
    const userRecord = await auth().createUser({
      uid: `wechat:${userInfo.openid}`,
      displayName: userInfo.nickname,
      photoURL: userInfo.headimgurl,
      // 可以添加其他用户信息
    }).catch((error) => {
      if (error.code === 'auth/uid-already-exists') {
        return auth().getUser(`wechat:${userInfo.openid}`);
      }
      throw error;
    });

    // 创建自定义令牌
    const customToken = await auth().createCustomToken(userRecord.uid);

    return NextResponse.json({ customToken });
  } catch (error) {
    console.error('处理微信登录失败:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 