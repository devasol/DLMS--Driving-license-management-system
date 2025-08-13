import React, { useState } from "react";
import styles from "./FAQ.module.css";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAnswer = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  const faqs = [
    {
      question: "የመንጃ ፈቃድ አስተዳደር ስርዓት ምንድነው?",
      answer:
        "የመንጃ ፈቃድ አስተዳደር ስርዓት የግል መመዝገብ፣ ፈቃድ መስጠትና አጠቃላይ አስተዳደርን ለማስቻል የሚያግዝ ቴክኖሎጂ ነው።",
    },
    {
      question: "የመንጃ ፈቃድ ለመግዛት እንዴት ማመልከት እችላለሁ?",
      answer:
        "እርስዎ በመስመር ላይ ድህረገፅ ወይም በቅርብ የትራንስፖርት ቢሮ በሚገባ የመያዣ ሰነዶች ጋር መግባት በማድረግ መላክ ይችላሉ።",
    },
    {
      question: "የተመረተውን ፈቃድ ሁኔታ እንዴት ማወቅ እችላለሁ?",
      answer:
        "አመልካቹ ከተመዘገቡ በኋላ በመገናኛ መለያዎት ወይም በማመልከቻ ቁጥር የፈቃዱን ሁኔታ ማግኘት ይችላሉ።",
    },
    {
      question: "ለመንጃ ፈቃድ ምን ዓይነት ሰነዶች ያስፈልጋሉ?",
      answer: "የእውነተኛነት፣ የእድሜ፣ የአድራሻ ማረጋገጫና ካስፈለገ የሕክምና የምስክር ወረቀት ይጠየቃሉ።",
    },
    {
      question: "ፈቃዴን በመስመር ላይ ማደስ እችላለሁ?",
      answer: "አዎ፣ የመንጃ ፈቃድዎን በመስመር ላይ በመጠቀም ሳይሄዱ ማደስ ይችላሉ።",
    },
    {
      question: "ፈቃዴን በመስመር ላይ ማደስ እችላለሁ?",
      answer: "አዎ፣ የመንጃ ፈቃድዎን በመስመር ላይ በመጠቀም ሳይሄዱ ማደስ ይችላሉ።",
    },
    {
      question: "ፈቃዴን በመስመር ላይ ማደስ እችላለሁ?",
      answer: "አዎ፣ የመንጃ ፈቃድዎን በመስመር ላይ በመጠቀም ሳይሄዱ ማደስ ይችላሉ።",
    },
  ];

  return (
    <div className={styles.faqContainer}>
      <h2 className={styles.faqTitle}>በተደጋጋሚ የሚጠየቁ ጥያቄዎች</h2>
      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.faqItem}>
            <div
              className={`${styles.faqQuestion} ${
                openIndex === index ? styles.open : ""
              }`}
              onClick={() => toggleAnswer(index)}
            >
              {faq.question}
            </div>
            <div
              className={`${styles.faqAnswer} ${
                openIndex === index ? styles.open : ""
              }`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
