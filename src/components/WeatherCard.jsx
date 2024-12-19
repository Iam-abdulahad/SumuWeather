import React from "react";
import { motion } from "framer-motion";

const WeatherCard = () => {
  return (
    <motion.div
      className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-blue-500 p-6 text-white text-center">
        <h1 className="text-2xl font-bold">City Name</h1>
        <p className="text-lg">Date: December 19, 2024</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <motion.img
            className="w-20 h-20 mx-auto"
            src="https://via.placeholder.com/80"
            alt="Weather Icon"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          <h2 className="text-4xl font-bold">25°C</h2>
          <p className="text-lg">Sunny</p>
        </div>
      </div>
      <div className="p-6 border-t">
        <div className="grid grid-cols-3 text-sm text-gray-600">
          <div className="text-center">
            <p>Humidity</p>
            <p className="font-semibold">45%</p>
          </div>
          <div className="text-center">
            <p>Wind Speed</p>
            <p className="font-semibold">10 km/h</p>
          </div>
          <div className="text-center">
            <p>Pressure</p>
            <p className="font-semibold">1015 hPa</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherCard;
