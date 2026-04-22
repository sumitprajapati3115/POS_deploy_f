import { useState } from "react";
import API from "../services/api";
import baseUrl from "../services/baseUrl";
import toast from "react-hot-toast";

function AddProduct() {
  const [product, setProduct] = useState({
    name: "",
    barcode: "",
    category: "",
    subCategory: "",
    brand: "",
    costPrice: "",
    sellingPrice: "",
    discount: "",
    finalPrice: "",
    stockQuantity: "",
    expiryDate: "",
    description: "",
    unit: 1,
    lowStockAlert: 5,
  });

  const [showBarcode, setShowBarcode] = useState(false);
  const [barcodeOnly, setBarcodeOnly] = useState("");
  const [showBarcodeOnly, setShowBarcodeOnly] = useState(false);

  const handleChange = (e) => {
  const { name, value } = e.target;

  setProduct({
    ...product,
    [name]:
      e.target.type === "number" ? Number(value) : value,
  });
};

  const handleGenerateBarcode = () => {
    if (product.barcode.length < 6) {
      toast.error("Enter barcode first");
      return;
    }
    setShowBarcode(true);
  };

  const generateBarcodeOnly = () => {
    if (!barcodeOnly) {
      toast.error("Enter barcode number");
      return;
    }
    setShowBarcodeOnly(true);
  };

// 🌟 ONLY BARCODE PRINT (50x30mm - PERFECT CENTER - LANDSCAPE) 🌟
// ✅ MOBILE PRINT (RawBT)
const printBarcodeMobile = (barcode) => {
  if (!barcode) {
    toast.error("Barcode required");
    return;
  }

  const cmd = `
<CENTER>
<BOLD>My Store</BOLD>

<BARCODE TYPE=128 HEIGHT=80 WIDTH=2>
${barcode}
</BARCODE>

${barcode}

\n\n
`;

  const encoded = encodeURIComponent(cmd);

  // RawBT open करेगा
  window.location.href = `rawbt://print?text=${encoded}`;
};

// Product barcode print
const printBarcode = () => {
  printBarcodeMobile(product.barcode);
};

// Only barcode print
const printBarcodeOnly = () => {
  printBarcodeMobile(barcodeOnly);
};
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const discount = product.discount || 0;

const finalPrice =
  product.sellingPrice - (product.sellingPrice * discount) / 100;

      const payload = {
        ...product,
        finalPrice,
      };

      await API.post("/product/addProduct", payload);

      toast.success("Product Added Successfully");

      setProduct({
        name: "",
        barcode: "",
        category: "",
        subCategory: "",
        brand: "",
        costPrice: "",
        sellingPrice: "",
        discount: "",
        finalPrice: "",
        stockQuantity: "",
        expiryDate: "",
        description: "",
        unit: 1,
        lowStockAlert: 5,
      });

      setShowBarcode(false);
    } catch (err) {
      toast.error("Error adding product");
      console.log(err);
    }
  };

  return (
    <div className="p-2 md:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Add Product</h1>

      {/* Barcode Only Generator */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Generate Barcode Only</h2>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Enter Barcode Number"
            value={barcodeOnly}
            onChange={(e) => {
  const value = e.target.value.replace(/\D/g, "");
  setBarcodeOnly(value);
}}
            className="input border border-gray-300 p-2 rounded w-full sm:w-auto focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={generateBarcodeOnly}
            className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 cursor-pointer transition-colors"
          >
            Generate
          </button>
        </div>

        {showBarcodeOnly && (
          <div className="mt-6 text-center">
            <img
              src={`${baseUrl}/product/generateBarcode/${barcodeOnly}`}
              alt="barcode"
              className="mx-auto"
            />
            <p className="mt-2 font-medium">{barcodeOnly}</p>
            <button
              onClick={printBarcodeOnly}
              className="mt-3 bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 transition-colors cursor-pointer"
            >
              Print Barcode
            </button>
          </div>
        )}
      </div>

      {/* Product Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-4 md:p-6 lg:p-8 rounded-lg shadow"
      >
        {/* Name */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Product Name<span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={product.name}
            onChange={handleChange}
            className="input border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
            required
          />
        </div>

        {/* Barcode */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Barcode<span className="text-red-500">*</span>
          </label>
          <input
  name="barcode"
  value={product.barcode}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // only numbers
    setProduct({ ...product, barcode: value });
  }}
            className="input border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 text-sm font-medium">Category</label>
          <input
            name="category"
            value={product.category}
            onChange={handleChange}
            className="input border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Sub Category */}
        <div>
          <label className="block mb-1 text-sm font-medium">Sub Category</label>
          <input
            name="subCategory"
            value={product.subCategory}
            onChange={handleChange}
            className="input border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block mb-1 text-sm font-medium">Brand</label>
          <input
            name="brand"
            value={product.brand}
            onChange={handleChange}
            className="input border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Cost Price */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Cost Price<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="costPrice"
            value={product.costPrice}
            onChange={handleChange}
            className="input border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
            required
          />
        </div>

        {/* Selling Price */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Selling Price<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="sellingPrice"
            value={product.sellingPrice}
            onChange={handleChange}
            className="input border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
            required
          />
        </div>

        {/* Discount */}
        <div>
          <label className="block mb-1 text-sm font-medium">Discount (%)</label>
          <input
            type="number"
            name="discount"
            value={product.discount}
            onChange={handleChange}
            className="input border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Stock Quantity<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="stockQuantity"
            value={product.stockQuantity}
            onChange={handleChange}
            className="input border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
            required
          />
        </div>

        {/* Expiry */}
        <div>
          <label className="block mb-1 text-sm font-medium">Expiry Date</label>
          <input
            type="date"
            name="expiryDate"
            value={product.expiryDate}
            onChange={handleChange}
            className="input border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Low Stock */}
        <div>
          <label className="block mb-1 text-sm font-medium">Low Stock Alert</label>
          <input
            type="number"
            name="lowStockAlert"
            value={product.lowStockAlert}
            onChange={handleChange}
            className="input border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Description */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
          <label className="block mb-1 text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="input border border-gray-300 p-2 rounded w-full h-24 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handleGenerateBarcode}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full sm:w-auto cursor-pointer transition-colors"
          >
            Generate Barcode
          </button>

          <button
            type="submit"
            className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800 w-full sm:w-auto cursor-pointer transition-colors"
          >
            Add Product
          </button>
        </div>
      </form>

      {/* Barcode Preview */}
      {showBarcode && (
        <div className="mt-8 bg-white p-6 shadow rounded-lg text-center">
          <h3 className="font-semibold mb-3">Generated Barcode</h3>
          <p className="font-medium">{product.name}</p>
          <img
            src={`${baseUrl}/product/generateBarcode/${product.barcode}`}
            alt="barcode"
            className="mx-auto mt-2"
          />
          <p className="mt-2">{product.barcode}</p>
          <button
            onClick={printBarcode}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors cursor-pointer"
          >
            Print Barcode
          </button>
        </div>
      )}
    </div>
  );
}

export default AddProduct;
