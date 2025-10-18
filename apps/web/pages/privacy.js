import { GradientHeading, Card } from "ui";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col items-center justify-center pt-8">
      <GradientHeading className="mb-8 text-center">Privacy Policy</GradientHeading>
      <Card className="max-w-3xl mx-auto p-6 text-left">
        <p className="mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information you provide directly to us. For example, we collect information when you create an account, subscribe, participate in any interactive features of our services, fill out a form, request customer support, or otherwise communicate with us. The types of information we may collect include your email address and any images you upload.
        </p>

        <h2 className="text-xl font-semibold mb-2">2. Use of Information</h2>
        <p className="mb-4">
          We may use the information we collect for various purposes, including to:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Provide, maintain, and improve our services;</li>
          <li>Process transactions and send you related information, including confirmations and invoices;</li>
          <li>Send you technical notices, updates, security alerts, and support and administrative messages;</li>
          <li>Respond to your comments, questions, and requests and provide customer service;</li>
          <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">3. Sharing of Information</h2>
        <p className="mb-4">
          We do not share your personal information with third parties except as described in this Privacy Policy. Your uploaded images are stored securely and are not shared publicly.
        </p>

        <h2 className="text-xl font-semibold mb-2">4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at [Your Contact Email].</p>
      </Card>
    </div>
  );
}