import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Megaphone, Sparkles } from 'lucide-react';

export default function Press() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-primary-100 mb-6">
            <Sparkles className="w-4 h-4" /> CreateLab News
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Press &amp; Media</h1>
          <p className="mt-6 text-xl text-primary-100">Stories about the future of making.</p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">About CreateLab</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">
            CreateLab is a Canadian maker-focused platform dedicated to making modern creation more accessible.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg mt-4">
            The platform brings together 3D printing, digital design, AI-assisted creation, maker resources, products, and creator-focused tools.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg mt-4">
            CreateLab is being developed with a simple mission:
          </p>
          <p className="text-2xl font-semibold text-gray-900 mt-3">Make creation more accessible.</p>
        </section>

        <section className="mt-14 bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900">Media &amp; Partnership Inquiries</h2>
          <p className="text-gray-600 leading-relaxed text-lg mt-4">
            For interviews, media inquiries, product reviews, partnerships, collaborations, or other press-related requests, please contact us through our contact page.
          </p>
          <Link to="/contact" className="btn-primary mt-6">
            Contact CreateLab <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900">Media Resources</h2>
          <p className="text-gray-600 leading-relaxed text-lg mt-4">
            Our press resources will be made available here as CreateLab grows.
          </p>
          <div className="mt-8 border-t border-gray-200 pt-8 grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Media contact</p>
              <a href="mailto:createlab.tech@gmail.com" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mt-2">
                <Mail className="w-4 h-4" /> createlab.tech@gmail.com
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">CreateLab</p>
              <p className="text-gray-600 mt-2">Canada</p>
              <p className="text-gray-600 mt-1">Website: createlab.tech</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
