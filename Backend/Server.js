 require("dotenv").config();
const express=require("express");
const cors=require("cors");
const connectDB=require("./config/db.js");
const authRoutes=require("./routes/authRoutes");
const tt=require("./routes/TimetableRoutes.js")
const DashboardHome=require("./routes/DashboardHome.js")
const classRoutes = require("./routes/ClassRoutes.js");
const teacher = require("./routes/teacherRoutes");
const app=express();
app.use(cors({
    origin:"http://localhost:5173"
}))
app.use(express.json());
connectDB();
app.get("/", (req, res) => {
  res.send("MAIMT Timetable API is running");
});
app.use("/api/auth",authRoutes);
app.use("/api/timetables",tt);
app.use("/api/teachers", teacher);
app.use("/api/Dashboard",DashboardHome);
app.use("/api/classes", classRoutes);
app.get("/",(req,res)=>{
    res.send("MAIMT timetable is running")
})
const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log("server is running");
})