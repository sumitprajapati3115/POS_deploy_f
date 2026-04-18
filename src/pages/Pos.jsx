import { useState, useRef } from "react";
import API from "../services/api";

function POS() {
  const typingTimeout = useRef(null);
  const lastInputTime = useRef(0);
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleChange = (e) => {
    const value = e.target.value;
    setBarcode(value);

    const now = Date.now();
    const timeDiff = now - lastInputTime.current;

    lastInputTime.current = now;

    // 🚀 If input is very fast → scanner
    if (timeDiff < 50) {
      clearTimeout(typingTimeout.current);
      fetchProduct(value);
      return;
    }

    // 🧠 Manual typing → debounce
    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      if (value.trim() !== "") {
        fetchProduct(value);
      }
    }, 500); // wait 500ms after typing stops
  };

  const fetchProduct = async (code) => {
    try {
      const res = await API.get(`/product/barcode/${code}`);
      const product = res?.data?.product;

      const existing = cart.find((item) => item.barcode === product.barcode);

      if (existing) {
        if (existing.qty >= product.stockQuantity) {
          alert("Stock limit reached");
          return;
        }

        setCart((prev) =>
          prev.map((item) =>
            item.barcode === product.barcode
              ? { ...item, qty: item.qty + 1 }
              : item,
          ),
        );
      } else {
        if (product.stockQuantity === 0) {
          alert("Out of stock");
          return;
        }

        setCart((prev) => [...prev, { ...product, qty: 1 }]);
      }

      setBarcode("");
    } catch (error) {
      console.log(error);
    }
  };

  const createSale = async () => {
    try {
      const items = cart.map((item) => ({
        productId: item._id, // backend expects productId
        quantity: item.qty, // backend expects quantity
      }));

      const subtotal = cart.reduce(
        (acc, item) => acc + item.sellingPrice * item.qty,
        0,
      );

      const discountAmount = (subtotal * discount) / 100;
      const total = subtotal - discountAmount;

      await API.post("/sale/create", {
        items,
        paymentMethod: paymentMethod, // required by backend
        discount: discountAmount,
      });

      console.log("Sale saved");

      // Sale save hone ke baad bill generate hoga
      generateBill();
    } catch (error) {
      console.error(error);
    }
  };

  const generateBill = () => {
    const subtotal = cart.reduce(
      (acc, item) => acc + item.sellingPrice * item.qty,
      0,
    );

    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gst = afterDiscount * 0;
    const total = afterDiscount + gst;

    // 🌟 Thermal Printer (58mm) ke hisaab se CSS Update kar di gayi hai 🌟
    const billHTML = `
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: monospace;
            width: 100%;
            max-width: 58mm; /* Printer ki exact width */
            margin: 0 auto;
            padding: 0;
            font-size: 12px;
            color: black;
          }
          h2 { text-align: center; font-size: 16px; margin-bottom: 2px; }
          p { margin: 2px 0; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          td { padding: 3px 0; font-size: 12px; }
          .center { text-align: center; }
          .right { text-align: right; }
          .left { text-align: left; }
          hr { border-top: 1px dashed black; margin: 5px 0; border-bottom: none; }
          
          /* Print Dialog ke margins hatane ke liye */
          @media print {
            @page { margin: 0; }
            body { margin: 0; padding: 2mm; }
          }
        </style>
      </head>
      <body>

        <h2>PINWEB COSMETICS</h2>
        <p class="center">
          Lucknow, Uttar Pradesh<br>
          GSTIN: 09XXXXX1234Z5
        </p>
        <hr/>

        <table>
          <tr>
            <td class="left"><b>Item</b></td>
            <td class="center"><b>Qty</b></td>
            <td class="right"><b>Price</b></td>
          </tr>
          ${cart
            .map(
              (item) => `
          <tr>
            <td class="left">${item.name.substring(0, 15)}</td> <td class="center">${item.qty}</td>
            <td class="right">Rs ${item.sellingPrice * item.qty}</td>
          </tr>
          `,
            )
            .join("")}
        </table>

        <hr/>

        <table>
          <tr>
            <td>Subtotal</td>
            <td class="right">Rs ${subtotal}</td>
          </tr>
          <tr>
            <td>Discount (${discount}%)</td>
            <td class="right">- Rs ${discountAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td>After Discount</td>
            <td class="right">Rs ${afterDiscount.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Payment</td>
            <td class="right">${paymentMethod.toUpperCase()}</td>
          </tr>
          <tr>
            <td><b>Total</b></td>
            <td class="right"><b>Rs ${total.toFixed(2)}</b></td>
          </tr>
        </table>

        <hr/>
        <p class="center">Thank You! Visit Again</p>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          }
        </script>
      </body>
      </html>
    `;

    const win = window.open("", "_blank", "width=350,height=500");
    if (win) {
      win.document.write(billHTML);
      win.document.close();
    } else {
      alert("Please allow popups to print the bill");
    }
  };

  const increaseQty = (barcode) => {
    const updated = cart.map((item) => {
      if (item.barcode === barcode) {
        if (item.qty >= item.stockQuantity) {
          alert("Stock limit reached");
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
      .map((item) =>
        item.barcode === barcode ? { ...item, qty: item.qty - 1 } : item,
      )
      .filter((item) => item.qty > 0);

    setCart(updated);
  };

  const removeItem = (barcode) => {
    const updated = cart.filter((item) => item.barcode !== barcode);
    setCart(updated);
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.sellingPrice * item.qty,
    0,
  );

  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE (Products) */}

        <div className="lg:col-span-2 bg-white rounded-xl shadow p-2">
          <h1 className="text-2xl font-bold mb-6">POS Billing System</h1>

          <input
            type="text"
            placeholder="Scan barcode..."
            value={barcode}
            onChange={handleChange}
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
                      {item.expiryDate
                        ? new Date(item.expiryDate).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td className="p-3">₹{item.sellingPrice}</td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decreaseQty(item.barcode)}
                          className="bg-red-500 text-white px-2 rounded cursor-pointer"
                        >
                          -
                        </button>

                        <span>{item.qty}</span>

                        <button
                          onClick={() => increaseQty(item.barcode)}
                          className="bg-green-500 text-white px-2 rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="p-3">₹{item.sellingPrice * item.qty}</td>

                    <td className="p-3">
                      <button
                        onClick={() => removeItem(item.barcode)}
                        className="bg-gray-700 text-white px-3 py-1 rounded text-sm cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE (Bill Summary) */}

        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6">Bill Summary</h2>

          <div className="space-y-3">
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
                className="border p-1 rounded w-20 text-center"
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
            
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`px-4 py-2 rounded ${
                  paymentMethod === "cash"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Cash
              </button>

              <button
                onClick={() => setPaymentMethod("card")}
                className={`px-4 py-2 rounded ${
                  paymentMethod === "card"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Card
              </button>

              <button
                onClick={() => setPaymentMethod("upi")}
                className={`px-4 py-2 rounded ${
                  paymentMethod === "upi"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                UPI
              </button>
            </div>
          </div>

          {/* 🌟 Yahan siraf createSale() call karna hai 🌟 */}
          <button
            onClick={() => {
              if (cart.length === 0) {
                alert("Cart is empty!");
                return;
              }
              createSale();
            }}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg cursor-pointer"
          >
            Generate Bill
          </button>
        </div>
      </div>
    </div>
  );
}

export default POS;