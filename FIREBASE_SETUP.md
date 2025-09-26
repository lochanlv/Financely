# Firebase Setup Guide for Financely

This guide will walk you through setting up Firebase for the Financely expense tracker application from scratch.

## Prerequisites

- A Google account
- Node.js installed on your system
- Basic understanding of web development

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `financely-expense-tracker` (or your preferred name)
4. Enable Google Analytics (recommended for better insights)
5. Choose or create a Google Analytics account
6. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project dashboard, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following sign-in providers:
   - **Email/Password**: Click on it and toggle "Enable"
   - **Google**: Click on it, toggle "Enable", and add your project support email
   - **Anonymous** (optional): For guest users

## Step 3: Create Firestore Database

1. In the left sidebar, click on "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location closest to your users
5. Click "Done"

## Step 4: Configure Firestore Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User's expenses
    match /users/{userId}/expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User's income
    match /users/{userId}/income/{incomeId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User's budgets
    match /users/{userId}/budgets/{budgetId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User's categories
    match /users/{userId}/categories/{categoryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User's recurring transactions
    match /users/{userId}/recurring/{recurringId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## Step 5: Enable Storage (for receipt uploads)

1. In the left sidebar, click on "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Select the same location as your Firestore database
5. Click "Done"

## Step 6: Configure Storage Security Rules

1. In Storage, go to the "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/receipts/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## Step 7: Get Firebase Configuration

1. In your project dashboard, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click on the web icon (</>) to add a web app
5. Enter app nickname: `financely-web`
6. Check "Also set up Firebase Hosting" (optional)
7. Click "Register app"
8. Copy the Firebase configuration object

## Step 8: Add Configuration to Your App

1. Create a file `src/firebase/config.js` in your project
2. Add your Firebase configuration:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // Paste your configuration object here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

## Step 9: Install Firebase Dependencies

Run the following command in your project directory:

```bash
npm install firebase
```

## Step 10: Test Your Setup

1. Start your development server: `npm run dev`
2. Try to register a new user
3. Check the Firebase Console to see if the user appears in Authentication
4. Try adding an expense and check if it appears in Firestore

## Database Structure

Your Firestore database will have the following structure:

```
users/{userId}/
├── expenses/{expenseId}
├── income/{incomeId}
├── budgets/{budgetId}
├── categories/{categoryId}
└── recurring/{recurringId}
```

## Security Best Practices

1. **Never expose your Firebase config in client-side code** in production
2. **Use environment variables** for sensitive configuration
3. **Regularly review and update** your security rules
4. **Enable App Check** for additional security
5. **Monitor usage** in the Firebase Console

## Environment Variables (Recommended)

Create a `.env.local` file in your project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

Then update your config file to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

## Troubleshooting

### Common Issues:

1. **Authentication not working**: Check if the sign-in method is enabled
2. **Firestore permission denied**: Verify your security rules
3. **Storage upload failed**: Check storage rules and file size limits
4. **CORS errors**: Ensure your domain is added to authorized domains

### Getting Help:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

## Next Steps

After completing this setup:

1. Implement user authentication in your app
2. Create CRUD operations for expenses and income
3. Add data validation and error handling
4. Implement real-time updates
5. Add offline support with Firebase offline persistence

Your Firebase setup is now complete! You can start building your Financely expense tracker with full backend support.
