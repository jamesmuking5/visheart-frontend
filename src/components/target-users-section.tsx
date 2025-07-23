"use client";

import { motion } from 'framer-motion';

export function TargetUsersSection() { 
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

  return (
    <section aria-label="About VisHeart Platform" className="about-benefits-section">
      <div id="info-section" className="py-24 bg-gradient-to-br from-background via-muted/50 to-background">
        <div className="max-w-7xl mx-auto px-8">
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
        </div>
      </div>
    </section>
  );
}