import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/config";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const Reports = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch expenses
      const expensesQuery = query(
        collection(db, "users", currentUser.uid, "expenses"),
        orderBy("date", "desc")
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const expensesData = expensesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch income
      const incomeQuery = query(
        collection(db, "users", currentUser.uid, "income"),
        orderBy("date", "desc")
      );
      const incomeSnapshot = await getDocs(incomeQuery);
      const incomeData = incomeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setExpenses(expensesData);
      setIncome(incomeData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case "current-month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "last-month":
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case "last-3-months":
        startDate = startOfMonth(subMonths(now, 3));
        endDate = endOfMonth(now);
        break;
      case "last-6-months":
        startDate = startOfMonth(subMonths(now, 6));
        endDate = endOfMonth(now);
        break;
      case "last-year":
        startDate = startOfMonth(subMonths(now, 12));
        endDate = endOfMonth(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = expense.date?.toDate
        ? expense.date.toDate()
        : new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const filteredIncome = income.filter((incomeItem) => {
      const incomeDate = incomeItem.date?.toDate
        ? incomeItem.date.toDate()
        : new Date(incomeItem.date);
      return incomeDate >= startDate && incomeDate <= endDate;
    });

    return { filteredExpenses, filteredIncome };
  };

  const getCategoryBreakdown = (data) => {
    const breakdown = {};
    data.forEach((item) => {
      const category = item.category || "Uncategorized";
      breakdown[category] = (breakdown[category] || 0) + (item.amount || 0);
    });
    return breakdown;
  };

  const getChartData = () => {
    const expenseData = Object.entries(expenseBreakdown).map(
      ([name, value]) => ({
        name,
        value,
        color: getRandomColor(),
      })
    );

    const incomeData = Object.entries(incomeBreakdown).map(([name, value]) => ({
      name,
      value,
      color: getRandomColor(),
    }));

    return { expenseData, incomeData };
  };

  const getRandomColor = () => {
    const colors = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff7300",
      "#00ff00",
      "#ff00ff",
      "#00ffff",
      "#ff0000",
      "#0000ff",
      "#ffff00",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getMonthlyTrendData = () => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthExpenses = expenses
        .filter((expense) => {
          const expenseDate = expense.date?.toDate
            ? expense.date.toDate()
            : new Date(expense.date);
          return expenseDate >= monthStart && expenseDate <= monthEnd;
        })
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const monthIncome = income
        .filter((incomeItem) => {
          const incomeDate = incomeItem.date?.toDate
            ? incomeItem.date.toDate()
            : new Date(incomeItem.date);
          return incomeDate >= monthStart && incomeDate <= monthEnd;
        })
        .reduce((sum, incomeItem) => sum + (incomeItem.amount || 0), 0);

      months.push({
        month: format(month, "MMM"),
        expenses: monthExpenses,
        income: monthIncome,
        net: monthIncome - monthExpenses,
      });
    }

    return months;
  };

  const { filteredExpenses, filteredIncome } = getFilteredData();
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0
  );
  const totalIncome = filteredIncome.reduce(
    (sum, incomeItem) => sum + (incomeItem.amount || 0),
    0
  );
  const netIncome = totalIncome - totalExpenses;
  const expenseBreakdown = getCategoryBreakdown(filteredExpenses);
  const incomeBreakdown = getCategoryBreakdown(filteredIncome);
  const { expenseData, incomeData } = getChartData();
  const monthlyTrendData = getMonthlyTrendData();

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
            Reports & Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Analyze your financial data and spending patterns
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
          >
            <option value="current-month">Current Month</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="last-year">Last Year</option>
          </select>
          <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Income
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Net Income
              </p>
              <p
                className={`text-2xl font-bold ${
                  netIncome >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                ${netIncome.toLocaleString()}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                netIncome >= 0
                  ? "bg-green-100 dark:bg-green-900"
                  : "bg-red-100 dark:bg-red-900"
              }`}
            >
              {netIncome >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Trend
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--toast-bg)",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "var(--toast-color)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={3}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Net Income"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Expense Categories Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expense Categories
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--toast-bg)",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "var(--toast-color)",
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Income Categories Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Income Categories
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={incomeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {incomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--toast-bg)",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "var(--toast-color)",
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Expense Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expense Categories
          </h3>
          <div className="space-y-3">
            {Object.entries(expenseBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {category}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(amount / totalExpenses) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Income Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Income Categories
          </h3>
          <div className="space-y-3">
            {Object.entries(incomeBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {category}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(amount / totalIncome) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {[...filteredExpenses.slice(0, 5), ...filteredIncome.slice(0, 5)]
            .sort((a, b) => {
              const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
              const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
              return dateB - dateA;
            })
            .slice(0, 10)
            .map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.amount && transaction.amount > 0
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-red-100 dark:bg-red-900"
                    }`}
                  >
                    {transaction.amount && transaction.amount > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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
                <span
                  className={`text-sm font-medium ${
                    transaction.amount && transaction.amount > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.amount && transaction.amount > 0 ? "+" : "-"}$
                  {Math.abs(transaction.amount || 0).toLocaleString()}
                </span>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;
