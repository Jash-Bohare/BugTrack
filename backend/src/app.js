const express = require("express");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const issueRoutes = require("./routes/issue.routes");
const commentRoutes = require("./routes/comment.routes");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/issue", issueRoutes);
app.use("/api/comment", commentRoutes);

module.exports = app;
