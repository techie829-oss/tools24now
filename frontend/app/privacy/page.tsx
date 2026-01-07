import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Tools24Now',
    description: 'Our commitment to data privacy and security. Read our Privacy Policy.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-6 lg:px-8">
            <div className="mx-auto max-w-4xl bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
                <p className="text-sm text-gray-500 mb-8">Last Updated: October 26, 2025</p>

                <div className="prose prose-blue max-w-none text-gray-600">
                    <p>
                        At Tools24Now, accessibility from tools24now.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Tools24Now and how we use it.
                    </p>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">1. Information We Collect</h3>
                    <p>
                        We collect minimal information to provide our services. This includes:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Log Files:</strong> Standard usage data like IP addresses, browser type, ISP, date/time stamp, referring/exit pages. This is for analyzing trends and administering the site.</li>
                        <li><strong>Cookies:</strong> We use cookies to store information about visitors' preferences and to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</li>
                        <li><strong>Uploaded Files:</strong> Files uploaded for processing are temporarily stored on our secure servers if server-side processing is required. These files are automatically deleted after a short period (typically 1 hour). Files processed client-side never leave your device.</li>
                    </ul>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">2. How We Use Your Information</h3>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li>Provide, operate, and maintain our website</li>
                        <li>Improve, personalize, and expand our website</li>
                        <li>Understand and analyze how you use our website</li>
                        <li>Develop new products, services, features, and functionality</li>
                    </ul>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">3. Google DoubleClick DART Cookie</h3>
                    <p>
                        Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy.
                    </p>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">4. Third Party Privacy Policies</h3>
                    <p>
                        Tools24Now's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
                    </p>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">5. Children's Information</h3>
                    <p>
                        Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. Tools24Now does not knowingly collect any Personal Identifiable Information from children under the age of 13.
                    </p>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">6. Consent</h3>
                    <p>
                        By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
                    </p>
                </div>
            </div>
        </div>
    );
}
