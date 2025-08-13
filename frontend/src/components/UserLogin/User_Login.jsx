import { useNavigate } from "react-router-dom";
import styles from "./User_Login.module.css";
import { FaIdCard, FaSyncAlt } from "react-icons/fa";

const User_Login = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <FaIdCard size={50} className={styles.icon} />
        <h2 className={styles.heading}>New License Registration</h2>
        <p className={styles.description}>
          To apply for a new license, please select this option.
        </p>
        <button
          className={styles.btn}
          onClick={() => navigate("user-dashboard")}
        >
          Go To New License Registration
        </button>
      </div>

      <div className={`${styles.card} ${styles.blueBackground}`}>
        <FaSyncAlt size={50} className={styles.iconWhite} />
        <h2 className={styles.headingWhite}>License Renewal</h2>
        <p className={styles.descriptionWhite}>
          To renew your license, please select this option.
        </p>
        <button
          className={styles.btnWhite}
          onClick={() => navigate("user-dashboard")}
        >
          Go To License Renewal
        </button>
      </div>
    </div>
  );
};

export default User_Login;
