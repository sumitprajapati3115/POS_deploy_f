import { useState } from "react";


import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Layout() {

  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Right Section */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          open ? "ml-64" : "ml-20"
        }`}
      >

        <Topbar />

        <main className="flex-1 overflow-y-auto p-1 bg-gray-100">
          <Outlet />
        </main>

      </div>

    </div>
  );
}