import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, FileKey, Shield, User } from 'lucide-react';

export default function LicenseInfo() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-primary-100 mb-6">
            <FileKey className="w-4 h-4" /> Marketplace Standards
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">License Information</h1>
          <p className="mt-6 text-xl text-primary-100">Understand the rights attached to every digital model.</p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-amber-700 shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Important</h2>
              <p className="text-gray-700 leading-relaxed mt-2">
                Every model or digital product should display its applicable license before purchase or download. This is an area where we will establish the exact licensing system before launching a large marketplace.
              </p>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6 mt-10">
          <article className="border border-gray-200 rounded-xl bg-white p-6 md:p-8">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Personal Use</h2>
            <p className="text-gray-600 leading-relaxed mt-4">
              A digital model purchased or downloaded under a personal-use license may be used to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 leading-relaxed mt-4">
              <li>Print the model for yourself</li>
              <li>Display your printed creation</li>
              <li>Paint or modify the physical print for personal use</li>
            </ul>
            <h3 className="font-semibold text-gray-900 mt-8">But generally not:</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 leading-relaxed mt-3">
              <li>Redistribute the digital file</li>
              <li>Upload the file to another website</li>
              <li>Sell the digital file</li>
              <li>Claim the original model as your own</li>
            </ul>
          </article>

          <article className="border border-gray-200 rounded-xl bg-white p-6 md:p-8">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5">
              <BriefcaseBusiness className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Commercial Use</h2>
            <p className="text-gray-600 leading-relaxed mt-4">
              Commercial licenses may allow creators to sell physical prints made from a model, depending on the specific license attached to that model.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
              <p className="font-semibold text-gray-900">Commercial rights are not automatically included with every digital model.</p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">Always review the specific license shown on the model listing before purchasing, downloading, or selling physical creations.</p>
            </div>
          </article>
        </section>

        <section className="text-center mt-12">
          <p className="text-gray-600">Have a question about a specific model or license?</p>
          <Link to="/contact" className="btn-primary mt-5">
            Contact CreateLab <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
