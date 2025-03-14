import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">联系我们</h1>
            
            <div className="prose prose-indigo max-w-none">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    客户支持
                  </h2>
                  <p className="text-gray-600">
                    如果您在使用 KinPlay 过程中遇到任何问题，请随时联系我们的客户支持团队。
                    我们将在24小时内回复您的询问。
                  </p>
                  <div className="mt-4">
                    <p className="text-gray-600">
                      电子邮件：heng.xin@qq.com
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    商务合作
                  </h2>
                  <p className="text-gray-600">
                    如果您对与 KinPlay 进行商务合作感兴趣，请联系我们的商务团队。
                  </p>
                  <div className="mt-4">
                    <p className="text-gray-600">
                      电子邮件：heng.xin@qq.com
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    媒体咨询
                  </h2>
                  <p className="text-gray-600">
                    媒体相关的咨询，请联系我们的公关团队。
                  </p>
                  <div className="mt-4">
                    <p className="text-gray-600">
                      电子邮件：heng.xin@qq.com
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    办公地址
                  </h2>
                  <div className="mt-2 text-base text-gray-500">
                    <p>中国四川省成都市锦江区沙河铺街206号</p>
                    <p>领域小区</p>
                    <p>邮编: 610066</p>
                  </div>
                </div>
              </div>
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