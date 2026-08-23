import { Link } from 'react-router-dom';
import { Box, Users, Download, Shield, Target, Sparkles, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-primary-100 mb-6">
            <Sparkles className="w-4 h-4" /> Our Story
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Empowering 3D Creators Worldwide</h1>
          <p className="mt-6 text-lg text-primary-100">
            CreateLab is the marketplace where 3D artists, game developers, architects, and designers come together to buy and sell high-quality 3D models.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Download, value: '50K+', label: '3D Models' },
            { icon: Users, value: '12K+', label: 'Creators' },
            { icon: Shield, value: '2.5M+', label: 'Downloads' },
            { icon: Box, value: '190+', label: 'Countries' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                <stat.icon className="w-7 h-7 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
        </div>
        <p className="text-gray-600 leading-relaxed text-lg">
          We believe that great 3D content should be accessible to everyone. Whether you're building the next blockbuster game, designing a dream home, or creating immersive AR experiences, CreateLab connects you with the assets you need and the creators who make them.
        </p>
        <p className="text-gray-600 leading-relaxed text-lg mt-4">
          For creators, we offer a fair and transparent platform to monetize their skills. With a 70% revenue share, instant payouts, and zero listing fees, we make sure our artists are rewarded for their talent.
        </p>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What We Stand For</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Quality First', desc: 'Every model on our platform is reviewed to ensure it meets our quality standards before it reaches buyers.' },
            { title: 'Fair to Creators', desc: 'We give 70% of every sale back to the artist. No hidden fees, no surprise charges. Just fair compensation.' },
            { title: 'Community Driven', desc: 'We are building more than a marketplace. We are building a community where creators can learn, grow, and succeed together.' },
          ].map((val, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{val.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-primary-800 to-primary-600 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Join the CreateLab Community</h2>
          <p className="text-primary-100 mt-3 max-w-xl mx-auto">Whether you're buying or selling, there's a place for you here.</p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors">
              Browse Models
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
