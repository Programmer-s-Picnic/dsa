(()=>{"use strict";
const tasks={
1:{input:"input/student_marks.csv",outputs:["output/passed.csv","output/failed.csv"],note:"Gatekeeper: every subject must have at least 40 marks to pass."},
2:{input:"output/passed.csv",outputs:["output/meritlist.csv"],note:"Merit Maker: calculate totals, percentage and competition ranks."},
3:{input:"output/meritlist.csv",outputs:["output/top_ten.csv"],note:"Topper Finder: ten candidates maximum, deterministic tie-breaks."},
4:{input:"output/failed.csv",outputs:["output/failed-inmaths.csv","output/failed-inscience.csv","output/failed-inenglish.csv"],note:"Remedial Analyst: students can appear in multiple subject files."}
};
const select=document.getElementById("agent-selector");
const out=document.getElementById("agent-output");
const desc=document.getElementById("agent-file-summary");
const inputLink=document.getElementById("agent-input-link");
const outputLink=document.getElementById("agent-output-link");
const inputBox=document.getElementById("agent-input-table");
const outputBox=document.getElementById("agent-output-table");
if(!select||!out)return;
function readCSV(text){
 const data=[];let cells=[],field="",quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
  else if(c===","&&!quoted){cells.push(field);field="";}
  else if((c==="\n"||c==="\r")&&!quoted){
   if(c==="\r"&&text[i+1]==="\n")i++;
   cells.push(field);field="";
   if(cells.some(x=>x!==""))data.push(cells);
   cells=[];
  }else field+=c;
 }
 if(cells.length||field){cells.push(field);data.push(cells);}
 return data;
}
function showCSV(target,source){
 const rows=readCSV(source),table=document.createElement("table"),thead=document.createElement("thead"),tr=document.createElement("tr");
 target.replaceChildren();
 if(!rows.length){target.textContent="No rows found";return;}
 for(const col of rows[0]){const th=document.createElement("th");th.scope="col";th.textContent=col;tr.append(th);}
 thead.append(tr);table.append(thead);
 const body=document.createElement("tbody");
 for(const cells of rows.slice(1,17)){
  const row=document.createElement("tr");
  for(const c of cells){const td=document.createElement("td");td.textContent=c===""?"—":c;row.append(td);}
  body.append(row);
 }
 table.append(body);target.append(table);
 const note=document.createElement("p");note.className="muted";note.textContent=(rows.length-1)+" rows · "+rows[0].length+" columns · "+Math.min(rows.length-1,16)+" previewed";target.append(note);
}
let latest=0;
async function update(){
 const id=++latest,task=tasks[Number(select.value)];
 const ins="./"+task.input,outs="./"+out.value;
 inputLink.href=ins;inputLink.textContent=task.input;
 outputLink.href=outs;outputLink.textContent=out.value;
 desc.textContent=task.note+"   Input: "+task.input+" → Output: "+out.value;
 inputBox.textContent="Loading input…";outputBox.textContent="Loading output…";
 const res=await Promise.allSettled([fetch(ins),fetch(outs)]);
 for(let i=0;i<2;i++){
  if(id!==latest)return;
  const elem=i?outputBox:inputBox,p=res[i];
  if(p.status!=="fulfilled"||!p.value.ok){elem.textContent="CSV could not be loaded. Open the file link above.";continue;}
  try{const text=await p.value.text();if(id===latest)showCSV(elem,text);}catch(e){elem.textContent="Could not display CSV.";}
 }
}
function changeProgram(){
 const task=tasks[Number(select.value)];out.replaceChildren();
 for(const val of task.outputs){const option=document.createElement("option");option.value=val;option.textContent=val.split("/").pop();out.append(option);}
 update();
}
select.addEventListener("change",changeProgram);out.addEventListener("change",update);changeProgram();
})();
