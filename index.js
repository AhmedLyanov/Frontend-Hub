const express = require("express");
const mongoose = require("mongoose")
const authRouter = require("./routes/auth.route")
const cors = require('cors');
const app = express();
require('dotenv').config();
app.use(express.json())
app.use("/auth", authRouter);
app.use('/uploads', express.static('uploads'));
app.use(cors({
    origin: "*"
}))

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.status(200).json({message:"worked"})
})

app.listen(PORT, () => {
  mongoose.connect(process.env.MONGODB_CONNECT || "mongodb://localhost:27017/")
  .then(() => console.log('DB connected'))
  .catch(() => console.error("Error connected",))
  console.log(`Server started, port:${PORT}`);
});
