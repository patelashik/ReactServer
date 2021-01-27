require("dotenv").config();
const express = require("express");
const cors = require("cors");
const auth = require("./routes/auth");
const user = require("./routes/user");
const complain = require("./routes/complain");
const db = require("./utils/db.config");
const errorHandler = require("./middleware/errorhandle");

const app = express();

db();
app.use(express.json());
app.use(cors());

app.use("/auth", auth);//login or signup route
app.use("/user", user);
//keep collections for private and public complains as different considering security

//commenting out this part since this has already been implemented in controller part
//app.use('/:id/private',privateComplain);//req.params.id
app.use("/complain", complain);

app.use(errorHandler);

const PORT = process.env.PORT || 55000;
app.listen(
  PORT,
  console.log(`server started in ${process.env.NODE_ENV} mode at port ${PORT}`)
);