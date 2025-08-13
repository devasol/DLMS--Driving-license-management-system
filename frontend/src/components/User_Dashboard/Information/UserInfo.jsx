import React from "react";
import styles from "./UserInfo.module.css";
import {
  FaUser,
  FaRegEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBriefcase,
  FaBirthdayCake,
} from "react-icons/fa";
import Schedule from "../Schedule/Schedule";

const UserInfo = () => {
  return (
    <div className={styles.container}>
      <div className={styles.firstContainer}>
        <div className={styles.profile}>
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="User"
            className={styles.avatar}
          />
          <div className={styles.details}>
            <h2>John Doe</h2>
            <p className={styles.role}>Software Engineer</p>
          </div>
        </div>
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <FaUser className={styles.icon} />
            <p>Username: john_doe</p>
          </div>
          <div className={styles.infoItem}>
            <FaRegEnvelope className={styles.icon} />
            <p>Email: john.doe@example.com</p>
          </div>
          <div className={styles.infoItem}>
            <FaPhoneAlt className={styles.icon} />
            <p>Phone: +1 234 567 890</p>
          </div>
          <div className={styles.infoItem}>
            <FaMapMarkerAlt className={styles.icon} />
            <p>Location: New York, USA</p>
          </div>
          <div className={styles.infoItem}>
            <FaBriefcase className={styles.icon} />
            <p>Occupation: Software Engineer</p>
          </div>
          <div className={styles.infoItem}>
            <FaBirthdayCake className={styles.icon} />
            <p>Birthday: January 1, 1990</p>
          </div>
        </div>
        <button className={styles.amazingButton}>Update Information</button>
      </div>
      <div className={styles.secondContainer}>
        <Schedule />
      </div>
    </div>
  );
};

export default UserInfo;
