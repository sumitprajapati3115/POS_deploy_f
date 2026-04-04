import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product";
import AddProduct from "./pages/AddProduct";
import Sales from "./pages/Sales";
import POS from "./pages/Pos";
import Purchase from "./pages/Purchase";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      {/* Toast Container */}
      <Toaster position="top-right" />

      <Routes>
        {/* Login page WITHOUT sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* Protected routes WITH sidebar */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/products" element={<Product />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchase" element={<Purchase />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
