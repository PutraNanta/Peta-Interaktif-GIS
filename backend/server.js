require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

// Database Test Sync
const db = require("./models");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    // Pada production/nyata, pertimbangkan untuk hanya memanggil koneksi
    // dan menghindari sinkronisasi otomatis mengubah seluruh skema tanpa migrasi.
    // await db.sequelize.authenticate();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
