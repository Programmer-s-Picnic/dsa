const hostName = "Champak Roy Programmer's Picnic";

export default {
  async fetch(request) {
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
                                                              server.send("Echo from " + hostName + ": " + event.data);
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