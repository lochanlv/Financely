import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { format } from "date-fns";
import IncomeForm from "./IncomeForm";
import toast from "react-hot-toast";

const IncomeList = () => {
  const { currentUser } = useAuth();
  const [income, setIncome] = useState([]);
  const [filteredIncome, setFilteredIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const categories = [
    "All Categories",
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Rental Income",
    "Bonus",
    "Commission",
    "Gift",
    "Refund",
    "Other",
  ];

  useEffect(() => {
    if (currentUser) {
      fetchIncome();
    }
  }, [currentUser]);

  useEffect(() => {
    filterIncome();
  }, [income, searchTerm, selectedCategory, sortBy]);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const incomeQuery = query(
        collection(db, "users", currentUser.uid, "income"),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(incomeQuery);
      const incomeData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncome(incomeData);
    } catch (error) {
      console.error("Error fetching income:", error);
      toast.error("Failed to fetch income");
    } finally {
      setLoading(false);
    }
  };

  const filterIncome = () => {
    let filtered = [...income];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "All Categories") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Sort income
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount;
        case "date":
        default:
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA;
      }
    });

    setFilteredIncome(filtered);
  };

  const handleDeleteIncome = async (incomeId) => {
    if (window.confirm("Are you sure you want to delete this income record?")) {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid, "income", incomeId));
        setIncome(income.filter((item) => item.id !== incomeId));
        toast.success("Income deleted successfully");
      } catch (error) {
        console.error("Error deleting income:", error);
        toast.error("Failed to delete income");
      }
    }
  };

  const handleEditIncome = (incomeItem) => {
    setEditingIncome(incomeItem);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchIncome();
    setEditingIncome(null);
  };

  const totalAmount = filteredIncome.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Income
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your income sources
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Income</span>
        </motion.button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search income..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors appearance-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors appearance-none"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredIncome.length} income record
              {filteredIncome.length !== 1 ? "s" : ""}
            </span>
            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
              Total: ${totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredIncome.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No income records found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {searchTerm || selectedCategory !== "All Categories"
                ? "Try adjusting your filters"
                : "Start by adding your first income record"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {filteredIncome.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.description}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Tag className="w-3 h-3" />
                              <span>{item.category}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {format(
                                  item.date?.toDate
                                    ? item.date.toDate()
                                    : new Date(item.date),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        +${item.amount?.toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditIncome(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Income Form Modal */}
      <AnimatePresence>
        {showForm && (
          <IncomeForm
            income={editingIncome}
            onClose={() => {
              setShowForm(false);
              setEditingIncome(null);
            }}
            onSuccess={handleFormSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IncomeList;
