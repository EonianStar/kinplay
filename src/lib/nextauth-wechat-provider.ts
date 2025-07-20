import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";

export interface WeChatProfile extends Record<string, any> {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
}

export default function WeChatProvider<P extends WeChatProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "wechat",
    name: "WeChat",
    type: "oauth",
    authorization: {
      url: "https://open.weixin.qq.com/connect/qrconnect",
      params: {
        scope: "snsapi_login",
        response_type: "code",
      },
    },
    token: "https://api.weixin.qq.com/sns/oauth2/access_token",
    userinfo: {
      url: "https://api.weixin.qq.com/sns/userinfo",
      async request({ tokens, client, provider }) {
        const url = `${provider.userinfo.url}?access_token=${tokens.access_token}&openid=${tokens.openid}`;
        const response = await fetch(url);
        return await response.json();
      },
    },
    profile(profile) {
      return {
        id: profile.unionid || profile.openid,
        name: profile.nickname,
        email: undefined, // 微信不返回邮箱
        image: profile.headimgurl,
      };
    },
    style: {
      logo: "/wechat.svg",
      logoDark: "/wechat.svg",
      bg: "#09b83e",
      text: "#fff",
    },
    options,
  };
} 