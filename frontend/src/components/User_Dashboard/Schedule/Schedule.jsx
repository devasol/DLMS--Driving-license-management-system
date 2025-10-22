import { FaCalendarAlt } from "react-icons/fa";
import { useState } from "react";
import styles from "./Schedule.module.css";

const schedules = [
  {
    Date: "Monday",
    Task: "Tasking Driving Course",
    Instructor: "Dawit Solomon",
    isCompleted: false,
  },
  {
    Date: "Tuesday",
    Task: "Tasking Driving Course",
    Instructor: "John Doe",
    isCompleted: false,
  },
  {
    Date: "Wednesday",
    Task: "Tasking Driving Course",
    Instructor: "Jane Smith",
    isCompleted: false,
  },
  {
    Date: "Thursday",
    Task: "Tasking Driving Course",
    Instructor: "Emily Davis",
    isCompleted: false,
  },
  {
    Date: "Friday",
    Task: "Tasking Driving Course",
    Instructor: "Michael Lee",
    isCompleted: false,
  },
];

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState(schedules);

  const handleTaskCompletion = (index) => {
    const updatedSchedule = [...scheduleData];
    updatedSchedule[index].isCompleted = !updatedSchedule[index].isCompleted;
    setScheduleData(updatedSchedule);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <FaCalendarAlt size={30} color="#fff" />
        </div>
        <h2>Schedule</h2>
      </div>
      <div className={styles.line}></div>
      <div className={styles.contentContainer}>
        {scheduleData.map((schedule, index) => (
          <div
            key={index}
            className={`${styles.scheduleCard} ${
              schedule.isCompleted ? styles.completed : ""
            }`}
          >
            <p className={styles.scheduleItem}>
              <strong>Date:</strong> {schedule.Date}
            </p>
            <p className={styles.scheduleItem}>
              <strong>Task:</strong> {schedule.Task}
            </p>
            <p className={styles.scheduleItem}>
              <strong>Instructor:</strong> {schedule.Instructor}
            </p>
            <button
              className={`${styles.button} ${
                schedule.isCompleted ? styles.doneButton : ""
              }`}
              onClick={() => handleTaskCompletion(index)}
            >
              {schedule.isCompleted ? "Completed" : "Mark as Done"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
