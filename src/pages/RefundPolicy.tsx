import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, FileDown, Mail, PackageCheck, RefreshCw } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-primary-100 mb-6">
            <RefreshCw className="w-4 h-4" /> Customer Support
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Refund Policy</h1>
          <p className="mt-6 text-xl text-primary-100">Clear guidance for physical and digital products.</p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5">
              <PackageCheck className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Physical Products</h2>
            <p className="text-gray-600 leading-relaxed text-lg mt-4">
              Customers should contact CreateLab regarding damaged, defective, incorrect, or missing products.
            </p>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5">
              <FileDown className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Digital Products</h2>
            <p className="text-gray-600 leading-relaxed text-lg mt-4">
              Because digital files can be downloaded immediately, digital purchases may generally be non-refundable once the file has been downloaded, except where required by applicable law or where the product is defective or not as described.
            </p>
          </section>
        </div>

        <section className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Wrong or Defective File</h2>
              <p className="text-gray-700 leading-relaxed text-lg mt-3">
                If a digital product is corrupted, unusable, or materially different from its description, CreateLab can provide a replacement or appropriate resolution.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto text-center mt-14">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Contact</h2>
          <p className="text-gray-600 leading-relaxed text-lg mt-4">
            Customers should contact CreateLab with their order number and details of the issue.
          </p>
          <Link to="/contact" className="btn-primary mt-6">
            Contact CreateLab <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
