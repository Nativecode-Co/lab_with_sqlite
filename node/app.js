const express = require("express");
// get routes form pdf/routes.js
// const pdfRoutes = require("./pdf/routes");

app = express();

// use routes
// app.use("/print", pdfRoutes);

app.use('/', (req, res, next) => {
  res.send('Hello World');
})


app.listen(3000, () => {
  console.log(`Server is listening on port 3000`);
});
