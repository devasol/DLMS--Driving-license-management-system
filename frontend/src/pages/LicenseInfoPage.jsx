import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  CheckCircle,
  Info,
  AttachMoney,
  Description,
  School,
  DirectionsCar,
  Security,
  Phone,
  Email,
  LocationOn,
} from "@mui/icons-material";
import Header from "../components/HomePage/Header/Header";

const LicenseInfoPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const getPageContent = () => {
    switch (type) {
      case "requirements":
        return {
          title: "License Requirements",
          titleAm: "የፈቃድ መስፈርቶች",
          content: [
            {
              title: "Age Requirements",
              titleAm: "የእድሜ መስፈርቶች",
              items: [
                "Minimum age 18 years for Category B license",
                "Minimum age 21 years for Category C license",
                "Minimum age 24 years for Category D license",
              ],
              itemsAm: [
                "ለB ምድብ ፈቃድ ዝቅተኛ እድሜ 18 ዓመት",
                "ለC ምድብ ፈቃድ ዝቅተኛ እድሜ 21 ዓመት",
                "ለD ምድብ ፈቃድ ዝቅተኛ እድሜ 24 ዓመት",
              ],
            },
            {
              title: "Required Documents",
              titleAm: "የሚያስፈልጉ ሰነዶች",
              items: [
                "Valid Ethiopian ID card or passport",
                "Medical certificate from approved clinic",
                "Proof of address (utility bill or bank statement)",
                "Passport-size photographs (4 copies)",
                "Birth certificate",
              ],
              itemsAm: [
                "ትክክለኛ የኢትዮጵያ መታወቂያ ካርድ ወይም ፓስፖርት",
                "ከተፈቀደ ክሊኒክ የሕክምና ምስክር ወረቀት",
                "የአድራሻ ማረጋገጫ (የመገልገያ ሂሳብ ወይም የባንክ መግለጫ)",
                "የፓስፖርት መጠን ፎቶግራፎች (4 ቅጂዎች)",
                "የልደት ምስክር ወረቀት",
              ],
            },
          ],
        };

      case "categories":
        return {
          title: "License Categories",
          titleAm: "የፈቃድ ምድቦች",
          content: [
            {
              title: "Category A - Motorcycles",
              titleAm: "ምድብ A - ሞተር ሳይክሎች",
              items: [
                "Motorcycles with engine capacity up to 125cc",
                "Three-wheeled vehicles up to 15kW",
                "Minimum age: 16 years",
              ],
            },
            {
              title: "Category B - Light Vehicles",
              titleAm: "ምድብ B - ቀላል ተሽከርካሪዎች",
              items: [
                "Passenger cars up to 8 seats",
                "Light trucks up to 3.5 tons",
                "Minimum age: 18 years",
              ],
            },
            {
              title: "Category C - Heavy Vehicles",
              titleAm: "ምድብ C - ከባድ ተሽከርካሪዎች",
              items: [
                "Trucks over 3.5 tons",
                "Commercial vehicles",
                "Minimum age: 21 years",
              ],
            },
          ],
        };

      case "fees":
        return {
          title: "Fees & Payments",
          titleAm: "ክፍያዎች እና ክፍያ",
          content: [
            {
              title: "Application Fees",
              titleAm: "የማመልከቻ ክፍያዎች",
              items: [
                "Category A License: 500 ETB",
                "Category B License: 800 ETB",
                "Category C License: 1,200 ETB",
                "Theory Exam: 100 ETB",
                "Practical Exam: 200 ETB",
              ],
            },
            {
              title: "Payment Methods",
              titleAm: "የክፍያ ዘዴዎች",
              items: [
                "Bank transfer",
                "Mobile money (M-Birr, HelloCash)",
                "Cash payment at authorized centers",
                "Online payment (Credit/Debit cards)",
              ],
            },
          ],
        };

      default:
        return {
          title: "License Information",
          titleAm: "የፈቃድ መረጃ",
          content: [
            {
              title: "General Information",
              titleAm: "አጠቃላይ መረጃ",
              items: [
                "Ethiopian Driving License Management System",
                "Digital license application and management",
                "Online exam scheduling and results",
                "Real-time application tracking",
              ],
            },
          ],
        };
    }
  };

  const pageData = getPageContent();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
        {/* Page Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {pageData.title}
          </Typography>
          {pageData.titleAm && (
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {pageData.titleAm}
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Complete information about Ethiopian driving license requirements, categories, and procedures.
          </Typography>
        </Box>

        {/* Content Sections */}
        <Grid container spacing={4}>
          {pageData.content.map((section, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: "100%",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CheckCircle sx={{ color: "primary.main", mr: 1 }} />
                    <Typography variant="h6" component="h3" fontWeight="bold">
                      {section.title}
                    </Typography>
                  </Box>
                  {section.titleAm && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: "italic" }}>
                      {section.titleAm}
                    </Typography>
                  )}
                  <List dense>
                    {section.items.map((item, itemIndex) => (
                      <ListItem key={itemIndex} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          secondary={section.itemsAm?.[itemIndex]}
                          primaryTypographyProps={{ fontSize: "0.9rem" }}
                          secondaryTypographyProps={{ fontSize: "0.8rem", fontStyle: "italic" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Contact Information */}
        <Paper sx={{ mt: 6, p: 4, bgcolor: "primary.main", color: "white" }}>
          <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
            Need More Information?
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ textAlign: "center", opacity: 0.9 }}>
            ተጨማሪ መረጃ ይፈልጋሉ?
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
              <Phone sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body1">Emergency: 911</Typography>
              <Typography variant="body2">Support: +251-11-XXX-XXXX</Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
              <Email sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body1">info@transport.gov.et</Typography>
              <Typography variant="body2">Official Ministry Email</Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
              <LocationOn sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body1">Addis Ababa, Ethiopia</Typography>
              <Typography variant="body2">Ministry of Transport</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/signin")}
            sx={{
              mr: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              },
            }}
          >
            Apply for License
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/")}
            sx={{ borderColor: "primary.main", color: "primary.main" }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LicenseInfoPage;
