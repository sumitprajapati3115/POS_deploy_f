import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import SalesChart from "../components/SalesChart";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    orders: 0,
    productsSold: 0,
    revenue: 0,
    lowStock: 0,
  });

  const [recentSales, setRecentSales] = useState([]);
  const [salesChart, setSalesChart] = useState([]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/dashboard/dashboard-stats");
      console.log(res.data);
      setStats(res.data.summary);
      setRecentSales(res.data.recentSales);
      setSalesChart(res.data.salesChart);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="p-2 md:p-6 lg:p-8 bg-gray-100 min-h-screen">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg shadow">
          <p className="text-blue-700 text-sm font-medium">Total Products</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {stats?.totalProducts}
          </h2>
        </div>

        {/* Daily Orders */}
        <div className="bg-cyan-50 border-l-4 border-cyan-500 p-6 rounded-lg shadow">
          <p className="text-cyan-700 text-sm font-medium">Daily Orders</p>
          <h2 className="text-3xl font-bold text-cyan-600">
            {stats?.dailyOrders}
          </h2>
        </div>

        {/* Products Sold */}
        <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg shadow">
          <p className="text-purple-700 text-sm font-medium">Products Sold Today</p>
          <h2 className="text-3xl font-bold text-purple-600">
            {stats?.totalProductsSold}
          </h2>
        </div>

        {/* Total Revenue */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow">
          <p className="text-green-700 text-sm font-medium">Total Revenue</p>
          <h2 className="text-3xl font-bold text-green-600">
            ₹{stats?.totalRevenue}
          </h2>
        </div>

        {/* Today's Revenue */}
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-lg shadow">
          <p className="text-emerald-700 text-sm font-medium">Today's Revenue</p>
          <h2 className="text-3xl font-bold text-emerald-600">
            ₹{stats?.todayRevenue}
          </h2>
        </div>

        {/* Low Stock */}
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow">
          <p className="text-red-700 text-sm font-medium">Low Stock Items</p>
          <h2 className="text-3xl font-bold text-red-600">
            {stats?.lowStockItems}
          </h2>
        </div>
      </div>

      {/* Sales Chart */}

      <SalesChart data={salesChart} />

      {/* Bottom Section */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Recent Sales
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-green-500 text-white">
                <tr>
                  <th className="p-2 text-left">Bill</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale._id} className="border-b">
                    <td className="p-2">{sale.billNumber}</td>

                    <td className="p-2">₹{sale.finalAmount}</td>

                    <td className="p-2">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/add-product")}
              className="bg-green-500 text-white py-3 rounded hover:bg-green-600"
            >
              Add Product
            </button>

            <button
              onClick={() => navigate("/sales")}
              className="bg-green-500 text-white py-3 rounded hover:bg-green-600"
            >
              New Sale
            </button>

            <button
              onClick={() => navigate("/products")}
              className="bg-green-500 text-white py-3 rounded hover:bg-green-600"
            >
              View Products
            </button>

            <button
              onClick={() => navigate("/purchase")}
              className="bg-green-500 text-white py-3 rounded hover:bg-green-600"
            >
              Purchase Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
