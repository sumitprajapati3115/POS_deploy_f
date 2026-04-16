import { useState } from "react";
import { useRef, useEffect } from "react";
import API from "../services/api";
import jsPDF from "jspdf";

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

    const billHTML = `
 
 <html>
 <head>
 <title>Receipt</title>

 <style>

 body{
  font-family: monospace;
  width:300px;
  margin:auto;
 }

 h2{
  text-align:center;
 }

 table{
  width:100%;
  border-collapse:collapse;
 }

 td{
  padding:4px 0;
 }

 .center{
  text-align:center;
 }

 .right{
  text-align:right;
 }

 hr{
  border-top:1px dashed black;
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
 <td>Item</td>
 <td class="right">Qty</td>
 <td class="right">Price</td>
 </tr>

 ${cart
   .map(
     (item) => `
 <tr>
 <td>${item.name}</td>
 <td class="right">${item.qty}</td>
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

 <p class="center">
 Thank You! Visit Again
 </p>

 <script>
 window.print()
 </script>

 </body>
 </html>

 `;

    const win = window.open("", "", "width=400,height=600");
    win.document.write(billHTML);
    win.document.close();
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
                          className="bg-red-500 text-white px-2 rounded  cursor-pointer"
                        >
                          -
                        </button>

                        <span>{item.qty}</span>

                        <button
                          onClick={() => increaseQty(item.barcode)}
                          className="bg-green-500 text-white px-2 rounded  cursor-pointer"
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
              <span>- ₹{discountAmount}</span>
            </div>

            <hr />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{total}</span>
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

         <button onClick={() => {
  createSale();
  printBill();
}} className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg cursor-pointer">
  Generate Bill
</button>
        </div>
      </div>
    </div>
  );
}

export default POS;

//   const generateBill = () => {
//     const doc = new jsPDF();

//     let y = 20;

//     doc.setFontSize(16);
//     doc.text("My Cosmetic Shop", 80, y);

//     y += 10;
//     doc.setFontSize(10);
//     doc.text("Lucknow, Uttar Pradesh", 80, y);

//     y += 10;
//     doc.text("Invoice", 95, y);

//     y += 15;

//     doc.text("Item", 20, y);
//     doc.text("Qty", 100, y);
//     doc.text("Price", 120, y);
//     doc.text("Total", 160, y);

//     y += 5;
//     doc.line(20, y, 190, y);

//     y += 10;

//     cart.forEach((item) => {
//       const itemTotal = item.price * item.qty;
//       const gst = itemTotal * 0;

//       doc.text(item.name, 20, y);
//       doc.text(String(item.qty), 100, y);
//       doc.text(`Rs. ${item.price}`, 120, y);
//       doc.text(`Rs. ${itemTotal}`, 160, y);

//       y += 10;
//     });

//     y += 10;
//     doc.line(20, y, 190, y);

//     y += 10;

//     const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
//     const gstTotal = subtotal * 0;
//     const grandTotal = subtotal + gstTotal;

//     doc.text(`Subtotal: Rs. ${subtotal}`, 140, y);

//     y += 10;
//     doc.text(`GST (18%): Rs. ${gstTotal.toFixed(2)}`, 140, y);

//     y += 10;
//     doc.setFontSize(12);
//     doc.text(`Total: Rs. ${grandTotal.toFixed(2)}`, 140, y);

//     doc.save("bill.pdf");
//   };
