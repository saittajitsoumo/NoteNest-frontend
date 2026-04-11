import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Background elements are handled by index.css body styles for consistency */}
      <Navbar />
      
      <AnimatePresence mode="wait">
        <motion.main
          className="flex-grow w-full relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12">
            {children}
          </div>
        </motion.main>
      </AnimatePresence>
      
      <Footer />
    </div>
  );
}
