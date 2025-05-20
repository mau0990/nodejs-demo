const express = require("express");
const bodyParser = require("body-parser");
const HttpError = require("./models/httpError");
const placeRouter = require("./routes/places-routes");
const usersRouter = require("./routes/users-routes");

const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Acces-Control-Allow-Origin", "*");
  res.setHeader(
    "Acces-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Autthorization"
  );
  res.setHeader("Acces-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  next();
});

app.use("/api/places", placeRouter);
app.use("/api/users", usersRouter);

app.use((req, res, next) => {
  const error = new HttpError("Could not found this route", 404);
  return next(error);
});

app.use((error, req, res, next) => {
  // Case response has already been sent
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknow error occurred!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@anguloapps.xwmk1.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.DB_NAME}`
  )
  .then(() => {
    app.listen(process.env.PORT);
  })
  .catch((error) => console.log(error));
