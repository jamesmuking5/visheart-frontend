"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "What file formats does VisHeart support for MRI uploads?",
      answer: "VisHeart supports both DICOM (.dcm) and NifTI (.nii, .nii.gz) file formats. You can upload either single files or entire folders containing MRI stack data. Our platform automatically processes and converts these formats for optimal segmentation analysis."
    },
    {
      id: 2,
      question: "How does the AI segmentation process work?",
      answer: "Our AI pipeline uses a two-stage approach: first, YOLOv11 performs object detection to localize cardiac components (LVC, MYO, RV), then MedSAM provides precise pixel-level segmentation. The entire process is automated but allows for manual ROI refinement if needed."
    },
    {
      id: 3,
      question: "Is patient data secure and anonymized?",
      answer: "Absolutely. VisHeart automatically removes all patient-identifying information during upload. All data is processed on secure AWS cloud infrastructure with enterprise-grade encryption. Patient anonymity is ensured throughout the entire workflow, and data can be completely deleted upon request."
    },
    {
      id: 4,
      question: "Do I need an account to use the segmentation service?",
      answer: "No, you can perform cardiac segmentation without creating an account. However, creating an account allows you to store your uploaded MRI stacks and segmentation results for future access. Account creation is optional and designed for convenience."
    },
    {
      id: 5,
      question: "What are the three cardiac components that VisHeart segments?",
      answer: "VisHeart segments three primary cardiac components: Left Ventricle Cavity (LVC), Left Ventricle Myocardium (MYO), and Right Ventricle Cavity (RV). These segmentations are performed on short-axis cardiac MRI slices spanning from base to apex."
    },
    {
      id: 6,
      question: "Can I export and use the segmentation results elsewhere?",
      answer: "Yes, all segmentation results can be exported in NifTI format (.nii/.nii.gz), making them compatible with standard medical imaging software and research tools. You can save, export, view, or delete results as needed for your clinical or research workflow."
    },
    {
      id: 7,
      question: "What happens if I'm not satisfied with the AI segmentation results?",
      answer: "If the automated segmentation doesn't meet your requirements, you can manually refine the regions of interest (ROI) using our interactive tools. The system allows you to manually define cardiac components and re-run the segmentation process for improved accuracy."
    },
    {
      id: 8,
      question: "Is VisHeart suitable for both 2D and 3D cardiac analysis?",
      answer: "Yes, VisHeart supports both 2D slice-by-slice segmentation and advanced 3D cardiac reconstruction. The platform can perform comprehensive cardiac analysis, enabling downstream tasks like motion estimation, disease classification, and 3D modeling from 2D segmentation results."
    }
  ];

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section id="faq-section" aria-label="Frequently Asked Questions" className="faq-section">
      <div className="py-24 bg-gradient-to-br from-background via-muted/50 to-background">
        <div className="max-w-5xl mx-auto px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-foreground">
              Frequently Asked <span className="text-primary font-semibold">Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about VisHeart's AI-powered cardiac segmentation technology and research implementation.
            </p>
          </motion.div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all duration-300"
              >
                <motion.button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-primary/5 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1 * index + 0.2, duration: 0.3 }}
                      viewport={{ once: true }}
                      className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-white dark:text-black font-bold text-sm">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </motion.div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {faq.question}
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 ml-4"
                  >
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </motion.button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === faq.id ? "auto" : 0,
                    opacity: openFaq === faq.id ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pl-18">
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: openFaq === faq.id ? 1 : 0,
                        y: openFaq === faq.id ? 0 : 10
                      }}
                      transition={{ duration: 0.3, delay: openFaq === faq.id ? 0.1 : 0 }}
                      className="text-muted-foreground leading-relaxed"
                    >
                      {faq.answer}
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              viewport={{ once: true }}
              className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-8 h-8 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Our research team is ready to help you understand how VisHeart can advance your cardiac imaging research and clinical workflow.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-primary text-white dark:text-black rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 inline-flex items-center group"
            >
              Contact Research Team
              <motion.svg
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </motion.button>
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}