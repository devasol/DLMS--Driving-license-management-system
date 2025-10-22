import React, { useState, useEffect, useRef } from "react";
import styles from "./Counter.module.css";

const Counter = () => {
  const [employees, setEmployees] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [workingHours, setWorkingHours] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    const increment = (target, setter, step) => {
      const interval = setInterval(() => {
        setter((prev) => {
          if (prev >= target) {
            clearInterval(interval);
            return target;
          }
          return prev + step;
        });
      }, 20); // Faster counting with 20ms interval
    };

    const handleScrollIntoView = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Start counting when the component is in the viewport
          increment(300, setEmployees, 5);
          increment(500, setCustomers, 10);
          increment(100 * 12, setWorkingHours, 10); // Target: 100*12 hours
        }
      });
    };

    const observer = new IntersectionObserver(handleScrollIntoView, {
      threshold: 0.5,
    });

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  return (
    <div ref={counterRef} className={styles.counterContainer}>
      <div className={styles.counterCard}>
        <h3>Employees</h3>
        <p className={styles.count}>+{employees}</p>
      </div>
      <div className={styles.counterCard}>
        <h3>Users Today</h3>
        <p className={styles.count}>+{customers}</p>
      </div>
      <div className={styles.counterCard}>
        <h3>Working Hours This Week</h3>
        <p className={styles.count}>{workingHours}</p>
      </div>
    </div>
  );
};

export default Counter;
