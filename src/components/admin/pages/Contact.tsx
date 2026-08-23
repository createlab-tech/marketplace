import { useState, FormEvent } from 'react';
import { Mail, MessageSquare, MapPin, Send, Check } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName(''); setEmail(''); setSubject(''); setMessage('');
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Get in Touch</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">Have a question, suggestion, or need help? We'd love to hear from you.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: Mail, title: 'Email Us', value: 'support@createlab.tech', desc: 'We reply within 24 hours' },
            { icon: MessageSquare, title: 'Live Chat', value: 'Available 9am-6pm EST', desc: 'Click the chat bubble' },
            { icon: MapPin, title: 'Visit Us', value: 'San Francisco, CA', desc: 'Remote-first company' },
          ].map((item, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-900 mt-0.5">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            {sent && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-success-50 text-success-700 text-sm">
                <Check className="w-4 h-4" /> Message sent! We'll get back to you soon.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} className="input" placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea required value={message} onChange={(e) => setMessage(e.target.value)} className="input" rows={5} placeholder="Tell us more..." />
              </div>
              <button type="submit" className="btn-primary">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
