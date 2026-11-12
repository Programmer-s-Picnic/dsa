"use strict";
/**
 * HTTP Status Codes — Local DevTools API Lab
 * Educational real HTTP responses with SIMULATED application conditions.
 * Start: npm install express && node status-server.js
 * Open: http://127.0.0.1:3000
 * Binds to localhost only. Never deploy publicly without a security review.
 */
const express = require("express");
const path = require("node:path");
const app = express();
const PORT = Number(process.env.PORT || 3000);
app.disable("x-powered-by");
app.use(express.json({limit:"32kb"}));
app.use(express.static(__dirname, {index:"playground.html", fallthrough:true}));
const definitions = {
  200:["OK","The server successfully returned a resource."],
  201:["Created","A new example resource was created."],
  202:["Accepted","The job was accepted, but is not necessarily finished."],
  204:["No Content","The server completed a request without a response body."],
  206:["Partial Content","Part of a resource was returned in response to a range request."],
  400:["Bad Request","Example of invalid request syntax or parameters."],
  401:["Unauthorized","The endpoint requires valid authentication."],
  403:["Forbidden","Access was refused."],
  404:["Not Found","The requested API resource does not exist."],
  409:["Conflict","The request conflicts with current resource state."],
  410:["Gone","The requested resource is no longer available."],
  412:["Precondition Failed","A request precondition was not met."],
  415:["Unsupported Media Type","This endpoint would not accept the body media type."],
  422:["Unprocessable Content","The request content is understood but cannot be processed."],
  429:["Too Many Requests","Rate limit exceeded for this demonstration."],
  500:["Internal Server Error","Simulated server failure, not an actual thrown exception."],
  502:["Bad Gateway","Simulated invalid upstream response, not an actual gateway error."],
  503:["Service Unavailable","Simulated temporary maintenance."],
  504:["Gateway Timeout","Simulated timeout from an upstream service."]
};
app.get("/api/status/:code", (req,res)=>{
  const code = Number(req.params.code);
  if(!Object.hasOwn(definitions,code)){
    return res.status(400).json({message:"Status not in this lesson's supported list"});
  }
  const [name,description]=definitions[code];
  res.set("Cache-Control","no-store");
  if(code===201)res.set("Location","/api/example-resource/42");
  if(code===401)res.set("WWW-Authenticate",'Bearer realm="ChamputerStatusLab"');
  if(code===429)res.set("Retry-After","10");
  if(code===503)res.set("Retry-After","30");
  if(code===204)return res.status(204).end();
  if(code===206){
    res.set("Accept-Ranges","bytes");
    res.set("Content-Range","bytes 0-9/28");
    return res.status(206).type("text/plain").send("0123456789");
  }
  return res.status(code).json({
    code,name,description,simulated:true,
    note:"The HTTP status is real. The cause is intentionally simulated for teaching.",
    time:new Date().toISOString()
  });
});
// A legitimate 405 for POST when only GET is supported.
app.get("/api/only-get",(req,res)=>res.json({message:"GET is allowed here"}));
app.post("/api/only-get",(req,res)=>{
  res.set("Allow","GET, HEAD, OPTIONS");
  return res.status(405).json({code:405,message:"This resource does not allow POST"});
});
// Redirect examples. 303 changes a POST to GET; 307/308 preserve method.
app.all("/api/redirect/:code",(req,res)=>{
  const code=Number(req.params.code);
  if(![301,302,303,307,308].includes(code))
    return res.status(400).json({error:"Try 301, 302, 303, 307 or 308"});
  res.redirect(code, "/api/redirect-target?from="+code);
});
app.all("/api/redirect-target",(req,res)=>{
  res.set("Cache-Control","no-store");
  return res.json({
    finalStatus:200,
    methodObserved:req.method,
    forwardedFrom:req.query.from||null,
    explanation:"The browser followed the redirect to this destination."
  });
});
// 304 must only appear when a cache validator matches.
// For a deterministic demo: curl -i -H 'If-None-Match: "champuter-lesson-v1"' URL
app.get("/api/cache-demo",(req,res)=>{
  res.set("ETag",'"champuter-lesson-v1"');
  res.set("Cache-Control","no-cache");
  if(req.get("If-None-Match")==='"champuter-lesson-v1"')return res.status(304).end();
  return res.json({lesson:"HTTP caching",version:1,explanation:"Try the next request with If-None-Match"});
});
app.get("/api/example-resource/42",(req,res)=>res.json({id:42,title:"Demonstration resource"}));
app.listen(PORT,"127.0.0.1",()=>{
  console.log("Open http://127.0.0.1:"+PORT+" to inspect real status codes.");
});
