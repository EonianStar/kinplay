import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">服务条款</h1>
            
            <div className="prose prose-indigo max-w-none">
              <p className="text-gray-500 mb-4">
                最后更新日期：2024年3月4日
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                1. 服务说明
              </h2>
              <p className="text-gray-600 mb-4">
                KinPlay 是一个家庭游戏化生活平台，旨在帮助家庭成员通过游戏化方式共同成长。
                我们提供的服务包括但不限于任务管理、奖励系统、家庭互动等功能。
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                2. 用户责任
              </h2>
              <p className="text-gray-600 mb-4">
                用户在使用 KinPlay 服务时应：
                - 提供真实、准确的信息
                - 保护账户安全
                - 遵守相关法律法规
                - 尊重其他用户的权益
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                3. 知识产权
              </h2>
              <p className="text-gray-600 mb-4">
                KinPlay 的所有内容，包括但不限于文字、图片、代码、标识等，
                均受知识产权法律保护。未经许可，不得进行复制、修改或分发。
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                4. 服务变更
              </h2>
              <p className="text-gray-600 mb-4">
                我们保留随时修改或终止服务的权利。对服务的重大变更，
                我们会提前通知用户。
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                5. 免责声明
              </h2>
              <p className="text-gray-600 mb-4">
                - 我们不对用户产生的内容负责
                - 我们不保证服务不会中断或出错
                - 我们不对因使用服务造成的损失负责
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                6. 争议解决
              </h2>
              <p className="text-gray-600 mb-4">
                与服务相关的争议应通过友好协商解决。
                如协商不成，应提交至有管辖权的法院处理。
              </p>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-500"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 