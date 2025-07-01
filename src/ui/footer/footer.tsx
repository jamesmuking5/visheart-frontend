"use client"

import Link from "next/link"
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="w-full h-16 bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo / Brand */}
          <div>
            <h2 className="text-xl font-bold mb-2">VisHeart</h2>
            <p className="text-sm">Empowering heart visualization for researchers and doctors.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:underline underline-offset-4 transition-all">Home</Link></li>
              <li><Link href="/about" className="hover:underline underline-offset-4 transition-all">About Us</Link></li>
              <li><Link href="/features" className="hover:underline underline-offset-4 transition-all">Features</Link></li>
              <li><Link href="/contact" className="hover:underline underline-offset-4 transition-all">Contact</Link></li>
            </ul>
          </div>
          
          {/* Our Services */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services/3d-visualization" className="hover:underline underline-offset-4 transition-all">2D Cardiac Segmentation</Link></li>
              <li><Link href="/services/data-analysis" className="hover:underline underline-offset-4 transition-all">3D Cardiac Segmentation</Link></li>
              <li><Link href="/services/support" className="hover:underline underline-offset-4 transition-all">Consultation & Support</Link></li>
            </ul>
          </div>

          {/* Contact Info / Social */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
            <p className="text-sm">Email: support@visheart.com</p>
            <p className="text-sm">Phone: +60 12-345 6789</p>
            <div className="flex space-x-3 mt-3">
              <Link href="#" className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200">
                <FaFacebook size={16} className="text-white" />
              </Link>
              <Link href="#" className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors duration-200">
                <FaTwitter size={16} className="text-white" />
              </Link>
              <Link href="#" className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200">
                <FaLinkedin size={16} className="text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-center items-center py-6">
          <div className="text-sm text-center">
            © {new Date().getFullYear()} VisHeart. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}