import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, PackageCheck, Wrench } from 'lucide-react';

const supplyGroups = [
  {
    title: 'Materials',
    description: 'Find practical materials and ready-to-print assets for your next project.',
    icon: PackageCheck,
  },
  {
    title: 'Workshop tools',
    description: 'Explore useful tools and accessories for makers, studios, and small shops.',
    icon: Wrench,
  },
  {
    title: 'Project essentials',
    description: 'Browse the building blocks that help turn digital designs into finished work.',
    icon: Boxes,
  },
];

export default function Supplies() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-200">CreateLab supplies</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">Everything for your next build</h1>
          <p className="mt-6 text-xl text-primary-100">Stock your workspace with the materials, tools, and assets that keep ideas moving.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-5">
          {supplyGroups.map(({ title, description, icon: Icon }) => (
            <div key={title} className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600 leading-relaxed mt-3">{description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Start with the marketplace</h2>
          <p className="text-gray-600 mt-3">Browse the latest models and resources from CreateLab creators.</p>
          <Link to="/shop" className="btn-primary mt-7">
            Browse Models <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
