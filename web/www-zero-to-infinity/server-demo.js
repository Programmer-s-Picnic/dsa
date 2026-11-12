"use strict";
// WWW Zero to Infinity — local Express demo with a real server session.
// This is an identity-free teaching demonstration, NOT production login.
const express = require("express");
const session = require("express-session");
const crypto = require("node:crypto");
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const secret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(session({
  name:"www_demo_sid", secret, resave:false, saveUninitialized:false,
  cookie:{httpOnly:true, sameSite:"lax", secure:false, maxAge:30*60*1000}
}));
function escapeHtml(value) {
 return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;")
   .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}
app.get("/",(req,res)=>{
 const name=req.session.displayName;
 res.type("html").send(`
  <h1>WWW demonstration</h1>
  <p>${name ? "Hello, "+escapeHtml(name) : "You are a guest."}</p>
  <form method="post" action="/login">
    <label>Demo name: <input name="displayName" maxlength="40" required></label>
    <button>Enter demonstration</button>
  </form>
  <p><a href="/api/status">JSON API</a></p>
  <p><a href="/protected">Protected page</a></p>
  <form method="post" action="/logout"><button>Logout</button></form>
 `);
});
app.post("/login",(req,res,next)=>{
 const name=String(req.body.displayName||"").trim();
 if(!name||name.length>40)return res.status(400).type("text/plain").send("Invalid demo name");
 req.session.regenerate(err=>{
  if(err)return next(err);
  req.session.displayName=name;
  req.session.save(err=>err?next(err):res.redirect("/"));
 });
});
app.get("/protected",(req,res)=>{
 if(!req.session.displayName)return res.status(401).type("text/plain").send("Enter demo first");
 return res.type("text/plain").send("Protected demo: hello "+req.session.displayName);
});
app.get("/api/status",(req,res)=>{
 res.json({hasDemoSession:Boolean(req.session.displayName),displayName:req.session.displayName||null});
});
app.post("/logout",(req,res,next)=>{
 req.session.destroy(err=>{
  if(err)return next(err);
  res.clearCookie("www_demo_sid",{path:"/"});
  res.redirect("/");
 });
});
app.listen(PORT,"127.0.0.1",()=>console.log("Visit http://localhost:"+PORT));
