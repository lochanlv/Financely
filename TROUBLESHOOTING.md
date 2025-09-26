# Financely - Troubleshooting Guide

## Registration Error: "your-api-key" 400 Bad Request

If you're seeing this error when trying to register:

```
AuthContext.jsx:32 POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=your-api-key 400 (Bad Request)
```

This indicates that the Firebase API key is not being loaded correctly. Here are the steps to fix this:

## Step 1: Clear Browser Cache

1. **Hard Refresh**: Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. **Clear Cache**:
   - Open Developer Tools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"
3. **Incognito/Private Mode**: Try opening the app in an incognito/private browser window

## Step 2: Verify Firebase Configuration

1. **Check Firebase Console**:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `financely-expense-tracke-ad122`
   - Go to Project Settings (gear icon)
   - Verify the API key matches what's in `src/firebase/config.js`

2. **Verify Authentication is Enabled**:
   - In Firebase Console, go to "Authentication"
   - Click "Sign-in method" tab
   - Ensure "Email/Password" is enabled
   - Ensure "Google" is enabled (if you want Google sign-in)

## Step 3: Use the Debug Tool

1. **Navigate to Settings**: Go to `/settings` in your app
2. **Find Firebase Debug Tool**: Scroll down to see the debug section
3. **Test Connection**: Click "Test Firebase Connection"
4. **Check Output**: Look at the debug output to see what's wrong

## Step 4: Restart Development Server

1. **Stop the server**: Press `Ctrl + C` in the terminal
2. **Clear Vite cache**: Run `npm run dev -- --force` or delete `node_modules/.vite`
3. **Restart**: Run `npm run dev`

## Step 5: Verify Firebase Project Setup

Make sure your Firebase project has the following enabled:

### Authentication Setup

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password"
3. Enable "Google" (optional)
4. Add your domain to authorized domains if needed

### Firestore Setup

1. Go to Firebase Console → Firestore Database
2. Create database in "test mode" initially
3. Apply the security rules from `FIREBASE_SETUP.md`

### Storage Setup (for receipts)

1. Go to Firebase Console → Storage
2. Create storage bucket
3. Apply the security rules from `FIREBASE_SETUP.md`

## Step 6: Check Network Tab

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Try to register again
4. Look for the failed request to `identitytoolkit.googleapis.com`
5. Check the request headers and payload

## Step 7: Environment Variables (Alternative)

If the issue persists, try using environment variables:

1. **Create `.env.local` file** in project root:

```env
VITE_FIREBASE_API_KEY=AIzaSyDPMf2y-s0QxNRQgTYEO3UPR-IL6Ov6Izg
VITE_FIREBASE_AUTH_DOMAIN=financely-expense-tracke-ad122.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=financely-expense-tracke-ad122
VITE_FIREBASE_STORAGE_BUCKET=financely-expense-tracke-ad122.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=393371608787
VITE_FIREBASE_APP_ID=1:393371608787:web:9018f3134435a39df7d626
```

2. **Update `src/firebase/config.js`**:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-LHWCNKXZH4",
};
```

## Common Error Codes

### 400 Bad Request

- **API Key Invalid**: Check if the API key is correct
- **Authentication Disabled**: Enable Email/Password in Firebase Console
- **Domain Not Authorized**: Add your domain to authorized domains

### 403 Forbidden

- **API Key Restricted**: Check API key restrictions in Google Cloud Console
- **Quota Exceeded**: Check Firebase usage limits

### 404 Not Found

- **Project Not Found**: Verify project ID is correct
- **Service Not Enabled**: Enable Authentication service

## Still Having Issues?

1. **Check Console Logs**: Look for any JavaScript errors in the browser console
2. **Verify Network**: Ensure you have internet connection
3. **Try Different Browser**: Test in Chrome, Firefox, or Edge
4. **Check Firebase Status**: Visit [Firebase Status Page](https://status.firebase.google.com/)

## Debug Information

When you use the debug tool in Settings, it will show:

- ✅ Firebase connection status
- ✅ API key verification (first 10 characters)
- ✅ Auth domain verification
- ✅ Project ID verification
- ✅ Test user creation attempt
- ❌ Detailed error messages if something fails

## Next Steps

Once the authentication is working:

1. Test user registration
2. Test user login
3. Test adding expenses and income
4. Verify data appears in Firestore
5. Test the dashboard functionality

If you continue to have issues, please share the debug output from the Firebase Debug Tool in Settings.
