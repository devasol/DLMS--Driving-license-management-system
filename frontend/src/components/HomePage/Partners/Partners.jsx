import React from "react";
import styles from "./Partners.module.css";
import partner1 from "../../../assets/images/partners/partner-1.png";
import partner2 from "../../../assets/images/partners/partner-2.png";
import partner3 from "../../../assets/images/partners/partner-3.png";
import partner4 from "../../../assets/images/partners/partner-4.png";

const Partners = () => {
  return (
    <div className={styles.partnersContainer}>
      <h2 className={styles.title}>Our Trusted Partners</h2>
      <div className={styles.partnerLogos}>
        <img src={partner1} alt="Partner 1" className={styles.partnerLogo} />
        <img src={partner2} alt="Partner 2" className={styles.partnerLogo} />
        <img src={partner3} alt="Partner 3" className={styles.partnerLogo} />
        <img src={partner4} alt="Partner 4" className={styles.partnerLogo} />
      </div>
    </div>
  );
};

export default Partners;
