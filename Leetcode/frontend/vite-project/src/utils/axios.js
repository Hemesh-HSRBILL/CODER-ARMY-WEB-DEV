import axios from "axios";

const axiosClient = axios.create({
    baseURL:'http://localhost:7000',
    withCredentials: true, // Send cookies with requests.
    headers: {
        'Content-Type': 'application/json'
    } 
})

// Normalize: if the server replied with plain text, wrap it in { message: "..." }
axiosClient.interceptors.response.use(
  (res) => {
    if (typeof res.data === "string") {
      res.data = { message: res.data };
    }
    return res;
  },
  (err) => {
    // Same treatment for error bodies (400/500 come back as strings from your controllers)
    const d = err.response?.data;
    if (typeof d === "string") {
      err.response.data = { message: d };
    }
    return Promise.reject(err);
  }
);

//Your backend sometimes replies with plain text and sometimes with JSON.
// if backend res.send("Problem saved suceesfully")  browser receives: "Problem saved suceesfully" — just text, no structure.
// if backend res.json({ message: "ok", data: {...} }) → browser receives: { "message": "ok", "data": {...} } — structured.

//So the frontend gets two different shapes. Sometimes response.data is a string, sometimes it's an object. If a slice does response.data.message, it breaks on the string case, because strings don't have a .message.
// The interceptor fixes it An interceptor is a small function that runs after every response before your code sees it

// you think if i do What happens with 
// s.success = a.payload
//Create / Update → success is a string ✅ it not break work 
//Delete → success is an object ❌ its break beacsue it no plain text or string

export { axiosClient };
export default axiosClient;