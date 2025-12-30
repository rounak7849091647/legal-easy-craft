import { Helmet } from 'react-helmet-async';
import { Users, ArrowLeft, CheckCircle, Star, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLayout from '@/components/PageLayout';
import { Link } from 'react-router-dom';

const packages = [
  {
    name: 'Basic Filing',
    price: '₹999',
    features: ['ITR-1/ITR-4 Filing', 'Form 16 Processing', 'Basic Deductions', 'Email Support'],
    popular: false
  },
  {
    name: 'Standard Filing',
    price: '₹2,499',
    features: ['Any ITR Form', 'Capital Gains', 'Tax Planning', 'Phone Support', 'Document Review'],
    popular: true
  },
  {
    name: 'Premium Filing',
    price: '₹4,999',
    features: ['Complex Returns', 'Foreign Income', 'Dedicated CA', 'Priority Support', 'Audit Assistance'],
    popular: false
  }
];

const CAAssistedFiling = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>CA Assisted Filing - LegalCareAI</title>
        <meta name="description" content="Get expert CA support for your tax filing. Professional chartered accountants to help you file accurately." />
      </Helmet>

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <Link to="/tax-services" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Tax Services</span>
        </Link>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Users size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">CA Assisted Filing</h1>
            <p className="text-muted-foreground mt-1">Expert chartered accountant support</p>
          </div>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {packages.map((pkg, index) => (
            <Card key={index} className={`relative bg-white/5 border-white/10 ${pkg.popular ? 'ring-2 ring-white/30' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-foreground text-lg">{pkg.name}</CardTitle>
                <p className="text-3xl font-bold text-foreground">{pkg.price}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-green-500 shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${pkg.popular ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-foreground hover:bg-white/20'}`}
                >
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why Choose */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Star size={20} />
              Why Choose Our CAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: '10+ Years', desc: 'Average Experience' },
                { title: '50,000+', desc: 'Returns Filed' },
                { title: '4.9★', desc: 'Customer Rating' },
                { title: '100%', desc: 'Accuracy Guaranteed' }
              ].map((stat, index) => (
                <div key={index} className="text-center p-4 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CAAssistedFiling;
