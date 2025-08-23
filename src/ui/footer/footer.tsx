"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa"
import { Heart, FileText, Brain, HelpCircle, MapPin, Mail, Phone } from "lucide-react"

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-10 w-full bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                VisHeart
              </h2>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              Advanced AI-powered cardiac segmentation platform bridging the gap between research and clinical practice.
            </p>
            <div className="flex space-x-3">
              <Link 
                href="#" 
                className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors duration-200"
                aria-label="Facebook"
              >
                <FaFacebook size={16} />
              </Link>
              <Link 
                href="#" 
                className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors duration-200"
                aria-label="Twitter"
              >
                <FaTwitter size={16} />
              </Link>
              <Link 
                href="#" 
                className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={16} />
              </Link>
              <Link 
                href="#" 
                className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors duration-200"
                aria-label="GitHub"
              >
                <FaGithub size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Platform Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center text-foreground">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Platform
            </h3>
            <ul className="space-y-3 text-base">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  Dashboard
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('faq-section')}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </motion.div>
          
          {/* AI Tools & Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center text-foreground">
              <Brain className="h-5 w-5 mr-2 text-primary" />
              AI Tools
            </h3>
            <ul className="space-y-3 text-base">
              <li>
                <Link href="/cardiac-segmentation" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center">
                  2D Cardiac Segmentation
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/60 flex items-center">
                  3D Cardiac Segmentation
                  <span className="ml-2 text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    Coming Soon
                  </span>
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Contact & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center text-foreground">
              <HelpCircle className="h-5 w-5 mr-2 text-primary" />
              Support
            </h3>
            <div className="space-y-3 text-base">
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                <span>support@visheart.com</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                <span>+60 12-345 6789</span>
              </div>
              <div className="flex items-start text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p>Swinburne University</p>
                  <p>Kuching, Sarawak</p>
                  <p>Malaysia</p>
                </div>
              </div>
              <button 
                onClick={() => scrollToSection('contact-section')}
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-200 font-medium mt-2"
              >
                Contact Us →
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-base text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} VisHeart. All Rights Reserved. 
            </div>
            <div className="flex items-center space-x-6 text-base">
              <Link href="/policy" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/doc" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}