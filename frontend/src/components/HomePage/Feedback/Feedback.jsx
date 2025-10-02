import React, { useState } from "react";
import { FaSadTear, FaMeh, FaSmile, FaLaughSquint } from "react-icons/fa";
import axios from "axios";
import styles from "./Feedback.module.css";
import AlertBox from "../../AlertBox/AlertBox";
import SuccessAlert from "../../SuccessAlert/SuccessAlert";

const emojiDatas = [
  {
    icon: <FaSadTear />,
    description: "ዝቅተኛ",
    mood: "Low",
    moodClass: styles.sad,
  },
  {
    icon: <FaMeh />,
    description: "መካከለኛ",
    mood: "Medium",
    moodClass: styles.littleSad,
  },
  {
    icon: <FaSmile />,
    description: "ከፍተኛ",
    mood: "High",
    moodClass: styles.happy,
  },
  {
    icon: <FaLaughSquint />,
    description: "በጣም ከፍተኛ",
    mood: "Very High",
    moodClass: styles.veryHappy,
  },
];

const Feedback = () => {
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [writtenFeedback, setWrittenFeedback] = useState("");
  const [showWrittenFeedback, setShowWrittenFeedback] = useState(false);

  const userName =
    localStorage.getItem("userName") || localStorage.getItem("full_name");
  const userId = localStorage.getItem("userId");
  const userEmail =
    localStorage.getItem("userEmail") || localStorage.getItem("user_email");

  const handleEmojiClick = (description) => {
    if (!userName || !userId) {
      setAlertMessage("እባክዎ አስቀድሞ ይግቡ ከመስጠት በፊት።");
      setAlertType("error");
      return;
    }

    // Set the selected rating and show written feedback input
    const selectedEmoji = emojiDatas.find(
      (emoji) => emoji.description === description
    );
    setSelectedRating({
      description,
      mood: selectedEmoji?.mood || "Medium",
    });
    setShowWrittenFeedback(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedRating) {
      setAlertMessage("እባክዎ አስቀድሞ ደረጃ ይምረጡ።");
      setAlertType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting feedback with:", {
        name: userName,
        feedback: selectedRating.description,
        rating: selectedRating.mood,
        writtenFeedback,
        userEmail,
        userId,
      });

      const response = await axios.post("/api/feedbacks", {
        name: userName,
        feedback: selectedRating.description,
        rating: selectedRating.mood,
        writtenFeedback: writtenFeedback.trim() || null,
        userEmail: userEmail || undefined,
        userId,
        category: "service",
      });

      console.log("Feedback response:", response.data);

      if (response.data.success) {
        setShowSuccess(true);
        // Reset form
        setSelectedRating(null);
        setWrittenFeedback("");
        setShowWrittenFeedback(false);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);

      let errorMessage = "አስተያየት መስጠት አልተሳካም። እባክዎን ደግመው ይሞክሩ።";

      if (err.response) {
        console.error("Error response:", err.response.data);
        if (err.response.status === 401) {
          errorMessage = "እባክዎ አስቀድሞ ይግቡ ከመስጠት በፊት።";
        } else {
          errorMessage = err.response.data.message || errorMessage;
        }
      }

      setAlertMessage(errorMessage);
      setAlertType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelFeedback = () => {
    setSelectedRating(null);
    setWrittenFeedback("");
    setShowWrittenFeedback(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleCloseAlert = () => {
    setAlertMessage("");
    setAlertType("");
  };

  return (
    <div className={styles.container}>
      {alertMessage && (
        <AlertBox
          message={alertMessage}
          type={alertType}
          onClose={handleCloseAlert}
          duration={5000}
        />
      )}

      {showSuccess && (
        <SuccessAlert
          message="አስተያየትዎ በተሳክቷል ተልኳል። እናመሰግናለን!"
          onClose={handleCloseSuccess}
          duration={5000}
        />
      )}

      <div className={styles.titles}>
        <h4>እባክዎን አስተያየትዎን ይስጡን</h4>
        <h5>በተቋሙ ያገኙት አገልግሎት ምን ይመስል ነበር?</h5>
      </div>

      <div className={styles.emojiList}>
        {emojiDatas.map(({ icon, description, moodClass }, index) => (
          <div
            key={index}
            className={`${styles.emojiContainer} ${moodClass} ${
              selectedRating?.description === description ? styles.selected : ""
            }`}
            onClick={() =>
              !isSubmitting &&
              !showWrittenFeedback &&
              handleEmojiClick(description)
            }
            style={{
              opacity: isSubmitting || showWrittenFeedback ? 0.7 : 1,
              cursor:
                isSubmitting || showWrittenFeedback ? "not-allowed" : "pointer",
              border:
                selectedRating?.description === description
                  ? "3px solid #007bff"
                  : "none",
            }}
          >
            <div className={styles.emoji}>{icon}</div>
            <div className={styles.description}>{description}</div>
          </div>
        ))}
      </div>

      {/* Written Feedback Section */}
      {showWrittenFeedback && (
        <div className={styles.writtenFeedbackSection}>
          <div className={styles.feedbackForm}>
            <h4>ተጨማሪ አስተያየት ይስጡ (አማራጭ)</h4>
            <p>
              የተመረጠ ደረጃ: <strong>{selectedRating?.description}</strong>
            </p>

            <textarea
              className={styles.feedbackTextarea}
              placeholder="እዚህ ተጨማሪ አስተያየትዎን ይጻፉ... (አማራጭ)"
              value={writtenFeedback}
              onChange={(e) => setWrittenFeedback(e.target.value)}
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />

            <div className={styles.characterCount}>
              {writtenFeedback.length}/500 ቁምፊዎች
            </div>

            <div className={styles.buttonGroup}>
              <button
                className={styles.cancelButton}
                onClick={handleCancelFeedback}
                disabled={isSubmitting}
              >
                ሰርዝ
              </button>
              <button
                className={styles.submitButton}
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
              >
                {isSubmitting ? "እየተላክ..." : "አስተያየት ላክ"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.foot}>
        <h1>ከ3ሺህ በላይ ተጠቃሚዎች አስተያየታቸውን ሰጥተዋል::</h1>
        <h5>የእርሶ አስተያየት እራሳችንን እንድንፈትሽ ይረዳናል፡፡</h5>
      </div>
    </div>
  );
};

export default Feedback;
