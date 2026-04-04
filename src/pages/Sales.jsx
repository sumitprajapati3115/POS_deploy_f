import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchDate, setSearchDate] = useState("");
  const navigate = useNavigate();

  const fetchSales = async (type = "all") => {
    try {
      let url = "/sale/all";

      if (type === "daily") url = "/sale/daily";
      if (type === "weekly") url = "/sale/weekly";
      if (type === "monthly") url = "/sale/monthly";

      const res = await API.get(url);

      setSales(res.data.sales);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchSalesByDate = async () => {
    try {
      if (!searchDate) return;

      const res = await API.get(`/sale/by-date?date=${searchDate}`);

      setSales(res.data.sales);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleFilter = (type) => {
    setFilter(type);
    fetchSales(type);
  };

  return (
    <div className="p-2 md:p-6 lg:p-8 bg-gray-100 min-h-screen ">
      {/* Header */}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Sales</h1>

        <button
          onClick={() => navigate("/pos")}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700  cursor-pointer"
        >
          + New Sale
        </button>
      </div>

      {/* Filters */}

      <div className="flex flex-wrap gap-3 mb-6 ">
        <button
          onClick={() => handleFilter("all")}
          className={`px-4 py-2 rounded ${
            filter === "all" ? "bg-green-600 text-white" : "bg-white border"
          }`}
        >
          All
        </button>

        <button
          onClick={() => handleFilter("daily")}
          className={`px-4 py-2 rounded ${
            filter === "daily" ? "bg-green-600 text-white" : "bg-white border"
          }`}
        >
          Today
        </button>

        <button
          onClick={() => handleFilter("weekly")}
          className={`px-4 py-2 rounded ${
            filter === "weekly" ? "bg-green-600 text-white" : "bg-white border"
          }`}
        >
          Weekly
        </button>

        <button
          onClick={() => handleFilter("monthly")}
          className={`px-4 py-2 rounded ${
            filter === "monthly" ? "bg-green-600 text-white" : "bg-white border"
          }`}
        >
          Monthly
        </button>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={() => fetchSalesByDate()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>

        <button
          onClick={() => {
            setSearchDate("");
            fetchSales("all");
          }}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>

      {/* Sales Table */}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-green-500 text-white">
            <tr>
              <th className="p-3 text-left">Bill No</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  No Sales Found
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{sale.billNumber}</td>

                  <td className="p-3">{sale.items?.length}</td>

                  <td className="p-3">₹{sale.finalAmount}</td>

                  <td className="p-3">{sale.paymentMethod}</td>

                  <td className="p-3">
                    {new Date(sale.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
