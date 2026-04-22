import { useState, useRef } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function POS() {
  const typingTimeout = useRef(null);
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Scanner ki typing ko handle karne ka sahi tareeqa
  const handleChange = (e) => {
    const value = e.target.value;
    setBarcode(value);

    clearTimeout(typingTimeout.current);
    
    typingTimeout.current = setTimeout(() => {
      if (value.trim() !== "") {
        fetchProduct(value.trim());
      }
    }, 400); 
  };

  // Scanner 'Enter' hit karta hai
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      clearTimeout(typingTimeout.current); 
      if (barcode.trim() !== "") {
        fetchProduct(barcode.trim());
      }
    }
  };

  // Fetch Product and Add to Cart
  const fetchProduct = async (code) => {
    try {
      const res = await API.get(`/product/barcode/${code}`);
      const product = res?.data?.product;

      const existing = cart.find((item) => item.barcode === product.barcode);

      if (existing) {
        if (existing.qty >= product.stockQuantity) {
          toast.error("Stock limit reached");
          return;
        }
        setCart((prev) =>
          prev.map((item) =>
            item.barcode === product.barcode ? { ...item, qty: item.qty + 1 } : item
          )
        );
      } else {
        if (product.stockQuantity === 0) {
          toast.error("Out of stock");
          return;
        }
        setCart((prev) => [...prev, { ...product, qty: 1 }]);
      }
      
      setBarcode("");
      
    } catch (error) {
      toast.error("Product not found");
      console.log(error);
      setBarcode(""); 
    }
  };

  // Create Sale via API
  const createSale = async () => {
    try {
      const items = cart.map((item) => ({
        productId: item._id,
        quantity: item.qty,
      }));

      const subtotal = cart.reduce((acc, item) => acc + item.sellingPrice * item.qty, 0);
      const discountAmount = (subtotal * discount) / 100;

      await API.post("/sale/create", {
        items,
        paymentMethod: paymentMethod,
        discount: discountAmount,
      });

      toast.success("Sale saved successfully");
      
      generateBill(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating sale");
      console.error(error);
    }
  };

  // 🌟 FIX: Perfect 48mm Safe Area for 58mm Thermal Printer 🌟
// ✅ MOBILE BILL PRINT (RawBT)
const generateBill = () => {
  if (cart.length === 0) {
    toast.error("Cart empty");
    return;
  }

  const subtotal = cart.reduce((acc, item) => acc + item.sellingPrice * item.qty, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  let itemsText = "";

  cart.forEach((item) => {
    itemsText += `
${item.name.substring(0, 16)}
${item.qty} x ${item.sellingPrice} = ${item.qty * item.sellingPrice}
----------------
`;
  });

  const cmd = `
<CENTER>
<BOLD>PINWEB COSMETICS</BOLD>
Lucknow, UP
----------------------------

</CENTER>

${itemsText}

----------------------------
Subtotal: ${subtotal}
Discount: -${discountAmount.toFixed(2)}

<BOLD>Total: ${total.toFixed(2)}</BOLD>

Payment: ${paymentMethod.toUpperCase()}

<CENTER>
Thank You!
Visit Again
</CENTER>

\n\n\n
`;

  const encoded = encodeURIComponent(cmd);

  // RawBT trigger
  window.location.href = `rawbt://print?text=${encoded}`;

  // Reset cart
  setCart([]);
  setBarcode("");
  setDiscount(0);
};

  const increaseQty = (barcode) => {
    const updated = cart.map((item) => {
      if (item.barcode === barcode) {
        if (item.qty >= item.stockQuantity) {
          toast.error("Stock limit reached");
          return item;
        }
        return { ...item, qty: item.qty + 1 };
      }
      return item;
    });
    setCart(updated);
  };

  const decreaseQty = (barcode) => {
    const updated = cart
      .map((item) => (item.barcode === barcode ? { ...item, qty: item.qty - 1 } : item))
      .filter((item) => item.qty > 0);
    setCart(updated);
  };

  const removeItem = (barcode) => {
    const updated = cart.filter((item) => item.barcode !== barcode);
    setCart(updated);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.sellingPrice * item.qty, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">
          <h1 className="text-2xl font-bold mb-6">POS Billing System</h1>
          
          <input
            type="text"
            placeholder="Scan barcode..."
            value={barcode}
            onChange={handleChange}
            onKeyDown={handleKeyDown} 
            autoFocus
            className="w-full border border-gray-300 p-3 rounded-md mb-6 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Expiry</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-500">
                      Scan product barcode to add items
                    </td>
                  </tr>
                )}
                {cart.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-3">₹{item.sellingPrice}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => decreaseQty(item.barcode)} className="bg-red-500 text-white px-2 rounded cursor-pointer">-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => increaseQty(item.barcode)} className="bg-green-500 text-white px-2 rounded cursor-pointer">+</button>
                      </div>
                    </td>
                    <td className="p-3">₹{item.sellingPrice * item.qty}</td>
                    <td className="p-3">
                      <button onClick={() => removeItem(item.barcode)} className="bg-gray-700 text-white px-3 py-1 rounded text-sm cursor-pointer">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6">Bill Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Discount (%)</span>
              <input 
                type="number" 
                value={discount} 
                onChange={(e) => setDiscount(e.target.value)} 
                className="border p-1 rounded w-20 text-center focus:outline-none focus:ring-1 focus:ring-green-500" 
                min="0" 
                max="100" 
              />
            </div>
            
            <div className="flex justify-between text-red-500">
              <span>Discount Amount</span>
              <span>- ₹{discountAmount.toFixed(2)}</span>
            </div>
            
            <hr />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <button 
                onClick={() => setPaymentMethod("cash")} 
                className={`flex-1 px-4 py-2 rounded cursor-pointer ${paymentMethod === "cash" ? "bg-green-600 text-white" : "bg-gray-200"}`}
              >
                Cash
              </button>
              <button 
                onClick={() => setPaymentMethod("card")} 
                className={`flex-1 px-4 py-2 rounded cursor-pointer ${paymentMethod === "card" ? "bg-green-600 text-white" : "bg-gray-200"}`}
              >
                Card
              </button>
              <button 
                onClick={() => setPaymentMethod("upi")} 
                className={`flex-1 px-4 py-2 rounded cursor-pointer ${paymentMethod === "upi" ? "bg-green-600 text-white" : "bg-gray-200"}`}
              >
                UPI
              </button>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (cart.length === 0) {
                toast.error("Cart is empty!");
                return;
              }
              createSale();
            }}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg cursor-pointer transition-colors"
          >
            Generate Bill
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default POS;