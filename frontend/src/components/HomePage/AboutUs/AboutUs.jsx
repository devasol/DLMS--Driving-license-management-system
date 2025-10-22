import { useState } from "react";
import {
  LicenseIllustration,
  TransportIllustration,
  ServiceIllustration,
} from "./SVGIllustrations";
import styles from "./AboutUs.module.css";
import { useLanguage } from "../../../contexts/LanguageContext";

const AboutUs = () => {
  const [openSections, setOpenSections] = useState({
    section1: false,
    section2: false,
    section3: false,
  });
  const { t } = useLanguage();

  const toggleText = (section) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.aboutus}>{t("aboutUs.title")}</div>

      <div className={styles.component}>
        <div className={styles.content}>
          <div className={styles.header}>{t("aboutUs.title")}</div>
          <div className={styles.text}>
            <p>{t("aboutUs.completeServiceDesc")}</p>
            {openSections.section1 && (
              <div
                className={`${styles.fullText} ${
                  openSections.section1 ? styles.open : ""
                }`}
              >
                <p>{t("aboutUs.completeServiceFullDesc")}</p>
              </div>
            )}
            <span
              className={styles.readMore}
              onClick={() => toggleText("section1")}
            >
              {openSections.section1
                ? t("common.showLess")
                : t("common.readMore")}
            </span>
          </div>
        </div>
        <div className={styles.image}>
          <LicenseIllustration width={450} height={300} />
        </div>
      </div>

      <div className={styles.component}>
        <div className={styles.content}>
          <div className={styles.header}>{t("aboutUs.completeService")}</div>
          <div className={styles.text}>
            <p>{t("aboutUs.completeServiceDesc")}</p>
            {openSections.section2 && (
              <div
                className={`${styles.fullText} ${
                  openSections.section2 ? styles.open : ""
                }`}
              >
                <p>{t("aboutUs.completeServiceFullDesc")}</p>
              </div>
            )}
            <span
              className={styles.readMore}
              onClick={() => toggleText("section2")}
            >
              {openSections.section2
                ? t("common.showLess")
                : t("common.readMore")}
            </span>
          </div>
        </div>
        <div className={styles.image}>
          <TransportIllustration width={450} height={300} />
        </div>
      </div>

      <div className={styles.component}>
        <div className={styles.content}>
          <div className={styles.header}>{t("aboutUs.serviceUsage")}</div>
          <div className={styles.text}>
            <p>{t("aboutUs.serviceUsageDesc")}</p>
            {openSections.section3 && (
              <div
                className={`${styles.fullText} ${
                  openSections.section3 ? styles.open : ""
                }`}
              >
                <p>{t("aboutUs.serviceUsageFullDesc")}</p>
              </div>
            )}
            <span
              className={styles.readMore}
              onClick={() => toggleText("section3")}
            >
              {openSections.section3
                ? t("common.showLess")
                : t("common.readMore")}
            </span>
          </div>
        </div>
        <div className={styles.image}>
          <ServiceIllustration width={450} height={300} />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
