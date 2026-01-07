import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Tools24Now',
    description: 'Terms and conditions for using the Tools24Now platform.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-6 lg:px-8">
            <div className="mx-auto max-w-4xl bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
                <p className="text-sm text-gray-500 mb-8">Last Updated: October 26, 2025</p>

                <div className="prose prose-blue max-w-none text-gray-600">
                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">1. Acceptance of Terms</h3>
                    <p>
                        By accessing and using this website (Tools24Now), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                    </p>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">2. Description of Service</h3>
                    <p>
                        Tools24Now provides users with access to a collection of online resources, including but not limited to PDF tools, image converters, and business calculators. You understand and agree that the Service is provided "AS-IS" and that Tools24Now assumes no responsibility for the timeliness, deletion, mis-delivery or failure to store any user communications or personalization settings.
                    </p>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">3. User Conduct</h3>
                    <p>
                        You agree to use the website only for lawful purposes. You agree not to take any action that might compromise the security of the website, render the website inaccessible to others or otherwise cause damage to the website or the Content. You agree not to use the website in any manner that might interfere with the rights of third parties.
                    </p>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">4. Intellectual Property</h3>
                    <p>
                        All content included on this site, such as text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, is the property of Tools24Now or its content suppliers and protected by international copyright laws.
                    </p>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">5. Limitation of Liability</h3>
                    <p>
                        In no event shall Tools24Now, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service.
                    </p>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">6. Changes to Terms</h3>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>

                    <h3 className="text-gray-900 font-semibold mt-6 mb-3 text-lg">7. Contact Us</h3>
                    <p>
                        If you have any questions about these Terms, please contact us at support@tools24now.com.
                    </p>
                </div>
            </div>
        </div>
    );
}
