import React from "react";
import styles from "./OptionLog.module.css";
import {
  FaRegHandshake,
  FaRegLightbulb,
  FaRegStar,
  FaUserCog,
} from "react-icons/fa"; // Adding more icons

const OptionLog = () => {
  return (
    <div className={styles.container}>
      {/* Dashboard Header */}
      <h2 className={styles.dashboardHeader}>Dashboard</h2>

      <div className={styles.boxContainer}>
        <div className={styles.box}>
          <FaRegHandshake className={styles.icon} />
          <h1>Collaboration</h1>
          <p>Work together to achieve greater results.</p>
        </div>
        <div className={styles.box}>
          <FaRegLightbulb className={styles.icon} />
          <h1>Innovation</h1>
          <p>Creativity is key to solving problems.</p>
        </div>
        <div className={styles.box}>
          <FaRegStar className={styles.icon} />
          <h1>Excellence</h1>
          <p>Striving for excellence in every task.</p>
        </div>
        <div className={styles.box}>
          <FaUserCog className={styles.icon} />
          <h1>Growth</h1>
          <p>Continuous learning and development.</p>
        </div>
      </div>
    </div>
  );
};

export default OptionLog;
