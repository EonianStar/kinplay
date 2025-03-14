import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">隐私政策</h1>
            
            <div className="prose prose-indigo max-w-none">
              <p className="text-gray-500 mb-4">
                最后更新日期：2024年3月4日
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                1. 信息收集
              </h2>
              <p className="text-gray-600 mb-4">
                我们收集的信息包括但不限于：
                - 账户信息（如电子邮件地址、用户名）
                - 个人资料信息
                - 使用数据
                - 设备信息
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                2. 信息使用
              </h2>
              <p className="text-gray-600 mb-4">
                我们使用收集的信息来：
                - 提供、维护和改进我们的服务
                - 发送通知和更新
                - 防止欺诈和滥用
                - 进行分析和研究
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                3. 信息共享
              </h2>
              <p className="text-gray-600 mb-4">
                我们不会出售您的个人信息。我们仅在以下情况下共享信息：
                - 经您同意
                - 遵守法律要求
                - 保护用户权益
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                4. 数据安全
              </h2>
              <p className="text-gray-600 mb-4">
                我们采用行业标准的安全措施保护您的信息，包括：
                - 数据加密
                - 安全存储
                - 访问控制
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                5. 您的权利
              </h2>
              <p className="text-gray-600 mb-4">
                您有权：
                - 访问您的个人信息
                - 更正不准确的信息
                - 删除您的账户
                - 退出数据收集
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