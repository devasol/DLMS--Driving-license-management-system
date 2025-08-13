import express from 'express';
import examRoutes from './routes/examRoutes.js';

const app = express();
app.use(express.json());

// Mount the exam routes
app.use('/api/exams', examRoutes);

// Test the routes
const testRoutes = () => {
  console.log('🧪 Testing exam routes...');
  
  // Get all routes from the router
  const routes = [];
  
  function extractRoutes(router, basePath = '') {
    if (router.stack) {
      router.stack.forEach(layer => {
        if (layer.route) {
          // This is a route
          const methods = Object.keys(layer.route.methods);
          routes.push({
            path: basePath + layer.route.path,
            methods: methods
          });
        } else if (layer.name === 'router') {
          // This is a nested router
          extractRoutes(layer.handle, basePath + layer.regexp.source.replace(/\\\//g, '/').replace(/\$.*/, ''));
        }
      });
    }
  }
  
  // Extract routes from the exam router
  extractRoutes(examRoutes, '/api/exams');
  
  console.log('📋 Available exam routes:');
  routes.forEach(route => {
    console.log(`  ${route.methods.join(', ').toUpperCase()} ${route.path}`);
  });
  
  // Check specifically for our update route
  const updateRoute = routes.find(r => r.path.includes('/results/') && r.methods.includes('put'));
  if (updateRoute) {
    console.log('✅ Update route found:', updateRoute);
  } else {
    console.log('❌ Update route not found');
  }
  
  // Check for delete route
  const deleteRoute = routes.find(r => r.path.includes('/results/') && r.methods.includes('delete'));
  if (deleteRoute) {
    console.log('✅ Delete route found:', deleteRoute);
  } else {
    console.log('❌ Delete route not found');
  }
};

testRoutes();
