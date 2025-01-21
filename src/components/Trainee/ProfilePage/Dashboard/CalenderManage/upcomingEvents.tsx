import React from "react";
import { FaLink, FaCalendarAlt, FaClock } from "react-icons/fa";

const UpcomingEvents: React.FC = () => {
  return (
    <div className="p-6 ml-44 bg-gray-100 rounded-lg shadow-lg max-w-4xl mr-5">
      {/* Upcoming Events Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assignment Event */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-[210px] -ml-3">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              <FaCalendarAlt className="inline-block text-[#4d78b8] mr-2" />
              Assignment: Assignment 1
            </h3>
            <p className="text-gray-600 mb-1">
              <FaClock className="inline-block text-gray-500 mr-2" />
              Due Date: 12th Jan 2025
            </p>
            <p className="text-gray-600 mb-1">
              <FaLink className="inline-block text-gray-500 mr-2" />
              Link:{" "}
              <a
                href="https://www.fileuploader.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4d78b8] hover:text-blue-700 underline"
              >
                www.fileuploader.com
              </a>
            </p>
          </div>

          {/* Class Event */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-[210px]">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              <FaCalendarAlt className="inline-block text-[#4d78b8] mr-2" />
              Class: React
            </h3>
            <p className="text-gray-600 mb-1">
              <FaClock className="inline-block text-gray-500 mr-2" />
              Time: 10:00 AM to 12:00 PM
            </p>
            <p className="text-gray-600 mb-1">
              <FaLink className="inline-block text-gray-500 mr-2" />
              Link:{" "}
              <a
                href="https://www.googlemeet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4d78b8] hover:text-blue-700 underline w-[10px]"
              >
                www.googlemeet.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;
