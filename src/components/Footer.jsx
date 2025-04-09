import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaGlobe,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 text-white py-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="container mx-auto px-6 sm:px-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About This App</h3>
            <p className="text-sm text-gray-200 leading-relaxed">
              This weather app provides real-time updates, forecasts, and
              detailed insights about the climate in your area and across the
              globe. Stay prepared and informed at all times.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-white/70 hover:text-white hover:scale-110 transition-transform duration-300"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#forecast"
                  className="text-white/70 hover:text-white hover:scale-110 transition-transform duration-300"
                >
                  Forecast
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-white/70 hover:text-white hover:scale-110 transition-transform duration-300"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Developer</h3>
            <p className="text-sm text-gray-200">
              Have suggestions or feedback? Connect with me:
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://ahad-dev.web.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white hover:scale-110 transition-transform duration-300"
              >
                <FaGlobe className="text-2xl" />
              </a>
              <a
                href="https://github.com/Iam-abdulahad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white hover:scale-110 transition-transform duration-300"
              >
                <FaGithub className="text-2xl" />
              </a>
              <a
                href="https://www.linkedin.com/in/iam-abdulahad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white hover:scale-110 transition-transform duration-300"
              >
                <FaLinkedin className="text-2xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-700 mt-10 pt-6 text-center">
          <p className="text-sm text-gray-200">
            &copy; {new Date().getFullYear()} SuMo Weather || All rights
            reserved.
          </p>
        </div>

        {/* Floating Animations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
          className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-r from-cyan-600 to-blue-400 blur-3xl opacity-30"
        ></motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
          className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-r from-green-400 to-teal-500 blur-3xl opacity-30"
        ></motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
