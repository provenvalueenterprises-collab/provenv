import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Refund Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          
          {/* Introduction */}
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed mb-6">
              Proven Value Enterprise is committed to ensuring that every member of our food contribution and household essentials program has access to affordable and reliable products. We also believe in transparency regarding payments, contributions, and plan commitments.
            </p>
            <p className="text-gray-700 leading-relaxed mb-8">
              Please read our refund policy carefully:
            </p>
          </section>

          {/* 1. Contribution Plans & Refunds */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Contribution Plans & Refunds</h2>
            <ul className="text-gray-700 space-y-2 ml-4">
              <li>• All contributions made toward a Food or Household Essentials Plan are non-refundable once a plan has been activated.</li>
              <li>• Contributions represent your commitment to food security through our collective savings and supply system.</li>
              <li>• Since daily contributions are allocated toward sourcing and securing food items, refunds cannot be processed midway.</li>
            </ul>
          </section>

          {/* 2. Registration Fees */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Registration Fees</h2>
            <ul className="text-gray-700 space-y-2 ml-4">
              <li>• Registration fees paid for a thrift package or contribution plan are non-refundable.</li>
              <li>• These fees cover administrative and logistics costs associated with onboarding and plan management.</li>
            </ul>
          </section>

          {/* 3. Wallet Funding */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Wallet Funding</h2>
            <ul className="text-gray-700 space-y-2 ml-4">
              <li>• Funds added to your wallet but not yet allocated to a plan may be withdrawn upon request, subject to a [10% transaction/processing fee].</li>
              <li>• Withdrawal requests must be made through your user dashboard or by contacting support.</li>
            </ul>
          </section>

          {/* 4. Penalties & Defaults */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Penalties & Defaults</h2>
            <ul className="text-gray-700 space-y-2 ml-4">
              <li>• Penalties applied due to defaults in daily contributions are non-refundable.</li>
              <li>• Any settled defaults and penalties are considered final and cannot be reversed.</li>
            </ul>
          </section>

          {/* 5. Product Delivery */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Product Delivery</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Once food or household items have been processed for delivery under a contribution plan, they are non-returnable and non-refundable, except in cases of:
            </p>
            <ul className="text-gray-700 space-y-2 ml-4 mb-4">
              <li>• Damaged goods at the point of delivery</li>
              <li>• Wrong items delivered (different from plan entitlement)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              In such cases, members must raise a complaint within 48 hours of delivery via the complaint system on the dashboard or customer support.
            </p>
          </section>

          {/* 6. Referral Bonuses */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Referral Bonuses</h2>
            <ul className="text-gray-700 space-y-2 ml-4">
              <li>• Referral bonuses credited to your wallet are final and cannot be reversed or refunded as cash.</li>
              <li>• Bonuses may be used toward contributions, plan upgrades, or withdrawals (where applicable).</li>
            </ul>
          </section>

          {/* 7. Complaints & Resolution */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Complaints & Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              We encourage members to raise complaints directly from their dashboard. Our support team will review and resolve issues promptly.
            </p>
          </section>

          {/* 8. Policy Updates */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Policy Updates</h2>
            <p className="text-gray-700 leading-relaxed">
              This refund policy may be updated from time to time. Any changes will be communicated to members via email and our website.
            </p>
          </section>

          {/* Important Note */}
          <section className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-900 font-semibold">
                📌 Important Note: By subscribing to a contribution or thrift plan, you acknowledge that you have read, understood, and agreed to this Refund Policy.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
