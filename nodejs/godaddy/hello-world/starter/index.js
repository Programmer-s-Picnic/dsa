const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  res.end("Hello World! Welcome to Programmer's Picnic.");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
