import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "DLMS Ethiopia";

const titleMap = [
  ["/", "Home"],
  ["/about", "About"],
  ["/aboutus", "About"],
  ["/services", "Services"],
  ["/contact", "Contact"],
  ["/user-manual", "User Manual"],
  ["/news", "News"],
  ["/signin", "Sign In"],
  ["/signup", "Sign Up"],
  ["/forgot-password", "Forgot Password"],
  ["/verify-email", "Verify Email"],
  ["/verify-otp", "Verify OTP"],
  ["/user-dashboard", "User Dashboard"],
  ["/dashboard", "User Dashboard"],
  ["/admin", "Admin"],
  ["/examiner", "Examiner"],
  ["/traffic-police", "Traffic Police"],
  ["/license-info", "License Info"],
  ["/requirements", "License Requirements"],
  ["/categories", "License Categories"],
  ["/fees", "License Fees"],
  ["/license", "License"],
];

function getTitleForPath(pathname) {
  // Pick the longest matching prefix
  let match = titleMap
    .filter(([prefix]) => pathname.startsWith(prefix))
    .sort((a, b) => b[0].length - a[0].length)[0];
  if (match) return `${match[1]} | ${SITE_NAME}`;
  return SITE_NAME;
}

export default function TitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getTitleForPath(pathname);
  }, [pathname]);

  return null;
}

