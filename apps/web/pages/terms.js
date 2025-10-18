import { GradientHeading, Card } from "ui";

export default function TermsOfService() {
  return (
    <div className="flex flex-col items-center justify-center pt-8">
      <GradientHeading className="mb-8 text-center">Terms of Service</GradientHeading>
      <Card className="max-w-3xl mx-auto p-6 text-left">
        <p className="mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using our services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
        </p>

        <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
        <p className="mb-4">
          Our service provides users with the ability to generate text prompts from images using artificial intelligence. We also provide a library of community-generated images and prompts.
        </p>

        <h2 className="text-xl font-semibold mb-2">3. User Conduct</h2>
        <p className="mb-4">
          You agree not to use the service for any unlawful purpose or to upload any content that is illegal, harmful, or infringes on the rights of others. We reserve the right to terminate accounts that violate these terms.
        </p>

        <h2 className="text-xl font-semibold mb-2">4. Limitation of Liability</h2>
        <p className="mb-4">
          Our service is provided "as is" without any warranties. We are not liable for any damages arising from your use of the service.
        </p>

        <h2 className="text-xl font-semibold mb-2">5. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page.</p>
      </Card>
    </div>
  );
}