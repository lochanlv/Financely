import { useState } from "react";
import { auth } from "../../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";

const FirebaseDebug = () => {
  const [debugInfo, setDebugInfo] = useState("");
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testPassword, setTestPassword] = useState("testpassword123");

  const testFirebaseConnection = async () => {
    try {
      setDebugInfo("Testing Firebase connection...\n");

      // Test 1: Check if auth is initialized
      setDebugInfo(
        (prev) => prev + `✓ Auth initialized: ${auth ? "Yes" : "No"}\n`
      );
      setDebugInfo(
        (prev) => prev + `✓ Auth app: ${auth.app ? auth.app.name : "No app"}\n`
      );

      // Test 2: Check Firebase config
      const config = auth.app.options;
      setDebugInfo(
        (prev) =>
          prev +
          `✓ API Key: ${
            config.apiKey ? config.apiKey.substring(0, 10) + "..." : "Not found"
          }\n`
      );
      setDebugInfo(
        (prev) => prev + `✓ Auth Domain: ${config.authDomain || "Not found"}\n`
      );
      setDebugInfo(
        (prev) => prev + `✓ Project ID: ${config.projectId || "Not found"}\n`
      );

      // Test 3: Try to create a test user
      setDebugInfo((prev) => prev + "\nTesting user creation...\n");
      try {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          testEmail,
          testPassword
        );
        setDebugInfo(
          (prev) => prev + `✓ Test user created successfully: ${user.uid}\n`
        );

        // Clean up - delete the test user
        await user.delete();
        setDebugInfo((prev) => prev + "✓ Test user cleaned up\n");
      } catch (error) {
        setDebugInfo(
          (prev) =>
            prev + `✗ User creation failed: ${error.code} - ${error.message}\n`
        );
        setDebugInfo(
          (prev) => prev + `Error details: ${JSON.stringify(error, null, 2)}\n`
        );
      }
    } catch (error) {
      setDebugInfo(
        (prev) => prev + `✗ Firebase connection failed: ${error.message}\n`
      );
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Firebase Debug Tool
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Test Email:
        </label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Test Password:
        </label>
        <input
          type="password"
          value={testPassword}
          onChange={(e) => setTestPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <button
        onClick={testFirebaseConnection}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Test Firebase Connection
      </button>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Debug Output:
        </h3>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-auto max-h-96">
          {debugInfo ||
            "Click 'Test Firebase Connection' to see debug information..."}
        </pre>
      </div>
    </div>
  );
};

export default FirebaseDebug;
