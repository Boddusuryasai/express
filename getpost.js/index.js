const express = require("express");
const app = express();
const {posts} = require("./constant.js")

app.get("/post", (req, res) => {
  res.json(posts);
});


app.listen(3000, () => {
  console.log("Server started on port 3000");
});
