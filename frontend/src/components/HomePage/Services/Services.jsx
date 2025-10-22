import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faEye,
  faCalendarAlt,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FaCar, FaRedo } from "react-icons/fa";
import { useLanguage } from "../../../contexts/LanguageContext";

import styles from "./Services.module.css";

const Services = () => {
  const cardRefs = useRef([]);
  const [visibleCards, setVisibleCards] = useState(new Array(6).fill(false));
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cardRefs.current.indexOf(entry.target);
          if (entry.isIntersecting && !visibleCards[index]) {
            setVisibleCards((prev) => {
              const updated = [...prev];
              updated[index] = true;
              return updated;
            });
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      cardRefs.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, [visibleCards]);

  const services = [
    {
      icon: <FontAwesomeIcon style={{ fontSize: "40px" }} icon={faIdCard} />,
      title: t("services.licenseApplication"),
      text: t("services.licenseApplicationDesc"),
      buttonText: t("services.licenseApplicationBtn"),
      route: "/apply",
    },
    {
      icon: <FaCar style={{ fontSize: "40px" }} />,
      title: t("services.roadTest"),
      text: t("services.roadTestDesc"),
      buttonText: t("services.roadTestBtn"),
      route: "/exam",
    },
    {
      icon: <FaRedo style={{ fontSize: "30px" }} />,
      title: t("services.licenseRenewal"),
      text: t("services.licenseRenewalDesc"),
      buttonText: t("services.licenseRenewalBtn"),
      route: "/renewal",
    },
    // {
    //   icon: (
    //     <FontAwesomeIcon style={{ fontSize: "40px" }} icon={faClipboardCheck} />
    //   ),
    //   title: "መረጃ ማስተካከል",
    //   text: "ስለራስዎ እና ስለእባብ መረጃዎች እንደ እባብ ማስተካከል። የፈቃድ መረጃዎችን ይህ ስርና በቀላሉ አዘጋጅተው ይሁኑ።",
    //   buttonText: "ማስተካከል",
    // },
    // {
    //   icon: <FontAwesomeIcon style={{ fontSize: "40px" }} icon={faEye} />,
    //   title: "ሁኔታን እንደ እባብ ማሳየት",
    //   text: "የፈቃድ ማስመረጃ፣ መዘምን፣ ወይም ሙከራ ሁኔታውን በቀላሉ ይማሩ።",
    //   buttonText: "ሁኔታን ተመልከቱ",
    // },
    // {
    //   icon: (
    //     <FontAwesomeIcon style={{ fontSize: "40px" }} icon={faCalendarAlt} />
    //   ),
    //   title: "ሙከራ ሰሌዳ ማስተካከል",
    //   text: "ሙከራውን በምትሰምታት ይደርሳበት። ቀንና ሰአትን ይምረጡ እና መንገድን ቀላል ይሁኑ።",
    //   buttonText: "ሰሌዳ አድርጉ",
    // },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.main_title}>
        <h1>{t("services.title")}</h1>
      </div>

      <div className={styles.servicesGrid}>
        {services.map((service, index) => (
          <div
            ref={(el) => (cardRefs.current[index] = el)}
            key={index}
            className={`${styles.component} ${
              visibleCards[index] ? styles.visible : ""
            }`}
          >
            <div className={styles.icon}>{service.icon}</div>
            <div className={styles.title}>{service.title}</div>
            <div className={styles.text}>{service.text}</div>
            <div className={styles.button}>
              <button onClick={() => navigate(service.route)}>
                {service.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.moreButtonContainer}>
        <button
          className={styles.moreButton}
          onClick={() => navigate("/services")}
        >
          {t("services.more")}
        </button>
      </div>
    </div>
  );
};

export default Services;
