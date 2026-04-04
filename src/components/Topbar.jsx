export default function Topbar() {
  const logout = () => {
    localStorage.removeItem("token");

    window.location.href = "/login";
  };
  return (
    <div className="flex justify-between items-center bg-white shadow px-4 py-2">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <button
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}
