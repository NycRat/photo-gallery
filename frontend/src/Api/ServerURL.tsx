const ServerURL =
  process.env.NODE_ENV === "production"
    ? "https://container-service-1.vn5jercmc73d4.us-west-2.cs.amazonlightsail.com/api/photo_gallery"
    : "http://localhost:8000/api/photo_gallery";

export default ServerURL;
