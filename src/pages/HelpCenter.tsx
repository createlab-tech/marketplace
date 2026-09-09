import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CircleHelp, Download, Package, Printer, UserRound } from 'lucide-react';

type HelpArticle = {
  question: string;
  answer: string;
};

type HelpSection = {
  id: string;
  title: string;
  icon: typeof BookOpen;
  articles: HelpArticle[];
};

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    articles: [
      { question: 'How do I create an account?', answer: 'Select Sign Up, enter your email and password, and follow the verification instructions. An account lets you save favorites, purchase products, and manage your creator activity.' },
      { question: 'How do I find products?', answer: 'Use Browse to view the marketplace, search by keyword, or open Categories to explore products by type. Open any listing to review its images, description, price, seller, and available license.' },
      { question: 'How do I find 3D models?', answer: 'Start in Browse or choose a category. You can also search for a model by name, creator, format, or project need, then use the model detail page to review its specifications.' },
      { question: 'How do I purchase a product?', answer: 'Open a listing, review the price and product details, add it to your cart, and continue to checkout. For digital products, review the license before completing your purchase.' },
      { question: 'How do I download a digital product?', answer: 'After a completed purchase, use your account area or the order confirmation to access the available download. If a file is missing, corrupted, or unusable, contact support with your order number.' },
    ],
  },
  {
    id: 'orders',
    title: 'Orders',
    icon: Package,
    articles: [
      { question: 'How can I check my order status?', answer: 'Sign in and open your dashboard to review your orders and their current status. Orders may remain pending until payment is confirmed.' },
      { question: 'How does shipping work?', answer: 'Shipping applies to physical products and is shown on the listing before checkout. Review the seller\'s shipping details and delivery information before placing your order.' },
      { question: 'How do I track my order?', answer: 'When tracking information is available, it will be provided with the order or shipping confirmation. If tracking is not available or your shipment is delayed, contact us with your order number.' },
      { question: 'What should I do about a damaged item?', answer: 'Contact CreateLab as soon as possible with your order number, photos of the damage, and a description of the issue. Keep the item and its packaging until the issue is reviewed.' },
      { question: 'What should I do if an item is missing?', answer: 'Check the order contents and shipping updates first, then contact support with your order number and the missing item details so we can investigate.' },
      { question: 'How do returns work?', answer: 'Return eligibility depends on whether the order contains a physical or digital product and on the product-specific terms. Contact support before returning anything so we can provide the correct next steps.' },
    ],
  },
  {
    id: 'digital-products',
    title: 'Digital Products',
    icon: Download,
    articles: [
      { question: 'How do I download my files?', answer: 'Use the download access provided after your completed purchase. Download the files to a secure location and keep a copy of your order details.' },
      { question: 'Which file formats are available?', answer: 'Available formats are listed on each model page. Common formats may include STL, 3MF, OBJ, or other creator-provided files. Confirm that the format works with your software or printer before purchasing.' },
      { question: 'Where can I find license information?', answer: 'The applicable license is displayed with the digital model listing and in the purchase details. Read the license before downloading or using the file. See the License Info page for an overview of personal and commercial use.' },
      { question: 'Can I use a model commercially?', answer: 'Only when the specific license attached to that model grants commercial rights. Commercial rights are not automatically included with every digital model, so review the listing license before selling physical prints or using the model in a project.' },
    ],
  },
  {
    id: '3d-printing',
    title: '3D Printing',
    icon: Printer,
    articles: [
      { question: 'How should I prepare a model for printing?', answer: 'Review the model description, dimensions, orientation, supports, wall thickness, and recommended settings. Import the file into your slicer and inspect the preview before starting the print.' },
      { question: 'What is the difference between STL and 3MF?', answer: 'STL stores the model geometry, while 3MF can also preserve additional project information such as materials, settings, and multiple objects. The best choice depends on what the creator provides and what your slicer supports.' },
      { question: 'What should I know about FDM printing?', answer: 'FDM printers build objects layer by layer from filament. Pay attention to bed adhesion, layer height, infill, supports, nozzle temperature, and bed temperature for your material and printer.' },
      { question: 'What should I know about resin printing?', answer: 'Resin printing uses liquid resin and requires careful exposure, orientation, supports, washing, and curing. Follow your printer and resin manufacturer\'s safety instructions and use appropriate protective equipment.' },
      { question: 'How do I troubleshoot common printing problems?', answer: 'Check the slicer preview, model orientation, supports, bed or build-plate preparation, material settings, and printer calibration. If the file itself appears defective or differs materially from its description, contact the seller or CreateLab support.' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    icon: UserRound,
    articles: [
      { question: 'How do I get password help?', answer: 'Use the password recovery option on the sign-in page and follow the email instructions. If you cannot access the email address on your account, contact support for help.' },
      { question: 'How do I update my account settings?', answer: 'Sign in and open your dashboard to review the account options currently available. Contact support if you need to change information that is not yet editable in the dashboard.' },
      { question: 'How does privacy work?', answer: 'CreateLab uses account information to provide marketplace features such as authentication, purchases, favorites, and creator tools. Contact us with privacy questions or requests about your information.' },
      { question: 'How do I delete my account?', answer: 'Contact support from the email address associated with your account and request deletion. Include any relevant order information, and resolve outstanding issues before requesting removal.' },
    ],
  },
];

export default function HelpCenter() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-primary-100 mb-6">
            <CircleHelp className="w-4 h-4" /> Support &amp; Guidance
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Help Center</h1>
          <p className="mt-6 text-xl text-primary-100">Find answers about buying, making, printing, and selling with CreateLab.</p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav aria-label="Help topics" className="flex flex-wrap gap-2 mb-12">
          {helpSections.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-700 transition-colors">
              <section.icon className="w-4 h-4" /> {section.title}
            </a>
          ))}
        </nav>

        <div className="space-y-12">
          {helpSections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <div className="border border-gray-200 rounded-xl bg-white divide-y divide-gray-200 overflow-hidden">
                {section.articles.map((article) => (
                  <details key={article.question} className="group p-5">
                    <summary className="cursor-pointer list-none pr-8 font-semibold text-gray-900 relative after:absolute after:right-0 after:top-0 after:text-xl after:text-primary-600 after:content-['+'] group-open:after:content-['−']">
                      {article.question}
                    </summary>
                    <p className="text-gray-600 leading-relaxed mt-3 max-w-3xl">{article.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-16 rounded-3xl bg-gradient-to-r from-primary-800 to-primary-600 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Can't find your answer?</h2>
          <p className="text-primary-100 mt-3 text-lg">Contact us and we'll help.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors mt-6">
            Contact Support <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
