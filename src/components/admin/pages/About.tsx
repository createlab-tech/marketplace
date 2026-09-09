import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Lightbulb, Sparkles, Target, Wrench } from 'lucide-react';

export default function About() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-primary-100 mb-6">
            <Sparkles className="w-4 h-4" /> Our Story
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">About CreateLab</h1>
          <p className="mt-6 text-xl text-primary-100">Where Ideas Become Real</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-gray-700 leading-relaxed text-lg">
          CreateLab was built around a simple idea:
        </p>
        <p className="mt-5 text-2xl font-semibold text-gray-900 leading-relaxed">
          Creating something shouldn't require you to be an expert before you can get started.
        </p>
        <p className="mt-6 text-gray-600 leading-relaxed text-lg">
          3D printing, digital modeling, artificial intelligence, CAD, and modern maker tools are changing the way people turn ideas into physical objects. CreateLab exists to bring those tools, resources, products, and creators together in one place.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed text-lg">
          Whether you're an experienced maker, a hobbyist, a designer, a collector, or someone with an idea that you don't yet know how to build, CreateLab is designed to help you take the next step.
        </p>
      </section>

      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Wrench, title: 'Built for Makers', text: 'The maker community is about more than simply buying and selling things. It is about experimenting, learning, and building something that did not exist yesterday.' },
              { icon: Lightbulb, title: 'From Ideas to Creations', text: 'CreateLab brings together products, 3D printing, digital design, maker resources, inspiration, and a growing community of creators sharing what they make.' },
              { icon: Compass, title: 'Building as We Go', text: "CreateLab is an evolving project. We are developing the platform with makers and small-scale creators in mind, learning from every project and improving along the way." },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
                <p className="text-gray-600 leading-relaxed mt-3">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
        </div>
        <p className="text-gray-600 leading-relaxed text-lg">
          Make creation more accessible.
        </p>
        <p className="text-gray-600 leading-relaxed text-lg mt-4">
          We want to make modern maker technology easier to understand, easier to use, and more accessible to everyone, from the person printing their first model to experienced creators developing products of their own.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-primary-800 to-primary-600 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Welcome to the Lab</h2>
          <p className="text-primary-100 mt-3 max-w-xl mx-auto text-lg">Explore. Experiment. Build something.</p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors">
              Explore CreateLab <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/sell" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors">
              Start Creating
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
