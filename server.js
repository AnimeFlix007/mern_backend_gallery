const express = require("express");
const dotenv = require("dotenv");
const { urlencoded } = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const dbConnect = require("./config/db/dbConnect");
const userRoutes = require("./routes/userRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const pageNotFound = require("./middleware/error/pageNotFound");

dotenv.config();
const app = express();


// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "https://animixgallery.vercel.app");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Auhorization"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE"
//   );
//   next();
// });

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

app.use("/api/users", userRoutes);
app.use("/api/gallery", galleryRoutes);

app.use(pageNotFound);
//error middleware
app.use(errorMiddleware);

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// 7hIbHbZCS9DZxxvB
