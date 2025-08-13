import Footer from "../components/HomePage/Footer/Footer";
import Header from "../components/HomePage/Header/Header";
import Services from "../components/Services/Services";
import { motion } from "framer-motion";
import { optimizedPageVariants } from "../utils/performanceOptimizations";

const ServicesPage = () => {
  return (
    <motion.div
      variants={optimizedPageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Header />
      <Services />
      <Footer />
    </motion.div>
  );
};

export default ServicesPage;
