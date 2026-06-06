let host="Champak Roy Programmer's Picnic";
const url=`wss://shy-meadow-f207.champaksworld.workers.dev/`;
export default {
  async fetch(request) {
    const upgradeHeader = request.headers.get("Upgrade");

    if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];

      server.accept();

      server.send("Connected to Champak Roy's Websocket"); 

      server.addEventListener("message", (event) => {
        server.send("Echo: " + event.data);
      });

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }

    return new Response(
      `HTTP is working. WebSocket URL:${url} ${host}`,
      {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store"
        }
      }
    );
  }
};