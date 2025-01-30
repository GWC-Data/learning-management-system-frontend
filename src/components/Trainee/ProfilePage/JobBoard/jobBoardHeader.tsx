import { motion } from "framer-motion";

const JobBoardHeader = () => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-gradient-to-r from-[#4e6db4] to-[#2a4d79] text-white py-10 px-8 text-center rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 w-[1300px]"
    >
      <motion.h1 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-5xl font-extrabold leading-tight tracking-tight"
      >
        Welcome to the Job Board
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-lg mt-3 text-[#8ce1bc] font-medium"
      >
        Explore new career opportunities and apply today!
      </motion.p>
    </motion.header>
  );
};

export default JobBoardHeader;
