import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStock, setLowStock] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/product/getAllProduct");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      await API.delete(`/product/delete/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  };

  // Filtering logic
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);

    const matchCategory = category ? p.category === category : true;

    const matchLowStock = lowStock ? p.stockQuantity <= p.lowStockAlert : true;

    return matchSearch && matchCategory && matchLowStock;
  });

  const categories = [...new Set(products.map((p) => p.category))];

  const printLabel = async (product, mode = "TSPL") => {
    try {
      let command = "";

      if (mode === "TSPL") {
        command = `
SIZE 50 mm, 30 mm
CLS
TEXT 10,10,"2",0,1,1,"${product.name}"
BARCODE 10,40,"128",50,1,0,2,2,"${product.barcode}"
TEXT 10,100,"2",0,1,1,"₹${product.sellingPrice}"
PRINT 1
`;
      } else if (mode === "CPCL") {
        command = `
! 0 200 200 210 1
TEXT 4 0 10 20 ${product.name}
BARCODE 128 1 1 20 20 100 ${product.barcode}
TEXT 4 0 10 120 ₹${product.sellingPrice}
PRINT
`;
      }

      // Replace with your printer's IP address and port (usually 9100 for raw printing)
      const printerIP = "192.168.1.100"; // Change this to your printer's IP
      const printerPort = 9100;

      const response = await fetch(`http://${printerIP}:${printerPort}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: command,
      });

      if (response.ok) {
        toast.success("Label printed successfully!");
      } else {
        throw new Error("Failed to print");
      }
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print label. Check printer connection.");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Product Inventory</h1>

        <button
          onClick={() => navigate("/add-product")}
          className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 w-full sm:w-auto  cursor-pointer"
        >
          + Add Product
        </button>
      </div>

      {/* Filters */}

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row flex-wrap gap-4 sm:items-center">
        {/* Search */}

        <input
          type="text"
          placeholder="Search by name or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-md w-full sm:w-64 focus:ring-2 focus:ring-green-500"
        />

        {/* Category Filter */}

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded-md w-full sm:w-auto focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Categories</option>

          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        {/* Low Stock */}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={lowStock}
            onChange={() => setLowStock(!lowStock)}
          />
          Low Stock
        </label>
      </div>

      {/* Product Table */}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-green-500 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Barcode</th>
              <th className="p-3 text-left">Selling Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Expiry</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{p.name}</td>

                <td className="p-3">{p.category}</td>

                <td className="p-3">{p.barcode}</td>

                <td className="p-3">₹{p.sellingPrice}</td>

                <td
                  className={`p-3 font-semibold ${
                    p.stockQuantity <= p.lowStockAlert
                      ? "text-red-500"
                      : "text-gray-700"
                  }`}
                >
                  {p.stockQuantity}
                </td>

                <td className="p-3">
                  {p.expiryDate
                    ? new Date(p.expiryDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(p._id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => printLabel(p, "TSPL")}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      TSPL
                    </button>
                    <button
                      onClick={() => printLabel(p, "CPCL")}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                    >
                      CPCL
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}