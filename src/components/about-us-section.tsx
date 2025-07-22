  "use client";

  import { motion } from 'framer-motion';

  export function AboutUsSection() {
    // Technical specifications
    const technicalSpecs = [
      { title: "Supported Formats", desc: "DICOM (.dcm) & NifTI (.nii/.nii.gz)", icon: "📁" },
      { title: "AI Models", desc: "YOLOv11 + MedSAM Integration", icon: "🤖" },
      { title: "Processing", desc: "Automated + Manual Refinement", icon: "⚙️" },
      { title: "Security", desc: "Full Patient Data Anonymization", icon: "🔒" }
    ];

    // End users and applications
    const endUsers = [
      { 
        title: "Medical Researchers", 
        desc: "Cardiac researchers and clinical data scientists leveraging AI for advanced cardiac studies",
        icon: "🔬",
        applications: ["Cardiac motion estimation", "Disease classification", "Predictive analytics"]
      },
      { 
        title: "Healthcare Professionals", 
        desc: "Cardiologists and radiologists requiring precise cardiac imaging analysis",
        icon: "🏥",
        applications: ["Clinical diagnosis", "Treatment planning", "Patient monitoring"]
      },
      { 
        title: "Research Applications", 
        desc: "Downstream tasks enabled by precise cardiac segmentation",
        icon: "📊",
        applications: ["3D cardiac reconstruction", "Abnormality detection", "Motion tracking"]
      }
    ];

    // System architecture highlights
    const systemFeatures = [
      { title: "Industry-Standard Framework", desc: "Built with MERN stack for scalability and reliability" },
      { title: "Python Integration", desc: "Seamless integration with AI models and medical imaging libraries" },
      { title: "Responsive Design", desc: "Optimized for various devices and screen sizes" },
      { title: "User-Centric Interface", desc: "Non-cluttered UI designed specifically for medical professionals" },
      { title: "Data Security", desc: "Comprehensive patient anonymity and secure data handling" },
      { title: "Account Management", desc: "Optional user accounts with secure data storage and deletion" },
      { title: "GPU-Accelerated AI", desc: "Utilizes a dedicated Cloud GPU server for accelerated AI model inferencing and analysis" },
      { title: "Scalable Cloud Deployment", desc: "Hosted on Amazon Web Services (AWS) for a secure, reliable, and scalable infrastructure" }
    ];

    return (
      <section aria-label="About VisHeart Platform" className="about-benefits-section">
        <div id="info-section" className="py-24 bg-gradient-to-br from-background via-muted/50 to-background">
          <div className="max-w-7xl mx-auto px-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-light mb-6 text-foreground">
                About <span className="text-primary font-semibold">VisHeart</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Transforming cardiac MRI analysis through AI-powered segmentation technology
              </p>
            </motion.div>

            {/* Problem Statement & Solution */}
            <div className="max-w-6xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Problem Statement */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 text-center"
                >
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="text-2xl font-semibold text-foreground mb-4 flex items-center justify-center"
                  >
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      viewport={{ once: true }}
                      className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mr-3"
                    >
                      <span className="text-white text-xl">⚠️</span>
                    </motion.div>
                    The Challenge
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="text-muted-foreground leading-relaxed text-center"
                  >
                    Advanced cardiac segmentation models exist but operate as standalone systems without user-friendly interfaces. 
                    This gap hinders clinical adoption and integration into healthcare workflows, limiting the real-world impact of AI research.
                  </motion.p>
                </motion.div>
            
                {/* Our Solution */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 text-center"
                >
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="text-2xl font-semibold text-foreground mb-4 flex items-center justify-center"
                  >
                    <motion.div 
                      initial={{ scale: 0, rotate: 180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      viewport={{ once: true }}
                      className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3"
                    >
                      <span className="text-white text-xl">💡</span>
                    </motion.div>
                    Our Solution
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    viewport={{ once: true }}
                    className="text-muted-foreground leading-relaxed text-center"
                  >
                    VisHeart bridges this gap with an intuitive web-based platform that integrates cutting-edge AI models into clinical workflows. 
                    We enable seamless MRI upload, automated segmentation, and interactive refinement tools for healthcare professionals.
                  </motion.p>
                </motion.div>
              </motion.div>
            </div>

            {/* Technical Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h3 className="text-2xl font-semibold text-center text-foreground mb-8">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {technicalSpecs.map((spec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5 + (index * 0.1), duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 text-center hover:shadow-lg transition-all duration-300"
                  >
                    <div className="text-3xl mb-3">{spec.icon}</div>
                    <h4 className="font-semibold text-foreground mb-2">{spec.title}</h4>
                    <p className="text-sm text-muted-foreground">{spec.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* End Users & Applications */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h3 className="text-2xl font-semibold text-center text-foreground mb-8">Target Users & Applications</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {endUsers.map((user, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.6 + (index * 0.2), duration: 0.6 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-3">{user.icon}</div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">{user.title}</h4>
                      <p className="text-muted-foreground text-sm">{user.desc}</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-foreground text-sm">Key Applications:</h5>
                      {user.applications.map((app, appIndex) => (
                        <motion.div
                          key={appIndex}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + (index * 0.2) + (appIndex * 0.1), duration: 0.3 }}
                          viewport={{ once: true }}
                          className="flex items-center space-x-2"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-xs text-muted-foreground">{app}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* System Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <h3 className="text-2xl font-semibold text-center text-foreground mb-8">Platform Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.7 + (index * 0.1), duration: 0.4 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-primary/5 transition-all duration-300"
                  >
                    <motion.div 
                      initial={{ scale: 0, rotate: -90 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.8 + (index * 0.1), duration: 0.3 }}
                      viewport={{ once: true }}
                      className="w-6 h-6 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <svg className="w-3 h-3 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </motion.div>
                    <div>
                      <motion.h4 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + (index * 0.1), duration: 0.3 }}
                        viewport={{ once: true }}
                        className="font-semibold text-foreground mb-1"
                      >
                        {feature.title}
                      </motion.h4>
                      <motion.p 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 + (index * 0.1), duration: 0.3 }}
                        viewport={{ once: true }}
                        className="text-sm text-muted-foreground"
                      >
                        {feature.desc}
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }