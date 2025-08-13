import "./Footer.css";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <>
      <footer className="footer">
        <div className="footer__addr">
          <h1 className="footer__logo">DLMS Ethiopia</h1>

          <h2>{t("footer.contact")}</h2>

          <address>
            {t("footer.address")}
            <br />
            P.O. Box 1238, Addis Ababa
            <br />
            📞 Emergency: 911 | Support: +251-11-XXX-XXXX
            <br />
            <a className="footer__btn" href="mailto:info@transport.gov.et">
              {t("footer.emailUs")}
            </a>
          </address>
        </div>

        <ul className="footer__nav">
          <li className="nav__item">
            <h2 className="nav__title">{t("footer.services")}</h2>

            <ul className="nav__ul">
              <li>
                <Link to="/apply">{t("footer.licenseApplication")}</Link>
              </li>

              <li>
                <Link to="/exam">{t("footer.drivingExams")}</Link>
              </li>

              <li>
                <Link to="/renewal">{t("footer.licenseRenewal")}</Link>
              </li>

              <li>
                <Link to="/verify/ETH-2025-000001">
                  {t("footer.licenseVerification")}
                </Link>
              </li>

              <li>
                <Link to="/violations">
                  {t("footer.trafficViolations") || "Traffic Violations"}
                </Link>
              </li>

              <li>
                <Link to="/status">
                  {t("footer.applicationStatus") || "Application Status"}
                </Link>
              </li>
            </ul>
          </li>

          <li className="nav__item nav__item--extra">
            <h2 className="nav__title">{t("footer.information")}</h2>

            <ul className="nav__ul nav__ul--extra">
              <li>
                <Link to="/license-info/requirements">
                  {t("footer.requirements")}
                </Link>
              </li>

              <li>
                <Link to="/license-info/categories">
                  {t("footer.categories")}
                </Link>
              </li>

              <li>
                <Link to="/license-info/fees">{t("footer.fees")}</Link>
              </li>

              <li>
                <Link to="/user-manual">{t("footer.documents")}</Link>
              </li>

              <li>
                <Link to="/about">{t("footer.faq")}</Link>
              </li>

              <li>
                <Link to="/contact">{t("footer.helpCenter")}</Link>
              </li>
            </ul>
          </li>

          <li className="nav__item">
            <h2 className="nav__title">{t("footer.legal")}</h2>

            <ul className="nav__ul">
              <li>
                <Link to="/about">{t("footer.privacyPolicy")}</Link>
              </li>

              <li>
                <Link to="/about">{t("footer.termsOfService")}</Link>
              </li>

              <li>
                <Link to="/services">{t("footer.trafficRegulations")}</Link>
              </li>

              <li>
                <Link to="/contact">{t("footer.contactSupport")}</Link>
              </li>
            </ul>
          </li>
        </ul>

        <div className="legal">
          <p>&copy; 2025 {t("footer.copyright")}. All rights reserved.</p>

          <div className="legal__links">
            <span>
              🇪🇹 Driving License Management System | Developed By Dawit S.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
