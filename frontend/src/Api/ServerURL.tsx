const ServerURL =
  process.env.NODE_ENV === "production" ? "https://photo-gallery-backend.herokuapp.com/api" : "http://localhost:8000/api";

export default ServerURL;
