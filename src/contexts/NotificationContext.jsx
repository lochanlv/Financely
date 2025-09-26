import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const notificationsQuery = query(
      collection(db, "users", currentUser.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter((notif) => !notif.read).length);
    });

    return unsubscribe;
  }, [currentUser]);

  const addNotification = async (notification) => {
    try {
      if (!currentUser) return;

      const notificationData = {
        ...notification,
        userId: currentUser.uid,
        read: false,
        createdAt: new Date(),
      };

      await addDoc(
        collection(db, "users", currentUser.uid, "notifications"),
        notificationData
      );
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      if (!currentUser) return;

      await updateDoc(
        doc(db, "users", currentUser.uid, "notifications", notificationId),
        {
          read: true,
        }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!currentUser) return;

      const unreadNotifications = notifications.filter((notif) => !notif.read);
      const updatePromises = unreadNotifications.map((notif) =>
        updateDoc(
          doc(db, "users", currentUser.uid, "notifications", notif.id),
          {
            read: true,
          }
        )
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const createExpenseNotification = (expense) => {
    return {
      type: "expense",
      title: "New Expense Added",
      message: `You added $${expense.amount} for ${expense.category}`,
      icon: "💸",
    };
  };

  const createIncomeNotification = (income) => {
    return {
      type: "income",
      title: "New Income Added",
      message: `You added $${income.amount} from ${income.category}`,
      icon: "💰",
    };
  };

  const createBudgetAlert = (category, spent, budget) => {
    return {
      type: "budget_alert",
      title: "Budget Alert",
      message: `You've spent $${spent} of $${budget} budget for ${category}`,
      icon: "⚠️",
    };
  };

  const createGoalNotification = (goal) => {
    return {
      type: "goal",
      title: "Goal Achievement",
      message: `Congratulations! You've achieved your ${goal.name} goal!`,
      icon: "🎉",
    };
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    createExpenseNotification,
    createIncomeNotification,
    createBudgetAlert,
    createGoalNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
