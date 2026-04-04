import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  PlusSquare,
  ShoppingCart,
  Receipt,
  Menu,
} from "lucide-react";

export default function Sidebar({open, setOpen}) {
  

  const linkClass = "flex items-center gap-3 px-3 py-2 rounded-md transition";

  const activeClass = "bg-white text-green-600 font-semibold";

  const normalClass = "hover:bg-green-600 hover:text-white";

  return (
    <div
      className={`${
        open ? "w-64" : "w-20"
      } h-screen bg-green-500 text-white p-4 fixed left-0 top-0 transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        {open && <h1 className="text-xl font-bold">POS System</h1>}

        <button
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-green-600 rounded"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Menu */}
      <nav className="space-y-3">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          <LayoutDashboard size={20} />
          {open && "Dashboard"}
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          <Package size={20} />
          {open && "Products"}
        </NavLink>

        <NavLink
          to="/add-product"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          <PlusSquare size={20} />
          {open && "Add Product"}
        </NavLink>

        <NavLink
          to="/sales"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          <ShoppingCart size={20} />
          {open && "Sales"}
        </NavLink>

        <NavLink
          to="/pos"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          <Receipt size={20} />
          {open && "Billing"}
        </NavLink>
      </nav>
    </div>
  );
}
