import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter } from "react-icons/fa";
import { SiFiverr } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-10">
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
            <p className="text-sm text-gray-400 leading-relaxed">
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
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#forecast"
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Forecast
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <p className="text-sm text-gray-400">
              Have suggestions or feedback? Connect with us:
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://github.com/YourGithub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <FaGithub className="text-2xl" />
              </a>
              <a
                href="https://www.linkedin.com/in/YourLinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <FaLinkedin className="text-2xl" />
              </a>
              <a
                href="mailto:your-email@example.com"
                className="text-gray-400 hover:text-white transition"
              >
                <FaEnvelope className="text-2xl" />
              </a>
              <a
                href="https://x.com/YourTwitter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <FaTwitter className="text-2xl" />
              </a>
              <a
                href="https://www.fiverr.com/YourFiverr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <SiFiverr className="text-2xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-700 mt-10 pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} WeatherApp || All rights reserved.
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
