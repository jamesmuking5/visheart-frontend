"use client";

import { motion } from "framer-motion";

export function FaqSection() {
  return (
    <section id="faq-section" aria-label="Frequently Asked Questions" className="faq-section">
        <div className="py-24 bg-gradient-to-br from-background to-muted">
            <div className="max-w-4xl mx-auto">
                <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
                >
                <h2 className="text-4xl font-light mb-6 text-foreground">
                    Frequently Asked Questions
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Find answers to common questions about VisHeart's AI-powered cardiac segmentation technology and implementation.
                </p>
                </motion.div>

                <div className="space-y-6">
                {/* FAQ 1 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                    How accurate is VisHeart's AI segmentation technology?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                    VisHeart achieves over 95% accuracy in cardiac structure identification, validated through extensive clinical trials and peer-reviewed studies. Our AI models are trained on diverse datasets from leading medical institutions worldwide.
                    </p>
                </motion.div>

                {/* FAQ 2 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                    What imaging modalities does VisHeart support?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                    VisHeart is compatible with multiple imaging modalities including MRI, CT, echocardiography, and nuclear imaging. Our platform automatically adapts to different image formats and resolutions for seamless integration.
                    </p>
                </motion.div>

                {/* FAQ 3 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                    How long does the implementation process take?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                    Implementation typically takes 2-4 weeks depending on your existing infrastructure. This includes system integration, staff training, and workflow optimization. Our dedicated support team ensures a smooth transition with minimal disruption.
                    </p>
                </motion.div>

                {/* FAQ 4 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                    Is patient data secure in the cloud platform?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                    Absolutely. VisHeart employs enterprise-grade encryption, HIPAA compliance, and advanced security protocols. All data is encrypted both in transit and at rest, with strict access controls and audit trails for complete transparency.
                    </p>
                </motion.div>

                {/* FAQ 5 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                    What kind of training and support do you provide?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                    We offer comprehensive training programs including hands-on workshops, online tutorials, and personalized sessions. Our 24/7 technical support team provides ongoing assistance, regular software updates, and continuous optimization recommendations.
                    </p>
                </motion.div>

                {/* FAQ 6 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                    Can VisHeart integrate with existing hospital systems?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                    Yes, VisHeart seamlessly integrates with most PACS, EMR, and hospital information systems through standard DICOM protocols and HL7 interfaces. Our technical team works closely with your IT department to ensure smooth integration.
                    </p>
                </motion.div>
                </div>

                {/* Contact CTA - Updated for theme adaptation */}
                <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                viewport={{ once: true }}
                className="text-center mt-16"
                >
                <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
                    <h3 className="text-2xl font-semibold text-foreground mb-4">
                    Still have questions?
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                    Our team of experts is ready to help you understand how VisHeart can transform your cardiac imaging workflow.
                    </p>
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center group"
                    >
                    Contact Our Team
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    </motion.button>
                </div>
                </motion.div>
            </div>
        </div>
    </section>
  );
}