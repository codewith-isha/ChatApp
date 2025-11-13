// const dotenv = require('dotenv')
// import axios from 'axios'

// const apiUrl = `${import.meta.env.REACT_APP_API_URL}/api`;

// const axiosInstance = axios.create({
//   baseURL:apiUrl,
//   withCredentials:true
// })

// export default axiosInstance;

import axios from "axios";

const apiUrl = `${import.meta.env.VITE_API_URL}/api`;

const axiosInstance = axios.create({
  baseURL: apiUrl, // ✅ must be capital "L"
  withCredentials: true, // ✅ needed for cookie/session handling
});

export default axiosInstance;

