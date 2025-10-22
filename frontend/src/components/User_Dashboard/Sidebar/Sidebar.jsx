import React, { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import {
  Bars3Icon,
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  CogIcon,
} from "@heroicons/react/24/outline"; // Import Heroicons

import logo from "../../../assets/images/logo.png";

const Sidebar = ({ toggleSidebar, isSidebarMinimized }) => {
  const [active, setActive] = useState("Dashboard");

  const handleMenuClick = (name) => {
    setActive(name);
  };

  const menuItems = [
    { name: "Dashboard", icon: <HomeIcon className={styles.icon} /> },
    { name: "Profile", icon: <UserIcon className={styles.icon} /> },
    { name: "Documents", icon: <DocumentTextIcon className={styles.icon} /> },
    { name: "Settings", icon: <CogIcon className={styles.icon} /> },
  ];

  // Remove the automatic reset on resize
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth > 768) {
  //       toggleSidebar(false); // This part was causing the sidebar to reset
  //     }
  //   };

  //   window.addEventListener("resize", handleResize);

  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, [toggleSidebar]);

  // Toggle sidebar when burger icon is clicked
  const handleToggle = () => {
    toggleSidebar(!isSidebarMinimized);
  };

  return (
    <div
      className={`${styles.sidebar} ${isSidebarMinimized ? styles.closed : ""}`}
    >
      <div className={styles.top}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Logo" className={styles.logo} />
        </div>
        <button className={styles.burgerToggle} onClick={handleToggle}>
          <Bars3Icon className={styles.icon} /> {/* Heroicon for burger */}
        </button>
      </div>

      <ul className={styles.menu}>
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={`${styles.menuItem} ${
              active === item.name ? styles.active : ""
            }`}
            onClick={() => handleMenuClick(item.name)}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!isSidebarMinimized && (
              <span className={styles.label}>{item.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
