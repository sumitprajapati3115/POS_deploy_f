import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const res = await API.post("/user/login", {
        email,
        password
      });

      const token = res.data.token;

      // save token
      localStorage.setItem("token", token);

      console.log("Login Success");
      toast.success("Login Successfull")

      navigate("/dashboard");

    } catch (error) {
      alert(error);
      toast.error("Something went wrong")
      console.log(error)
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-lg shadow w-96">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="text"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded"
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
}