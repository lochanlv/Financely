import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Plus,
  Calendar,
  Filter,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch income data
      const incomeQuery = query(
        collection(db, "users", currentUser.uid, "income"),
        orderBy("date", "desc")
      );
      const incomeSnapshot = await getDocs(incomeQuery);
      const incomeData = incomeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch expense data
      const expenseQuery = query(
        collection(db, "users", currentUser.uid, "expenses"),
        orderBy("date", "desc")
      );
      const expenseSnapshot = await getDocs(expenseQuery);
      const expenseData = expenseSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate stats
      const totalIncome = incomeData.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
      const totalExpenses = expenseData.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );

      // Calculate monthly stats
      const currentMonth = new Date();
      const startOfCurrentMonth = startOfMonth(currentMonth);
      const endOfCurrentMonth = endOfMonth(currentMonth);

      const monthlyIncome = incomeData
        .filter((item) => {
          const itemDate = item.date?.toDate
            ? item.date.toDate()
            : new Date(item.date);
          return (
            itemDate >= startOfCurrentMonth && itemDate <= endOfCurrentMonth
          );
        })
        .reduce((sum, item) => sum + (item.amount || 0), 0);

      const monthlyExpenses = expenseData
        .filter((item) => {
          const itemDate = item.date?.toDate
            ? item.date.toDate()
            : new Date(item.date);
          return (
            itemDate >= startOfCurrentMonth && itemDate <= endOfCurrentMonth
          );
        })
        .reduce((sum, item) => sum + (item.amount || 0), 0);

      setStats({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses,
      });

      // Get recent transactions
      const allTransactions = [
        ...incomeData.map((item) => ({ ...item, type: "income" })),
        ...expenseData.map((item) => ({ ...item, type: "expense" })),
      ]
        .sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA;
        })
        .slice(0, 5);

      setRecentTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
            ${value.toLocaleString()}
          </p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color} flex-shrink-0 ml-2`}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 sm:mt-4 flex items-center">
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
          <span className="text-xs sm:text-sm text-green-600 dark:text-green-400">
            {trend}
          </span>
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button
            onClick={() => navigate("/expenses")}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={stats.balance}
          icon={DollarSign}
          color="bg-gradient-to-r from-green-500 to-emerald-600"
        />
        <StatCard
          title="Monthly Income"
          value={stats.monthlyIncome}
          icon={TrendingUp}
          color="bg-gradient-to-r from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Monthly Expenses"
          value={stats.monthlyExpenses}
          icon={TrendingDown}
          color="bg-gradient-to-r from-red-500 to-pink-600"
        />
        <StatCard
          title="Total Expenses"
          value={stats.totalExpenses}
          icon={CreditCard}
          color="bg-gradient-to-r from-purple-500 to-violet-600"
        />
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
        </div>
        <div className="p-6">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No transactions yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Start by adding your first expense or income
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        transaction.type === "income"
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-red-100 dark:bg-red-900"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                        {transaction.description || transaction.title}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {transaction.category} •{" "}
                        {format(
                          transaction.date?.toDate
                            ? transaction.date.toDate()
                            : new Date(transaction.date),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm sm:text-base font-semibold flex-shrink-0 ml-2 ${
                      transaction.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {transaction.amount?.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
