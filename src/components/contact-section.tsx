"use client";

import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInView } from "react-intersection-observer";

export function ContactSection() {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  return (
    <section
      ref={ref}
      id="contact-section"
      aria-label="Contact VisHeart"
      className="relative overflow-hidden py-20 min-h-[60vh] scroll-mt-[80px] bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-900 dark:via-card dark:to-gray-800"
    >
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <h2 className="text-5xl font-extrabold text-foreground mb-4 drop-shadow-lg">
          {inView && (
            <Typewriter
              words={["Contact Our Team"]}
              loop={1}
              cursor
              cursorStyle="|"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          )}
        </h2>
        <p className="text-lg lg:text-xl text-muted-foreground text-center max-w-2xl mx-auto">
          Ready to revolutionize your cardiac imaging workflow? Contact our team of specialists for research, clinical, or technical support.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
        {/* Contact Information with Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="contact">Contact Info</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="form">Quick Form</TabsTrigger>
            </TabsList>

            {/* Contact Info Tab */}
            <TabsContent value="contact" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Call Us */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/60 dark:bg-card/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/20"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground ml-4">Call Us</h3>
                  </div>
                  <p className="text-muted-foreground mb-2">+60 12-345 6789</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM</p>
                </motion.div>

                {/* Email Us */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/60 dark:bg-card/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/20"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground ml-4">Email Us</h3>
                  </div>
                  <p className="text-muted-foreground mb-2">support@visheart.com</p>
                  <p className="text-sm text-muted-foreground">24/7 Support</p>
                </motion.div>
              </div>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location" className="mt-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 dark:bg-card/70 backdrop-blur-xl p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/20"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground ml-4">Our Location</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-foreground font-medium">VisHeart Medical Technologies</p>
                  <p className="text-muted-foreground">Swinburne University of Technology</p>
                  <p className="text-muted-foreground">Jalan Simpang Tiga, 93350</p>
                  <p className="text-muted-foreground">Kuching, Sarawak, Malaysia</p>
                </div>
                {/* Office Hours */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-lg font-semibold text-foreground mb-3">Office Hours</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>Monday - Friday: 9:00 AM - 6:00 PM</div>
                    <div>Saturday: 9:00 AM - 2:00 PM</div>
                    <div>Sunday: Closed</div>
                    <div className="text-primary">Emergency Support: 24/7</div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Quick Form Tab */}
            <TabsContent value="form" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/60 dark:bg-card/70 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-primary/20"
              >
                <h3 className="text-xl font-semibold text-foreground mb-6">Quick Contact</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all resize-none bg-background text-foreground placeholder:text-muted-foreground"
                  ></textarea>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium"
                  >
                    Send Message
                  </motion.button>
                </form>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="bg-white/60 dark:bg-card/70 backdrop-blur-xl p-4 rounded-2xl shadow-lg h-full min-h-[600px] border border-primary/20">
            <div className="w-full h-full rounded-lg overflow-hidden relative">
              {/* Google Maps Embed with proper center and zoom */}
              <iframe
                id="swinburne-map"
                src="https://maps.google.com/maps?q=Swinburne%20University%20of%20Technology%20Sarawak%20Campus,%20Jalan%20Simpang%20Tiga,%2093350%20Kuching,%20Sarawak,%20Malaysia&t=&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '500px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              ></iframe>
              {/* Recenter Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  // Reload the iframe to recenter
                  const iframe = document.getElementById('swinburne-map') as HTMLIFrameElement;
                  if (iframe) {
                    iframe.src = iframe.src;
                  }
                }}
                className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-10"
                title="Recenter Map"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Floating Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="absolute top-8 right-8 bg-white/80 dark:bg-card/80 backdrop-blur-xl p-3 rounded-lg shadow-xl max-w-[200px] border border-primary/20"
          >
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 bg-destructive rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs font-semibold text-foreground">VisHeart HQ</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              Cardiac imaging innovation center
            </p>
            <div className="text-xs text-muted-foreground">
              <p>📍 Swinburne University</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
    );
}