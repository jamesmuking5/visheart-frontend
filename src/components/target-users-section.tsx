"use client";

import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { useInView } from "react-intersection-observer";

export function TargetUsersSection() {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  const endUsers = [
    {
      title: "Medical Researchers",
      desc: "Cardiac researchers and clinical data scientists leveraging AI for advanced cardiac studies.",
      icon: "🔬",
      applications: [
        "Cardiac motion estimation",
        "Disease classification",
        "Predictive analytics",
      ],
      gradient: "from-pink-400 to-red-400",
    },
    {
      title: "Healthcare Professionals",
      desc: "Cardiologists and radiologists requiring precise cardiac imaging analysis.",
      icon: "🏥",
      applications: [
        "Clinical diagnosis",
        "Treatment planning",
        "Patient monitoring",
      ],
      gradient: "from-teal-400 to-green-400",
    },
    {
      title: "Research Applications",
      desc: "Downstream tasks enabled by precise cardiac segmentation.",
      icon: "📊",
      applications: [
        "3D cardiac reconstruction",
        "Abnormality detection",
        "Motion tracking",
      ],
      gradient: "from-blue-400 to-purple-400",
    },
  ];

  return (
    <section
      ref={ref}
      id="target-users-section"
      aria-label="Target Users & Applications"
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
              words={["Target Users & Applications"]}
              loop={1}
              cursor
              cursorStyle="|"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          )}
        </h2>
        <p className="text-lg lg:text-xl text-muted-foreground text-center">
          Discover who benefits from <span className="font-bold text-primary">VisHeart</span>'s medical AI platform.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {endUsers.map((user, idx) => (
          <motion.div
            key={user.title}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: idx * 0.2 }}
            viewport={{ once: false }}
            className="relative bg-white/60 dark:bg-card/70 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-xl p-8 flex flex-col items-center justify-center hover:shadow-2xl transition-all duration-300"
          >
            <div
              className={`w-14 h-14 bg-gradient-to-br ${user.gradient} rounded-full flex items-center justify-center mb-4 shadow-lg text-3xl`}
            >
              <span>{user.icon}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2 text-center">
              {user.title}
            </h3>
            <p className="text-muted-foreground text-base mb-4 text-center">
              {user.desc}
            </p>
            <div className="w-full">
              <h4 className="font-semibold text-primary mb-2 text-center text-base">
                Key Applications
              </h4>
              <ul className="space-y-2">
                {user.applications.map((app, appIdx) => (
                  <li
                    key={appIdx}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="w-2 h-2 bg-primary rounded-full inline-block"></span>
                    {app}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}