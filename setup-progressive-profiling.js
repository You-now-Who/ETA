#!/usr/bin/env node

console.log('🚀 ETA Progressive Profiling Setup Guide\n');

console.log('📋 Follow these steps to set up progressive profiling:\n');

console.log('1️⃣  AUTH0 MANAGEMENT API SETUP');
console.log('   • Go to: https://manage.auth0.com/dashboard/applications');
console.log('   • Click "Create Application"');
console.log('   • Name: "ETA Management API"');
console.log('   • Type: "Machine to Machine Applications"');
console.log('   • Click "Create"');
console.log('   • Select "Auth0 Management API"');
console.log('   • Grant these scopes:');
console.log('     ✓ read:users');
console.log('     ✓ update:users');
console.log('   • Click "Authorize"\n');

console.log('2️⃣  UPDATE ENVIRONMENT VARIABLES');
console.log('   • Copy the Client ID and Client Secret from step 1');
console.log('   • Add to your .env.local file:');
console.log('     AUTH0_MANAGEMENT_CLIENT_ID="your_client_id_here"');
console.log('     AUTH0_MANAGEMENT_CLIENT_SECRET="your_client_secret_here"\n');

console.log('3️⃣  CREATE AUTH0 ACTION');
console.log('   • Go to: https://manage.auth0.com/dashboard/actions/flows');
console.log('   • Click "Login" flow');
console.log('   • Click the "+" button to add action');
console.log('   • Select "Build Custom"');
console.log('   • Name: "Progressive Profiling"');
console.log('   • Trigger: "Login / Post Login"');
console.log('   • Copy the code from: auth0-actions/postlogin-progressive-profiling.js');
console.log('   • Click "Deploy"');
console.log('   • Drag the action to your Login flow');
console.log('   • Click "Apply"\n');

console.log('4️⃣  TEST THE SETUP');
console.log('   • Clear browser storage and logout');
console.log('   • Login 3 times with the same user');
console.log('   • On 3rd login, should redirect to /profile-setup');
console.log('   • Complete the profile form');
console.log('   • Check dashboard for profile information\n');

console.log('5️⃣  TROUBLESHOOTING');
console.log('   • Check browser console for errors');
console.log('   • Verify Auth0 Action is in the Login flow');
console.log('   • Check Management API permissions');
console.log('   • Ensure environment variables are correct\n');

console.log('📁 Files created:');
console.log('   ├── app/profile-setup/page.js');
console.log('   ├── app/api/user/metadata/route.js');
console.log('   ├── components/UserProfileCard.jsx');
console.log('   ├── lib/auth0-management.js');
console.log('   └── auth0-actions/postlogin-progressive-profiling.js\n');

console.log('✨ Ready to go! Follow the steps above to complete setup.\n');
