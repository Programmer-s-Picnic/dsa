/* Champuter Phase 2 + 3 — programming lessons + two programming quiz formats.
 * Additive enhancements only. Python runs in the existing Super Editor.
 * Quiz scoring, answer state and timers remain owned by the quiz engine.
 */
(()=>{
"use strict";
if(window.LWCChamputerPhase23)return;
const teacher=window.LWCChamputerBlog;
if(!teacher){return;}
const EDITOR="https://editor.learnwithchampak.live/python-starter/editor/super/";
const ARTICLE=".post-body";
const ROOT_QUIZ=".lwc-quiz";
const MAX_CODE=11000,MAX_TRANSFER=12000;
const MAX_SCAN=100;
const markers={code:"data-lwc-champuter-code",quiz:"data-lwc-champuter-quiz"};
const stats={codeBlocks:0,quizRoots:0,questions:0,reviews:0};
function clampText(v,max=1200){return String(v||"").replace(/\r\n?/g,"\n").slice(0,max);}
function normalized(v){return String(v||"").replace(/\s+/g," ").trim();}
function text(tag,cls,content){
 const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=String(content);return n;
}
function safeRoot(node){return node?.closest?.(ARTICLE);}
function pythonSource(pre){
 if(!pre||pre.closest(ROOT_QUIZ)||pre.closest(".cs-app,.lwc-card-studio,.lwc-speak-content-bar"))return "";
 const className=(pre.className+" "+(pre.querySelector("code")?.className||"")).toLowerCase();
 if(/\b(?:language-|lang-)(?:javascript|js|java|html|css|sql|xml|json|bash|shell|php)\b/.test(className))return "";
 const s=String(pre.querySelector("code")?.textContent||pre.textContent||"").replace(/\r\n?/g,"\n")
   .replace(/^\n+|\n+$/g,"");
 if(!s||s.length>MAX_CODE)return "";
 const explicit=/\b(?:language-|lang-)py(?:thon)?\b/.test(className)||pre.dataset.language==="python";
 const clues=[/^\s*(?:from\s+\S+\s+import\s+|import\s+[a-z_]\w*|def\s+[a-z_]\w*\s*\(|class\s+[a-z_]\w*[\s(:]|print\s*\(|for\s+\w+.+\bin\b.+:|while\s+.+:|if\s+.+:|elif\s+.+:|else\s*:|with\s+.+:|try\s*:|except\s+.*:)/m,
   /\b(?:pd\.DataFrame|pd\.read_csv|numpy|pandas|np\.array|plt\.plot|plt\.show|range\s*\(|input\s*\()/,
   /^(?:\s*[a-zA-Z_]\w*\s*=\s*(?:\[[^\n]*\]|\{[^\n]*\}|[0-9'"][^\n]*))\s*$/m];
 if(!explicit&&!clues.some(p=>p.test(s)))return "";
 return s;
}
function codeTopics(s){
 const items=[];
 if(/^\s*(?:import|from\s+\S+\s+import)\s+/m.test(s))items.push("Imports bring reusable Python libraries into the program.");
 if(/(?:^|\n)\s*[a-zA-Z_]\w*(?:\s*,\s*\w+)*\s*=(?!=)/.test(s))items.push("Assignments create or update variable values.");
 if(/\b(?:for|while)\b[^\n]*:/.test(s))items.push("The loop repeats statements; follow one iteration at a time.");
 if(/\b(?:if|elif)\b[^\n]*:/.test(s))items.push("A condition selects which block executes.");
 if(/^\s*def\s+\w+\s*\(/m.test(s))items.push("The function definition names reusable instructions.");
 if(/^\s*class\s+\w+/m.test(s))items.push("The class defines a reusable object type.");
 if(/(?:print|display)\s*\(/.test(s))items.push("Output functions display the program's result.");
 if(/(?:DataFrame\s*\(|read_csv\s*\(|groupby\s*\(|sort_values\s*\()/i.test(s))items.push("Pandas operations work with table-like DataFrames.");
 if(/\b(?:append|extend|insert|remove|pop)\s*\(/.test(s))items.push("Collection methods modify lists or other containers.");
 if(/\b(?:try|except)\b[^\n]*:/.test(s))items.push("Exception handling manages errors.");
 return items.length?items.slice(0,7):["Read each statement in execution order and track its effect on variables."];
}
function codeHeader(pre){
 const label=pre.closest(".post-body")?.querySelector("h1,h2,h3")?.textContent;
 return ("Learn With Champak · "+normalized(label||document.title||"Python example")).slice(0,105);
}
function encodedURL(source,action,title){
 const payload=JSON.stringify({code:source,stdin:"",title});
 const base64=btoa(unescape(encodeURIComponent(payload)))
   .replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
 if(base64.length>MAX_TRANSFER)return "";
 return EDITOR+"#"+base64;
}
async function sendToEditor(pre,action){
 const source=pythonSource(pre);
 if(!source)return;
 const title=codeHeader(pre);
 const url=encodedURL(source,action,title);
 if(url){
   const a=document.createElement("a");
   a.href=url;a.target="_blank";a.rel="noopener noreferrer";
   a.style.display="none";document.body.appendChild(a);a.click();a.remove();
   const message=action==="visualize"?
     "The example is ready to open in the Python Super Editor. Press Visualize there to execute it and let Champuter explain the real results.":
     "The example is ready in the Python Super Editor. Press Run there to execute it.";
   teacher.announce(message,pre,{status:"Python example sent to the Editor"});
   return;
 }
 // Large examples exceed safe link size. Copy first, then open the editor.
 try{
   await navigator.clipboard.writeText(source);
   const a=document.createElement("a");a.href=EDITOR;a.target="_blank";a.rel="noopener noreferrer";
   a.style.display="none";document.body.appendChild(a);a.click();a.remove();
   teacher.announce("This example was too large for a share link. I copied it to your clipboard. Paste it in the Python Editor, then press Run or Visualize.",pre);
 }catch(_e){
   teacher.announce("This example is too large for an editor link. Select the code, copy it, and paste it into the Python Super Editor.",pre);
 }
}
function augmentCode(pre){
 if(!safeRoot(pre)||pre.hasAttribute(markers.code))return;
 const source=pythonSource(pre);
 if(!source)return;
 pre.setAttribute(markers.code,"true");
 const wrap=text("div","lwc-champuter-code-tools");
 wrap.setAttribute("role","group");wrap.setAttribute("aria-label","Champuter Python example tools");
 const label=text("strong","lwc-champuter-code-title","🐍 Python · Champuter");
 wrap.append(label);
 for(const [action,caption,tip] of [
  ["explain","Explain","Explain the Python statements"],
  ["run","Run in Editor","Open this program in the Python Super Editor"],
  ["visualize","Visualize","Open this program with the Visualize action available"]]){
   const button=text("button","lwc-champuter-code-btn",caption);
   button.type="button";button.dataset.champuterCodeAction=action;button.title=tip;wrap.append(button);
 }
 const details=text("div","lwc-champuter-code-details");
 details.hidden=true;details.setAttribute("role","status");details.setAttribute("aria-live","polite");
 wrap.append(details);
 pre.insertAdjacentElement("beforebegin",wrap);
 wrap._sourcePre=pre;
 stats.codeBlocks++;
}
function explainCode(button){
 const wrap=button.closest(".lwc-champuter-code-tools"),pre=wrap?._sourcePre;
 if(!pre)return;
 const source=pythonSource(pre);
 if(!source)return;
 const notes=codeTopics(source);
 const area=wrap.querySelector(".lwc-champuter-code-details");
 area.replaceChildren();
 area.append(text("strong","","Champuter's code walkthrough"));
 const list=text("ol","");
 notes.forEach(line=>list.append(text("li","",line)));
 area.append(list);
 area.hidden=false;
 teacher.announce("Let's study this Python example. "+notes.join(" "),pre,{
   status:"Explaining the Python code; use Run or Visualize to test it."
 });
}
function quizType(card,root){
 const url=String(root.dataset.questionsUrl||"").toLowerCase();
 const title=normalized(root.querySelector(".lwc-hero h1")?.textContent||"").toLowerCase();
 if(card.querySelector(".lwc-options pre code"))return "output-to-code";
 if(card.querySelector(":scope > pre code")||card.querySelector(":scope > pre"))return "code-to-output";
 if(/output[- ]to[- ]code/.test(url+" "+title))return "output-to-code";
 if(/code[- ]to[- ]output/.test(url+" "+title))return "code-to-output";
 return "";
}
function questionHint(card,kind){
 const code=card.querySelector(":scope > pre code")?.textContent||"";
 if(kind==="output-to-code"){
   const output=card.querySelector(":scope > pre code")?.textContent||"";
   const cues=["Study the required output first. Compare what each candidate program prints or returns, then eliminate programs whose operations produce a different shape or order."];
   if(/\[|\]|\(|\)|\{|\}/.test(output))cues.push("Look closely at whether the output is a list, tuple, dictionary, table or scalar.");
   if(/\n/.test(output))cues.push("Count the output rows or lines before comparing code options.");
   return cues.join(" ");
 }
 const hints=["Trace assignments and variable changes in order. Work through each loop and condition before predicting what print displays."];
 if(/\brange\s*\(/.test(code))hints.push("For range, reason about its starting point and excluded endpoint.");
 if(/\bif\b/.test(code))hints.push("Check which branch runs, without assuming every print executes.");
 if(/\b(?:for|while)\b/.test(code))hints.push("Track one iteration at a time.");
 if(/(?:DataFrame|groupby|sort_values|read_csv)/i.test(code))hints.push("Inspect DataFrame column names, ordering and filtering steps.");
 if(/\[[^\]]*:[^\]]*\]/.test(code))hints.push("Remember that slicing usually excludes the stop index.");
 return hints.join(" ");
}
function userFacingType(kind){return kind==="output-to-code"?"Output → Code":"Code → Output";}
function mountQuestion(card,root){
 if(card.dataset.champuterQuestion==="true")return;
 const kind=quizType(card,root);
 if(!kind)return;
 card.dataset.champuterQuestion="true";card.dataset.champuterKind=kind;
 const tools=text("div","lwc-champuter-quiz-help");
 tools.setAttribute("role","group");tools.setAttribute("aria-label","Champuter quiz learning tools");
 tools.append(text("span","lwc-champuter-quiz-format",userFacingType(kind)));
 for(const [act,caption] of [["read","Read Question"],["hint","Hint · No Answer"]]){
   const b=text("button","lwc-champuter-quiz-btn",caption);b.type="button";b.dataset.champuterQuizAction=act;tools.append(b);
 }
 const options=card.querySelector(".lwc-options");
 if(options)card.insertBefore(tools,options);
 else card.append(tools);
 stats.questions++;
}
function mountReview(card){
 if(card.dataset.champuterReview==="true")return;
 card.dataset.champuterReview="true";
 const tool=text("button","lwc-champuter-review-btn","🎓 Explain this review");
 tool.type="button";tool.dataset.champuterQuizAction="review";
 card.append(tool);stats.reviews++;
}
function explanationForReview(review){
 const status=normalized(review.querySelector("strong")?.textContent||"Your review");
 const notes=[...review.querySelectorAll("p")].find(p=>
  /^Explanation:/i.test(normalized(p.querySelector("strong")?.textContent||"")));
 const expl=normalized(notes?.textContent||"").slice(0,600);
 return status+". "+(expl||"Compare your selected response with the correct answer displayed in the review, then study what each operation does.");
}
function quizSummary(result){
 const score=normalized(result.querySelector(".lwc-score-circle")?.textContent||"");
 const heading=normalized(result.querySelector(".lwc-summary h2")?.textContent||"");
 return "Your test is complete. "+(score?"Score: "+score+". ":"")+
   (heading?heading+". ":"")+"Review your answers to identify which operations or output details need more practice.";
}
function scanQuiz(root){
 if(!root.isConnected)return;
 const live=root.querySelector(".lwc-test:not(.lwc-hidden)");
 if(live){
   const questions=[...live.querySelectorAll(".lwc-question")].slice(0,MAX_SCAN);
   questions.forEach(card=>mountQuestion(card,root));
   if(questions.some(card=>card.dataset.champuterQuestion==="true")){
     const top=live.querySelector(".lwc-topbar");
     if(top&&!live.querySelector(".lwc-champuter-quiz-notice")){
       const note=text("p","lwc-champuter-quiz-notice",
         "🎓 Champuter can read questions or give non-answer hints. The original quiz timer continues running.");
       top.insertAdjacentElement("afterend",note);
     }
   }
 }
 const result=root.querySelector(".lwc-result:not(.lwc-hidden)");
 if(result){
   const summary=result.querySelector(".lwc-summary");
   if(summary&&!result.querySelector(".lwc-champuter-score-tools")){
     const wrap=text("div","lwc-champuter-score-tools");
     const b=text("button","lwc-champuter-review-btn","🎓 Review test with Champuter");
     b.type="button";b.dataset.champuterQuizAction="summary";wrap.append(b);
     summary.insertAdjacentElement("afterend",wrap);
   }
   const area=result.querySelector(".lwc-review-area:not(.lwc-hidden)");
   if(area)[...area.querySelectorAll(".lwc-review")].slice(0,MAX_SCAN).forEach(mountReview);
 }
}
const quizObservers=new WeakMap();
function observeQuiz(root){
 if(quizObservers.has(root))return;
 const ob=new MutationObserver(()=>scheduleScan());
 ob.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
 quizObservers.set(root,ob);
 stats.quizRoots++;
 scanQuiz(root);
}
let pending=false;
function scheduleScan(){
 if(pending)return;
 pending=true;
 setTimeout(()=>{pending=false;scan();},70);
}
function scan(){
 document.querySelectorAll(ARTICLE+" pre").forEach(augmentCode);
 document.querySelectorAll(ROOT_QUIZ).forEach(observeQuiz);
 document.querySelectorAll(ROOT_QUIZ).forEach(scanQuiz);
}
function quizClick(btn){
 const card=btn.closest(".lwc-question"),root=btn.closest(ROOT_QUIZ);
 const kind=card?.dataset.champuterKind;
 if(btn.dataset.champuterQuizAction==="hint"&&card&&kind){
   teacher.announce(userFacingType(kind)+". "+questionHint(card,kind),card,{status:"Hint only: no answers revealed."});
 }else if(btn.dataset.champuterQuizAction==="read"&&card&&kind){
   const heading=normalized(card.querySelector("h3")?.textContent||"");
   const code=clampText(card.querySelector(":scope > pre code")?.textContent||"",500);
   const prompt=userFacingType(kind)+". "+heading+". "+
     (kind==="code-to-output"?"Read this code: ":"The required output is: ")+code;
   teacher.announce(prompt,card,{status:"Reading question; your timer remains active."});
 }else if(btn.dataset.champuterQuizAction==="review"){
   const review=btn.closest(".lwc-review");
   const section=root?.querySelector(".lwc-result:not(.lwc-hidden)");
   if(review&&section&&review.closest(".lwc-review-area:not(.lwc-hidden)"))
     teacher.announce(explanationForReview(review),review,{status:"Explaining submitted answer review."});
 }else if(btn.dataset.champuterQuizAction==="summary"){
   const result=btn.closest(".lwc-result:not(.lwc-hidden)");
   if(result)teacher.announce(quizSummary(result),result.querySelector(".lwc-summary")||result);
 }
}
document.addEventListener("click",event=>{
 const codeButton=event.target.closest?.("[data-champuter-code-action]");
 if(codeButton){
   const wrap=codeButton.closest(".lwc-champuter-code-tools");
   if(!wrap?._sourcePre)return;
   const action=codeButton.dataset.champuterCodeAction;
   if(action==="explain")explainCode(codeButton);
   else if(action==="run"||action==="visualize")void sendToEditor(wrap._sourcePre,action);
   return;
 }
 const quizButton=event.target.closest?.("[data-champuter-quiz-action]");
 if(quizButton){
   const action=quizButton.dataset.champuterQuizAction;
   if(!["hint","read","review","summary"].includes(action))return;
   quizClick(quizButton);
 }
});
function setup(){
 scan();
 // Quiz engine inserts questions asynchronously; the scoped observers do the
 // ongoing work. One lightweight discovery observer finds newly inserted roots.
 const observer=new MutationObserver(records=>{
   if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&
     (n.matches?.(ROOT_QUIZ+","+ARTICLE)||n.querySelector?.(ROOT_QUIZ+","+ARTICLE))))){
     scheduleScan();
   }
 });
 observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener("pagehide",()=>{observer.disconnect();document.querySelectorAll(ROOT_QUIZ).forEach(root=>quizObservers.get(root)?.disconnect())});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});
else setup();
window.LWCChamputerPhase23={scan,stats,pythonSource,codeTopics,quizType,questionHint,encodedURL};
})();
