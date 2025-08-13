import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  FormHelperText,
  Alert,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Publish,
  EditNote,
  TrendingUp,
  Category,
  Schedule,
  Image,
  Close
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'general',
    priority: 'medium',
    tags: '',
    publishDate: '',
    expiryDate: '',
    isSticky: false,
    allowComments: true,
    notifyUsers: false,
    targetAudience: 'all',
    status: 'published'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'policy', label: 'Policy Update' },
    { value: 'exam', label: 'Exam News' },
    { value: 'license', label: 'License Update' },
    { value: 'traffic', label: 'Traffic News' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' },
    { value: 'urgent', label: 'Urgent', color: '#9c27b0' }
  ];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      if (!token) {
        setError('No authentication token found. Please log in as admin.');
        return;
      }

      const response = await axios.get('http://localhost:5004/api/news/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNews(response.data.news);
      } else {
        setError('Failed to fetch news: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching news:', error);

      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in as admin again.');
        localStorage.removeItem('token'); // Clear invalid token
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError('Failed to fetch news: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add file if selected
      if (selectedFile) {
        formDataToSend.append('featuredImage', selectedFile);
      }
      
      const url = editingNews 
        ? `http://localhost:5004/api/news/admin/${editingNews._id}`
        : 'http://localhost:5004/api/news/admin/create';
      
      const method = editingNews ? 'put' : 'post';
      
      const response = await axios[method](url, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        const successMessage = editingNews
          ? '🎉 Congratulations! News article updated successfully!'
          : '🎉 Congratulations! News article created successfully!';
        setSuccess(successMessage);
        setOpenDialog(false);
        resetForm();
        fetchNews();
      }
    } catch (error) {
      console.error('Error saving news:', error);
      setError(error.response?.data?.message || 'Failed to save news');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      summary: newsItem.summary,
      category: newsItem.category,
      priority: newsItem.priority,
      tags: newsItem.tags?.join(', ') || '',
      publishDate: newsItem.publishDate ? new Date(newsItem.publishDate).toISOString().slice(0, 16) : '',
      expiryDate: newsItem.expiryDate ? new Date(newsItem.expiryDate).toISOString().slice(0, 16) : '',
      isSticky: newsItem.isSticky,
      allowComments: newsItem.allowComments,
      notifyUsers: newsItem.notifyUsers,
      targetAudience: newsItem.targetAudience,
      status: newsItem.status
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5004/api/news/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('🗑️ News article deleted successfully!');
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      setError('Failed to delete news');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      summary: '',
      category: 'general',
      priority: 'medium',
      tags: '',
      publishDate: '',
      expiryDate: '',
      isSticky: false,
      allowComments: true,
      notifyUsers: false,
      targetAudience: 'all',
      status: 'published'
    });
    setSelectedFile(null);
    setEditingNews(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || '#666';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUp sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                📰 News Management
              </Typography>
              <Typography variant="subtitle1">
                Create and manage news articles for users
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                💡 Tip: Set status to "Published" for articles to appear in user news feed
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Create News
          </Button>
        </Box>
      </Paper>



      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* News Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Priority</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Views</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item._id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.summary?.substring(0, 100)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={item.category} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={item.priority.toUpperCase()} 
                    size="small"
                    sx={{ 
                      backgroundColor: getPriorityColor(item.priority),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={item.status.toUpperCase()} 
                    color={getStatusColor(item.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                    {item.views || 0}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {formatDate(item.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(item)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {news.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, mt: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            📰 No news articles yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first news article to get started!
          </Typography>
        </Paper>
      )}

      {/* Create/Edit News Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              {editingNews ? 'Edit News Article' : 'Create News Article'}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>

            {/* Summary */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Summary"
                multiline
                rows={2}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                helperText="Brief description shown in news feed"
                required
              />
            </Grid>

            {/* Content */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                multiline
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </Grid>

            {/* Category and Priority */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: priority.color
                          }}
                        />
                        {priority.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                helperText="Separate tags with commas"
              />
            </Grid>

            {/* Dates */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Publish Date"
                type="datetime-local"
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for immediate publish"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="datetime-local"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for no expiry"
              />
            </Grid>

            {/* Status and Target Audience */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="draft">📝 Draft (Not visible to users)</MenuItem>
                  <MenuItem value="published">✅ Published (Visible in news feed)</MenuItem>
                  <MenuItem value="archived">📦 Archived (Hidden from users)</MenuItem>
                </Select>
                <FormHelperText>
                  Only "Published" articles appear in the user news feed
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={formData.targetAudience}
                  label="Target Audience"
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="applicants">Applicants</MenuItem>
                  <MenuItem value="license_holders">License Holders</MenuItem>
                  <MenuItem value="expired_licenses">Expired Licenses</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Featured Image */}
            <Grid item xs={12}>
              <Box sx={{ border: '2px dashed #ddd', borderRadius: 2, p: 3, textAlign: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="featured-image-upload"
                />
                <label htmlFor="featured-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Image />}
                    sx={{ mb: 1 }}
                  >
                    Upload Featured Image
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: {selectedFile.name}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Options */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isSticky}
                      onChange={(e) => setFormData({ ...formData, isSticky: e.target.checked })}
                    />
                  }
                  label="Sticky (Pin to top)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.allowComments}
                      onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
                    />
                  }
                  label="Allow Comments"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifyUsers}
                      onChange={(e) => setFormData({ ...formData, notifyUsers: e.target.checked })}
                    />
                  }
                  label="Notify Users"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !formData.title || !formData.content || !formData.summary}
            startIcon={submitting ? <CircularProgress size={20} /> : <Publish />}
          >
            {submitting ? 'Saving...' : (editingNews ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewsManagement;
