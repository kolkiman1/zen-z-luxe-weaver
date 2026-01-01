import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email').max(255),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(20, 'Message must be at least 20 characters').max(5000),
});

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = contactSchema.parse(formData);
      setIsSubmitting(true);

      // Save to database
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          subject: validatedData.subject,
          message: validatedData.message,
        });

      if (error) throw error;

      // Send email notification to support
      try {
        await supabase.functions.invoke('support-notification', {
          body: {
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone || null,
            subject: validatedData.subject,
            message: validatedData.message,
          },
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the form submission if email fails
      }

      setIsSubmitted(true);
      toast.success('Message sent successfully!', {
        description: "We'll get back to you within 24-48 hours.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error('Failed to send message', {
          description: 'Please try again later.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['Gulshan-2, Dhaka 1212', 'Bangladesh'],
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+880 1XXX-XXXXXX', '+880 1XXX-XXXXXX'],
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['hello@gen-zee.store', 'support@gen-zee.store'],
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Sat - Thu: 10AM - 8PM', 'Friday: Closed'],
    },
  ];

  return (
    <>
      <SEOHead
        title="Contact Us"
        description="Get in touch with Gen-zee.store. We're here to help with your fashion inquiries, orders, and support. Contact us via phone, email, or visit our store in Dhaka."
        keywords="contact Gen-zee, customer support, fashion store dhaka, contact us"
        url="/contact"
      />

      <Header />
      <CartSidebar />

      <main className="pt-24 pb-16 min-h-screen">
        <div className="container-luxury">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs tracking-[0.2em] uppercase bg-primary/10 border border-primary/20 rounded-full text-primary">
              Get in Touch
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
              We'd Love to <span className="text-gradient-gold">Hear</span> From You
            </h1>
            <p className="text-muted-foreground text-lg">
              Have a question about our products, need styling advice, or want to collaborate? 
              We're here to help and would love to connect with you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isSubmitted ? (
                <div className="glass rounded-2xl p-8 md:p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <CheckCircle size={40} className="text-primary" />
                  </motion.div>
                  <h2 className="font-display text-2xl mb-4">Message Sent!</h2>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. Our team will review your message and get back to you within 24-48 hours.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} variant="outline">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 md:p-12 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MessageSquare size={20} className="text-primary" />
                    </div>
                    <h2 className="font-display text-2xl">Send a Message</h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={`mt-1 ${errors.name ? 'border-destructive' : ''}`}
                      />
                      {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={`mt-1 ${errors.email ? 'border-destructive' : ''}`}
                      />
                      {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+880 1XXX-XXXXXX"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        className={`mt-1 ${errors.subject ? 'border-destructive' : ''}`}
                      />
                      {errors.subject && <p className="text-destructive text-sm mt-1">{errors.subject}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      className={`mt-1 ${errors.message ? 'border-destructive' : ''}`}
                    />
                    {errors.message && <p className="text-destructive text-sm mt-1">{errors.message}</p>}
                  </div>

                  <Button type="submit" className="w-full btn-primary py-6 gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="glass rounded-xl p-6 hover:border-primary/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <info.icon size={24} className="text-primary" />
                    </div>
                    <h3 className="font-display text-lg mb-2">{info.title}</h3>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-muted-foreground text-sm">{detail}</p>
                    ))}
                  </motion.div>
                ))}
              </div>

              {/* Map Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="glass rounded-xl p-1 aspect-video overflow-hidden"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.2503089555854!2d90.41475281543158!3d23.781498993855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7a0f70deb73%3A0x30c36498f90fe023!2sGulshan%202%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1640000000000!5m2!1sen!2sbd"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location"
                  className="rounded-lg"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ContactPage;
