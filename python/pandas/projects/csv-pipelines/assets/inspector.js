(()=>{"use strict";
const PROJECTS={
 "student-results":{first:"students.csv",extra:{2:["marks.csv"]},steps:[["Validate registration","Clean names and check student IDs; output a trusted registration table."],["Join subject marks","Merge marks from marks.csv, match IDs and verify marks lie between 0 and 100."],["Calculate scores","Compute totals and percentages; treat missing subject marks as incomplete."],["Grade and rank","Apply an explicit grading scale, then rank recorded totals."],["City performance","Add city averages and within-city ranks without losing student records."],["Publish report","Sort by total marks and export a consolidated report.csv."]]},
 "grocery-inventory":{first:"products.csv",extra:{2:["sales.csv"]},steps:[["Validate product master","Check each product ID, category, price and opening stock."],["Join sales","Aggregate sales quantities by product ID, including multiple transactions per item."],["Calculate stock","Subtract sold quantities and refuse to permit negative remaining stock."],["Calculate profit","Compute revenue, cost of goods, gross profit and margin."],["Category performance","Add category-wise revenue and profit, rank products in each category."],["Publish report","Order the full product report by profit and save report.csv."]]},
 "exam-analysis":{first:"responses.csv",extra:{1:["candidates.csv"],2:["answer_key.csv"]},steps:[["Validate candidate responses","Merge candidate details, standardise choices and prevent double answers."],["Merge answer key","Check every question and join subject, correct answer and scoring rules."],["Score responses","Give +marks for correct answers, −penalty for wrong, and zero for skipped."],["Analyse subjects","Summarise each candidate's correct, wrong, skipped and awarded marks by subject."],["Aggregate candidates","Combine subject totals to overall score, attempted accuracy and final rank."],["Publish merit list","Sort by rank, generate the final candidate report.csv."]]}
};
function parseCSV(source){
 const result=[],row=[];let token="",quoted=false;
 for(let i=0;i<source.length;i++){
  const c=source[i];
  if(c==='"'){if(quoted&&source[i+1]==='"'){token+='"';i++;}else quoted=!quoted;}
  else if(c===","&&!quoted){row.push(token);token="";}
  else if((c==="\n"||c==="\r")&&!quoted){
   if(c==="\r"&&source[i+1]==="\n")i++;
   row.push(token);token="";
   if(row.some(v=>v!==""))result.push([...row]);
   row.length=0;
  }else token+=c;
 }
 if(token!==""||row.length){row.push(token);result.push([...row]);}
 if(!result.length)return{cols:[],rows:[]};
 const [cols,...rows]=result;return{cols,rows};
}
function tableIn(target,data){
 target.replaceChildren();
 const table=document.createElement("table"),thead=document.createElement("thead"),tr=document.createElement("tr");
 for(const label of data.cols){const th=document.createElement("th");th.scope="col";th.textContent=label;tr.append(th);}
 thead.append(tr);table.append(thead);
 const body=document.createElement("tbody");
 for(const row of data.rows.slice(0,16)){const tr=document.createElement("tr");for(const v of row){const td=document.createElement("td");td.textContent=v||"—";tr.append(td);}body.append(tr);}
 table.append(body);target.append(table);
 const foot=document.createElement("p");foot.className="muted";foot.textContent=data.rows.length+" rows · "+data.cols.length+" columns"+(data.rows.length>16?" · first 16 shown":"");target.append(foot);
}
for(const node of document.querySelectorAll("[data-inspector]")){
 const picker=node.querySelector("[data-inspector-project]"),stages=node.querySelector("[data-inspector-stage]");
 const summary=node.querySelector("[data-inspector-info]"),input=node.querySelector("[data-input-table]"),output=node.querySelector("[data-output-table]");
 const inLink=node.querySelector("[data-input-link]"),outLink=node.querySelector("[data-output-link]");
 let generation=0;
 async function update(){
  const my=++generation,project=node.dataset.fixedProject||(picker&&picker.value),number=Number(stages.value);
  const config=PROJECTS[project];if(!config)return;
  const parent=node.dataset.fixedProject?"./":"./"+project+"/";
  const src=number===1?"input/"+config.first:"output/stage"+String(number-1).padStart(2,"0")+".csv";
  const dst="output/"+(number===6?"report.csv":"stage"+String(number).padStart(2,"0")+".csv");
  const detail=config.steps[number-1],additional=(config.extra[number]||[]).map(f=>"input/"+f);
  const srcUrl=parent+src,dstUrl=parent+dst;
  inLink.href=srcUrl;inLink.textContent=src;outLink.href=dstUrl;outLink.textContent=dst;
  summary.textContent="Stage "+number+": "+detail[0]+". "+detail[1]+(additional.length?" Additional CSV: "+additional.join(", "):"");
  input.textContent="Loading CSV…";output.textContent="Loading CSV…";
  const responses=await Promise.allSettled([fetch(srcUrl),fetch(dstUrl)]);
  const destinations=[input,output];
  for(let i=0;i<2;i++){
   if(my!==generation)return;
   const r=responses[i];if(r.status!=="fulfilled"||!r.value.ok){destinations[i].textContent="Unable to load sample CSV. Use the file link above.";continue;}
   try{tableIn(destinations[i],parseCSV(await r.value.text()));}catch(e){destinations[i].textContent="Unable to display this CSV.";}
  }
 }
 stages.addEventListener("change",update);if(picker)picker.addEventListener("change",update);
 update();
}
})();
