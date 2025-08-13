import * as licenseController from './controllers/licenseController.js';

console.log('🔍 Testing license controller imports...');

console.log('Available functions:');
console.log(Object.keys(licenseController));

console.log('\nChecking getLicenseStatus:');
console.log('Type:', typeof licenseController.getLicenseStatus);
console.log('Exists:', !!licenseController.getLicenseStatus);

if (licenseController.getLicenseStatus) {
  console.log('✅ getLicenseStatus function is properly exported');
} else {
  console.log('❌ getLicenseStatus function is NOT exported');
}
