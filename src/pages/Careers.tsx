import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Heart, Sparkles } from 'lucide-react';

const interests = [
  '3D modeling and CAD',
  '3D printing',
  'Product design',
  'AI and generative tools',
  'Web development',
  'E-commerce',
  'Content creation',
  'Photography and video',
  'Maker education',
  'Community building',
];

export default function Careers() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-primary-100 mb-6">
            <Sparkles className="w-4 h-4" /> Join the Lab
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Careers at CreateLab</h1>
          <p className="mt-6 text-xl text-primary-100">Build the Future of Making</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-gray-600 leading-relaxed text-lg">
          CreateLab is growing, and we're interested in hearing from people who love creating things.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed text-lg">
          We're building a platform around 3D printing, digital design, AI-assisted creation, maker tools, products, and the people who use them.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed text-lg">
          We're currently a small and growing operation, so we don't have a long list of corporate job openings. But that doesn't mean we're not interested in meeting talented people.
        </p>
      </section>

      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5">
                <BriefcaseBusiness className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Who We're Interested In</h2>
              <p className="text-gray-600 leading-relaxed mt-3">
                As CreateLab grows, we're particularly interested in people with experience or enthusiasm in these areas:
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {interests.map((interest) => (
                <div key={interest} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700">
                  <Heart className="w-4 h-4 text-primary-600 shrink-0" />
                  <span>{interest}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Want to Work With Us?</h2>
        <p className="text-gray-600 leading-relaxed text-lg mt-4">
          If you think you could contribute to what we're building, send us a message through our contact page and tell us a little about yourself and what you'd like to build with CreateLab.
        </p>
        <p className="text-xl font-semibold text-gray-900 mt-6">We're always interested in meeting people who make things.</p>
        <Link to="/contact" className="btn-primary mt-8">
          Get in Touch <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
