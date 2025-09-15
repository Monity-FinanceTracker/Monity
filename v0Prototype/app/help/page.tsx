import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, MessageCircle, Phone, Mail, Book, Video, FileText, ExternalLink, Star } from "lucide-react"

const faqCategories = [
  {
    title: "Getting Started",
    faqs: [
      {
        question: "How do I set up my account?",
        answer:
          "Setting up your Monity account is simple. After signing up, you'll be guided through connecting your bank accounts, setting up your first budget, and customizing your financial goals.",
      },
      {
        question: "Is my financial data secure?",
        answer:
          "Yes, we use bank-level 256-bit SSL encryption and never store your banking credentials. We're also SOC 2 Type II certified and follow strict data protection protocols.",
      },
      {
        question: "How do I connect my bank accounts?",
        answer:
          "Go to Settings > Connected Accounts and click 'Add Account'. We support over 10,000 financial institutions through our secure banking partner.",
      },
    ],
  },
  {
    title: "Budgeting & Goals",
    faqs: [
      {
        question: "How do I create a budget?",
        answer:
          "Navigate to the Budgets page and click 'Create Budget'. You can choose from preset templates or create a custom budget based on your spending categories.",
      },
      {
        question: "Can I set multiple savings goals?",
        answer:
          "Yes! You can create unlimited savings goals with different target amounts and deadlines. Premium users also get AI-powered goal recommendations.",
      },
      {
        question: "How does automatic categorization work?",
        answer:
          "Our AI analyzes your transaction descriptions and merchant information to automatically categorize expenses. You can always review and adjust categories as needed.",
      },
    ],
  },
  {
    title: "Premium Features",
    faqs: [
      {
        question: "What's included in Premium?",
        answer:
          "Premium includes AI insights, advanced analytics, custom reports, investment tracking, group expense management, and priority support.",
      },
      {
        question: "Can I cancel my Premium subscription?",
        answer:
          "Yes, you can cancel anytime from Settings > Subscription. You'll continue to have Premium access until the end of your billing period.",
      },
      {
        question: "Is there a free trial?",
        answer: "Yes! New users get a 14-day free trial of Premium features. No credit card required to start.",
      },
    ],
  },
]

const supportOptions = [
  {
    title: "Live Chat",
    description: "Get instant help from our support team",
    availability: "24/7 for Premium users",
    icon: MessageCircle,
    action: "Start Chat",
  },
  {
    title: "Phone Support",
    description: "Speak directly with a support specialist",
    availability: "Mon-Fri, 9AM-6PM EST",
    icon: Phone,
    action: "Call Now",
  },
  {
    title: "Email Support",
    description: "Send us a detailed message",
    availability: "Response within 24 hours",
    icon: Mail,
    action: "Send Email",
  },
]

const resources = [
  {
    title: "User Guide",
    description: "Complete guide to using Monity",
    type: "Documentation",
    icon: Book,
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video walkthroughs",
    type: "Video",
    icon: Video,
  },
  {
    title: "API Documentation",
    description: "For developers and integrations",
    type: "Technical",
    icon: FileText,
  },
  {
    title: "Community Forum",
    description: "Connect with other users",
    type: "Community",
    icon: MessageCircle,
  },
]

const popularArticles = [
  {
    title: "How to Set Up Your First Budget",
    category: "Getting Started",
    readTime: "5 min read",
    rating: 4.8,
  },
  {
    title: "Understanding Your Credit Score",
    category: "Financial Health",
    readTime: "8 min read",
    rating: 4.9,
  },
  {
    title: "Maximizing Your Savings Goals",
    category: "Savings",
    readTime: "6 min read",
    rating: 4.7,
  },
  {
    title: "Investment Tracking Best Practices",
    category: "Investments",
    readTime: "10 min read",
    rating: 4.6,
  },
]

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-balance">How can we help you?</h1>
        <p className="text-muted-foreground">Find answers, get support, and learn how to make the most of Monity</p>
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search for help articles..." className="pl-10" />
        </div>
      </div>

      {/* Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {supportOptions.map((option, index) => {
          const IconComponent = option.icon
          return (
            <Card key={index} className="text-center hover:border-primary/40 transition-colors cursor-pointer">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{option.availability}</p>
                <Button className="w-full">{option.action}</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Popular Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Help Articles</CardTitle>
          <CardDescription>Most helpful articles from our knowledge base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{article.title}</h4>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{article.category}</Badge>
                  <span>{article.readTime}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span>{article.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <h3 className="text-lg font-semibold">{category.title}</h3>
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {categoryIndex < faqCategories.length - 1 && <div className="border-t my-6" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>Explore more ways to learn and get help</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((resource, index) => {
              const IconComponent = resource.icon
              return (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-center"
                >
                  <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-3">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{resource.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{resource.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {resource.type}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Send us a message and we'll get back to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Your name" />
            <Input placeholder="Email address" />
          </div>
          <Input placeholder="Subject" />
          <textarea
            className="w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            placeholder="Describe your issue or question..."
          />
          <Button className="w-full">Send Message</Button>
        </CardContent>
      </Card>
    </div>
  )
}
