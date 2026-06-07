const hostName = "Champak Roy Programmer's Picnic";

export default {
  async fetch(request,env,ctx) {
let id="not found";
try{
   const id = env.CHAT_ROOM.idFromName("main");

      // This gives you a stub/reference to that Durable Object
      const room = env.CHAT_ROOM.get(id);
}
catch(error)
{
  id=error;
}
    const requestUrl = new URL(request.url);
    const upgradeHeader = request.headers.get("Upgrade");

    const websocketUrl = "wss://" + requestUrl.host + "/";

    if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];

      server.accept();

      server.send("Connected to " + hostName + " WebSocket");

      server.addEventListener("message", (event) => {
        server.send(`Echo from ${ hostName} : ${ event.data} ${id} ${env} ${ctx}`);
      });

      server.addEventListener("close", () => {
        console.log("WebSocket closed");
      });

      server.addEventListener("error", (error) => {
        console.log("WebSocket error:", error);
      });

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }

    return new Response(
      "HTTP is working.\n" +
        "WebSocket URL: " + websocketUrl + "\n" +
        "Host: " + hostName,
      {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store"
        }
      }
    );
  }
};


export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const upgradeHeader = request.headers.get("Upgrade");

    if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket request", {
        status: 426
      });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
  server.accept();

    server.send("Connected to Durable Object");

    server.addEventListener("message", (event) => {
      server.send("Echo from Durable Object: " + event.data);
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
}