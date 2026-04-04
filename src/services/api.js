import axios from "axios";
import baseUrl from "./baseUrl";


const API = axios.create({
  baseURL: baseUrl
});

API.interceptors.request.use((req) => {

  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;