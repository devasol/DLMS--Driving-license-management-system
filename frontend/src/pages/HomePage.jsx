import React from "react";
import TailwindTest from "../components/TailwindTest";

import AboutUs from "../components/HomePage/AboutUs/AboutUs";
import BackToFirst from "../components/HomePage/BackToFirst/BackToFirst";
import Counter from "../components/HomePage/Counter/Counter";
import FAQ from "../components/HomePage/FAQ/FAQ";
import Feedback from "../components/HomePage/Feedback/Feedback";
import Footer from "../components/HomePage/Footer/Footer";
import Header from "../components/HomePage/Header/Header";
import HomeMain from "../components/HomePage/HomeMain/HomeMain";
import News from "../components/HomePage/News/News";
import Partners from "../components/HomePage/Partners/Partners";

import Services from "../components/HomePage/Services/Services";
import Testimonial from "../components/HomePage/Testimonial/Testimonial";
import "./HomePage.css";
import { motion } from "framer-motion";
import { optimizedPageVariants } from "../utils/performanceOptimizations";

const HomePage = () => {
  return (
    <motion.div
      className="homepage-container"
      variants={optimizedPageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Header />
      <BackToFirst />
      <HomeMain />
      <Services />
      <Counter />
      <News />
      <AboutUs />
      <FAQ />
      <Testimonial />
      <Partners />
      <Feedback />
      <Footer />
      {/* <TailwindTest /> */}
    </motion.div>
  );
};

export default HomePage;
