import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Support as SupportIcon,
  ExpandMore,
  Search,
  ContactSupport,
  Help,
  QuestionAnswer,
  Send,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
  Refresh,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const Support = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    message: "",
  });
  const [tickets, setTickets] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);

  // FAQ data
  const faqData = [
    {
      category: "License Application",
      questions: [
        {
          question: "How do I apply for a driving license?",
          answer:
            "To apply for a driving license, go to the 'License Services' section in your dashboard and click 'Apply for New License'. Fill out the required information, upload necessary documents, and submit your application.",
        },
        {
          question: "What documents do I need for license application?",
          answer:
            "You need: 1) Valid ID card or passport, 2) Proof of residence, 3) Medical certificate, 4) Passport-sized photos, 5) Application fee payment receipt.",
        },
        {
          question: "How long does the application process take?",
          answer:
            "The typical processing time is 7-14 business days after all required documents are submitted and verified.",
        },
      ],
    },
    {
      category: "Exams",
      questions: [
        {
          question: "How do I schedule a driving exam?",
          answer:
            "You can schedule your exam through the 'Schedule Exam' option in your dashboard. Choose your preferred date, time, and location from available slots.",
        },
        {
          question: "What should I bring to the exam?",
          answer:
            "Bring your application receipt, valid ID, and any required documents mentioned in your exam confirmation email.",
        },
        {
          question: "Can I reschedule my exam?",
          answer:
            "Yes, you can reschedule your exam up to 24 hours before the scheduled time through your dashboard.",
        },
      ],
    },
    {
      category: "Payments",
      questions: [
        {
          question: "What payment methods are accepted?",
          answer:
            "We accept credit cards, debit cards, bank transfers, and mobile money payments.",
        },
        {
          question: "How do I get a payment receipt?",
          answer:
            "Payment receipts are automatically generated and sent to your email. You can also download them from your dashboard.",
        },
      ],
    },
    {
      category: "Technical Issues",
      questions: [
        {
          question: "I'm having trouble logging in",
          answer:
            "Try resetting your password using the 'Forgot Password' link. If the issue persists, clear your browser cache or try a different browser.",
        },
        {
          question: "The website is loading slowly",
          answer:
            "This might be due to high traffic or your internet connection. Try refreshing the page or accessing the site during off-peak hours.",
        },
      ],
    },
  ];

  // Contact information
  const contactInfo = {
    phone: "+251-11-123-4567",
    email: "support@dlms.gov.et",
    address: "Ministry of Transport, Addis Ababa, Ethiopia",
    hours: "Monday - Friday: 8:00 AM - 5:00 PM",
  };

  useEffect(() => {
    loadSupportTickets();
  }, []);

  const loadSupportTickets = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch(
        `http://localhost:5004/api/support/tickets/user/${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      } else {
        console.error("Failed to load support tickets");
      }
    } catch (error) {
      console.error("Error loading support tickets:", error);
      // Fallback to localStorage for offline functionality
      const savedTickets = localStorage.getItem(`dlms-tickets-${userId}`);
      if (savedTickets) {
        setTickets(JSON.parse(savedTickets));
      }
    }
  };

  const filteredFAQ = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  const handleSubmitTicket = async () => {
    if (!contactForm.subject || !contactForm.message) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        "http://localhost:5004/api/support/tickets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            subject: contactForm.subject,
            category: contactForm.category,
            priority: contactForm.priority,
            message: contactForm.message,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Reload tickets to get the updated list
        await loadSupportTickets();

        setContactForm({
          subject: "",
          category: "general",
          priority: "medium",
          message: "",
        });
        setTicketDialogOpen(false);

        setSnackbar({
          open: true,
          message:
            "Support ticket submitted successfully! We'll get back to you soon.",
          severity: "success",
        });
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message:
            errorData.message || "Failed to submit ticket. Please try again.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setSnackbar({
        open: true,
        message: "Failed to submit ticket. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <Pending color="warning" />;
      case "resolved":
        return <CheckCircle color="success" />;
      case "closed":
        return <CheckCircle color="disabled" />;
      default:
        return <ErrorIcon color="error" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "warning";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      default:
        return "error";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 3, fontWeight: "bold" }}
        >
          <SupportIcon sx={{ mr: 2, verticalAlign: "middle" }} />
          Support Center
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="FAQ" icon={<Help />} />
          <Tab label="Contact Support" icon={<ContactSupport />} />
          <Tab label="My Tickets" icon={<QuestionAnswer />} />
        </Tabs>

        {/* FAQ Tab */}
        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <TextField
                  fullWidth
                  placeholder="Search frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </CardContent>
            </Card>

            {filteredFAQ.map((category, categoryIndex) => (
              <Card
                key={category.category}
                sx={{ mb: 2, borderRadius: 3, boxShadow: 2 }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {category.category}
                  </Typography>
                  {category.questions.map((faq, index) => (
                    <Accordion
                      key={index}
                      sx={{ mb: 1, "&:before": { display: "none" } }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "medium" }}
                        >
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography color="text.secondary">
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Contact Support Tab */}
        {activeTab === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      Submit a Support Request
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={() => setTicketDialogOpen(true)}
                      sx={{
                        background:
                          "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)",
                        },
                      }}
                    >
                      Create Support Ticket
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      Contact Information
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Phone color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={contactInfo.phone} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Email color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={contactInfo.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={contactInfo.address} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AccessTime color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={contactInfo.hours} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 2 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                My Support Tickets
              </Typography>
              <IconButton onClick={loadSupportTickets}>
                <Refresh />
              </IconButton>
            </Box>

            {tickets.length === 0 ? (
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <QuestionAnswer
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No support tickets yet
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Create your first support ticket to get help
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setTicketDialogOpen(true)}
                    sx={{
                      background:
                        "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                    }}
                  >
                    Create Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {tickets.map((ticket) => (
                  <Grid item xs={12} key={ticket.id}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold" }}
                            >
                              {ticket.subject}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Created:{" "}
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                            }}
                          >
                            <Chip
                              label={ticket.priority}
                              color={getPriorityColor(ticket.priority)}
                              size="small"
                            />
                            <Chip
                              icon={getStatusIcon(ticket.status)}
                              label={ticket.status}
                              color={getStatusColor(ticket.status)}
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Category: {ticket.category}
                        </Typography>
                        <Typography variant="body2">
                          {ticket.message.length > 150
                            ? `${ticket.message.substring(0, 150)}...`
                            : ticket.message}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Create Ticket Dialog */}
      <Dialog
        open={ticketDialogOpen}
        onClose={() => setTicketDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Subject *"
              value={contactForm.subject}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, subject: e.target.value }))
              }
              margin="normal"
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={contactForm.category}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  SelectProps={{ native: true }}
                >
                  <option value="general">General</option>
                  <option value="technical">Technical Issue</option>
                  <option value="application">License Application</option>
                  <option value="exam">Exam Related</option>
                  <option value="payment">Payment Issue</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  value={contactForm.priority}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  SelectProps={{ native: true }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </TextField>
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Message *"
              multiline
              rows={4}
              value={contactForm.message}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, message: e.target.value }))
              }
              margin="normal"
              placeholder="Please describe your issue in detail..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitTicket}
            variant="contained"
            disabled={isLoading}
          >
            Submit Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Support;
