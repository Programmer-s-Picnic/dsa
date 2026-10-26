import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';

const $ = id => document.getElementById(id);
const game = new Chess();
const files = 'abcdefgh', symbols = {wk:'♔',wq:'♕',wr:'♖',wb:'♗',wn:'♘',wp:'♙',bk:'♚',bq:'♛',br:'♜',bb:'♝',bn:'♞',bp:'♟'};
let mode='local', myColor=null, selected=null, legalTargets=[], promotionMoves=[], endReason='', cpuTask=null;
let peer=null, conn=null, host=false, connected=false, roomCode='', peerEpoch=0, opponentName='Friend';
let duration=600, remaining={w:600,b:600}, running=true, stamp=Date.now();
let scene, camera, renderer, controls, raycaster, pieceLayer, markerLayer;
const tiles = new Map();
const pickables = [];
const materials = {
  white: new THREE.MeshStandardMaterial({color:0xf8edd9,roughness:0.29,metalness:0.12}),
  black: new THREE.MeshStandardMaterial({color:0x25364b,roughness:0.26,metalness:0.20}),
  gold: new THREE.MeshStandardMaterial({color:0xc79849,roughness:0.34,metalness:0.6}),
  silver: new THREE.MeshStandardMaterial({color:0xa7b5c5,roughness:0.35,metalness:0.42})
};
function label(t){$('game-message').textContent=t;}
function connection(t){$('connection-label').textContent=t;}
function nickname(){return ($('player-name').value.trim()||'Player').slice(0,24);}
function resetClock(time){duration=time;remaining={w:time,b:time};stamp=Date.now();running=time>0;}
function settleClock(){
  if(!running||!duration||game.isGameOver()||endReason){stamp=Date.now();return;}
  const now=Date.now(), side=game.turn();
  remaining[side]=Math.max(0,remaining[side]-(now-stamp)/1000);
  stamp=now;
}
function clockSnapshot(){settleClock();return {w:remaining.w,b:remaining.b,running};}
function applyClock(c){if(!c||!Number.isFinite(c.w)||!Number.isFinite(c.b))return;remaining={w:Math.max(0,c.w),b:Math.max(0,c.b)};running=!!c.running;stamp=Date.now();}
function showClock(){
  const now=Date.now(), t=game.turn();
  for(const color of ['w','b']){
    const s=Math.max(0,remaining[color]-(running&&duration&&!endReason&&!game.isGameOver()&&t===color?(now-stamp)/1000:0));
    const text=duration?String(Math.floor(Math.ceil(s)/60)).padStart(2,'0')+':'+String(Math.ceil(s)%60).padStart(2,'0'):'∞';
    const e=$(color==='w'?'white-clock':'black-clock');e.textContent=text;
    e.classList.toggle('active',running&&t===color&&!game.isGameOver()&&!endReason);
    e.classList.toggle('low',duration>0&&s<30);
  }
}
function gameText(){
  if(endReason)return endReason;
  if(game.isCheckmate())return 'Checkmate — '+(game.turn()==='w'?'Black':'White')+' wins!';
  if(game.isStalemate())return 'Draw by stalemate.';
  if(game.isThreefoldRepetition())return 'Draw by threefold repetition.';
  if(game.isInsufficientMaterial())return 'Draw: insufficient material.';
  if(game.isDraw())return 'Game drawn.';
  return (game.turn()==='w'?'White':'Black')+' to move'+(game.isCheck()?' — Check!':'');
}
function canMove(){
  return !endReason&&!game.isGameOver()&&(mode!=='online'||connected)&&!(mode==='computer'&&game.turn()==='b')&&(mode!=='online'||game.turn()===myColor);
}
function refresh(){
  selected=null;legalTargets=[];promotionMoves=[];
  $('promotion-dialog').classList.add('hidden');
  $('turn-label').textContent=gameText();
  const history=game.history();
  $('move-count').textContent=history.length+' moves';
  const list=$('move-list');list.replaceChildren();
  if(!history.length){const p=document.createElement('p');p.className='empty';p.textContent='The opening move is yours.';list.append(p);}
  history.forEach((m,i)=>{const item=document.createElement('div');item.className='move';item.textContent=(i%2===0?Math.floor(i/2)+1+'. ':'')+m;list.append(item);});
  list.scrollTop=list.scrollHeight;
  $('mode-name').textContent=mode==='online'?'Online private room':mode==='computer'?'Play against computer':'Local two-player game';
  $('black-label').textContent=mode==='computer'?'Computer':mode==='online'?(host?opponentName:nickname()):'Black';
  $('white-label').textContent=mode==='online'?(host?nickname():opponentName):mode==='computer'?nickname():'White';
  $('white-caption').textContent=mode==='online'?(host?'Room host':'Opponent'):'White pieces';
  $('black-caption').textContent=mode==='online'?(host?'Your opponent':'You are Black'):mode==='computer'?'Automated opponent':'Black pieces';
  $('time-control').disabled=mode==='online';
  $('resign-btn').disabled=game.isGameOver()||!!endReason||(mode==='online'&&!connected);
  if(scene)drawPieces();
  showClock();
}
function clearNetwork(){
  peerEpoch++;const oldPeer=peer, oldConn=conn;
  peer=null;conn=null;connected=false;host=false;roomCode='';
  $('invite').classList.add('hidden');
  try{oldConn?.close();}catch{}
  try{oldPeer?.destroy();}catch{}
}
function cancelAI(){if(cpuTask!==null){clearTimeout(cpuTask);cpuTask=null;}}
function startLocal(){
  clearNetwork();cancelAI();mode='local';myColor=null;game.reset();endReason='';
  resetClock(Number($('time-control').value));connection('Local game');label('Pass the device between players. White moves first.');refresh();
}
function startComputer(){
  clearNetwork();cancelAI();mode='computer';myColor='w';game.reset();endReason='';
  resetClock(Number($('time-control').value));connection('Computer opponent');label('You are White. Make your first move.');refresh();
}
function send(data){if(conn?.open){try{conn.send(data);}catch{label('Unable to send move. Check the connection.');}}}
function finish(reason,notify=true){
  if(endReason)return;
  settleClock();endReason=reason;running=false;cancelAI();refresh();label(reason);
  if(notify&&mode==='online')send({type:'finish',reason});
}
function play(move,remote=false){
  if(endReason||game.isGameOver())return false;
  if(!remote&&!canMove())return false;
  settleClock();
  if(duration&&remaining[game.turn()]<=0){finish('Time expired — '+(game.turn()==='w'?'Black':'White')+' wins.');return false;}
  let played;try{played=game.move(move);}catch{return false;}
  if(!played)return false;
  const snapshot=clockSnapshot();
  if(mode==='online'&&!remote)send({type:'move',move:{from:played.from,to:played.to,promotion:played.promotion||undefined},clock:snapshot});
  stamp=Date.now();
  refresh();
  label(game.isGameOver()?gameText():played.san+' — '+gameText());
  if(mode==='computer'&&game.turn()==='b'&&!game.isGameOver())cpuTask=setTimeout(cpuMove,450);
  return true;
}
function choose(square){
  if(!canMove()){label(mode==='online'&&!connected?'Waiting for your opponent to connect.':'Wait for your turn.');return;}
  if(promotionMoves.length)return;
  const p=game.get(square),friendly=p&&p.color===game.turn();
  if(selected&&legalTargets.some(m=>m.to===square)){
    const choices=legalTargets.filter(m=>m.to===square);
    if(choices.some(m=>m.promotion)){
      promotionMoves=choices;
      const root=$('promotion-choices');root.replaceChildren();
      choices.forEach(m=>{const b=document.createElement('button');b.type='button';b.textContent=symbols[m.color+m.promotion];b.title='Promote to '+m.promotion.toUpperCase();b.setAttribute('aria-label',b.title);b.addEventListener('click',()=>{promotionMoves=[];play({from:m.from,to:m.to,promotion:m.promotion});});root.append(b);});
      $('promotion-dialog').classList.remove('hidden');return;
    }
    play({from:selected,to:square});return;
  }
  if(friendly){
    selected=square;legalTargets=game.moves({square,verbose:true});
    markSquares();
    label(legalTargets.length?'Choose a highlighted square.':'This piece has no legal moves.');
  }else{selected=null;legalTargets=[];markSquares();}
}
function evaluate(){
  const weights={p:100,n:315,b:330,r:500,q:900,k:0};
  return game.board().flat().reduce((score,p)=>score+(p?(p.color==='b'?1:-1)*weights[p.type]:0),0);
}
function aiScore(depth,alpha=-Infinity,beta=Infinity){
  if(game.isCheckmate())return game.turn()==='b'?-99999:99999;
  if(game.isGameOver())return 0;
  if(depth===0)return evaluate();
  const max=game.turn()==='b';let best=max?-Infinity:Infinity;
  for(const m of game.moves({verbose:true})){
    game.move(m);const v=aiScore(depth-1,alpha,beta);game.undo();
    best=max?Math.max(best,v):Math.min(best,v);
    if(max)alpha=Math.max(alpha,best);else beta=Math.min(beta,best);
    if(alpha>=beta)break;
  }
  return best;
}
function cpuMove(){
  cpuTask=null;if(mode!=='computer'||game.turn()!=='b'||game.isGameOver()||endReason)return;
  const options=game.moves({verbose:true});if(!options.length)return;
  const difficulty=Number($('difficulty').value);let candidate=options[Math.floor(Math.random()*options.length)];
  if(difficulty>1){
    let best=-Infinity;
    for(const m of options){
      game.move(m);
      let score=difficulty===3?aiScore(1):evaluate();
      game.undo();
      score+=(m.captured?5:0)+Math.random()*(difficulty===3?8:80);
      if(score>best){best=score;candidate=m;}
    }
  }
  play({from:candidate.from,to:candidate.to,promotion:candidate.promotion||undefined});
}
function makeCode(){
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',bytes=new Uint8Array(6);
  crypto.getRandomValues(bytes);return [...bytes].map(n=>alphabet[n%alphabet.length]).join('');
}
function roomUrl(){const url=new URL(location.href);url.searchParams.set('room',roomCode);return url.href;}
async function copyText(value){
  try{await navigator.clipboard.writeText(value);label('Copied to clipboard.');}
  catch{window.prompt('Copy this text:',value);}
}
function attach(c,epoch){
  if(epoch!==peerEpoch)return;
  if(conn&&conn.open&&conn!==c){c.close();return;}
  conn=c;
  c.on('open',()=>{
    if(epoch!==peerEpoch)return;
    connected=true;stamp=Date.now();
    connection('Connected to opponent');
    if(host){
      running=duration>0&&!endReason&&!game.isGameOver();
      const moves=game.history({verbose:true}).map(m=>({from:m.from,to:m.to,promotion:m.promotion||undefined}));
      send({type:'welcome',moves,time:duration,clock:clockSnapshot(),name:nickname(),endReason});
      label('Opponent connected. White begins.');
    }else{
      send({type:'hello',name:nickname()});label('Connected. Receiving the board...');
    }
    refresh();
  });
  c.on('data',msg=>{
    if(epoch!==peerEpoch||!msg||typeof msg!=='object')return;
    if(msg.type==='hello'&&host){
      opponentName=String(msg.name||'Friend').slice(0,24);refresh();
    }
    if(msg.type==='welcome'&&!host){
      try{
        if(!Array.isArray(msg.moves)||msg.moves.length>600)throw Error('Invalid moves.');
        game.reset();
        for(const m of msg.moves)game.move({from:m.from,to:m.to,promotion:m.promotion||undefined});
        duration=Number(msg.time)||0;
        $('time-control').value=String(duration);
        opponentName=String(msg.name||'Friend').slice(0,24);
        endReason=String(msg.endReason||'').slice(0,140);
        applyClock(msg.clock);refresh();label(endReason||'You are Black. Wait for White to move.');
      }catch{label('The host sent an invalid game state.');}
    }
    if(msg.type==='move'){
      if(!connected||endReason||game.isGameOver()||game.turn()!==(host?'b':'w'))return;
      const m=msg.move;
      if(!m||!(/^[a-h][1-8]$/.test(m.from))||!(/^[a-h][1-8]$/.test(m.to)))return;
      const valid=game.moves({verbose:true}).find(x=>x.from===m.from&&x.to===m.to&&(x.promotion||'')===(m.promotion||''));
      if(!valid){label('Received an invalid opponent move.');return;}
      play({from:m.from,to:m.to,promotion:m.promotion||undefined},true);
      applyClock(msg.clock);refresh();
    }
    if(msg.type==='finish'&&typeof msg.reason==='string')finish(msg.reason.slice(0,140),false);
    if(msg.type==='resign')finish((host?'Black':'White')+' resigned — '+(host?'White':'Black')+' wins.',false);
  });
  c.on('close',()=>{
    if(epoch!==peerEpoch||conn!==c)return;
    connected=false;running=false;stamp=Date.now();connection(host?'Opponent disconnected — room open':'Disconnected');
    label(host?'Opponent left. They can rejoin with the same code.':'Connection lost. Join the room again to resume.');
    refresh();
  });
  c.on('error',()=>{if(epoch===peerEpoch)label('Peer connection error. Try reconnecting.');});
}
function createRoom(){
  if(!window.Peer){label('Online library unavailable. Check your internet connection.');return;}
  clearNetwork();cancelAI();mode='online';host=true;myColor='w';endReason='';game.reset();
  resetClock(Number($('time-control').value));running=false;opponentName='Waiting for friend';
  roomCode=makeCode();const epoch=peerEpoch;
  $('room-code').textContent=roomCode;$('invite').classList.remove('hidden');
  connection('Opening room...');label('Connecting to room service...');
  peer=new window.Peer('pp-chess-'+roomCode.toLowerCase());
  peer.on('open',()=>{
    if(epoch!==peerEpoch)return;
    connection('Room '+roomCode+' ready');label('Share code '+roomCode+' with your friend. Waiting for them to join.');
  });
  peer.on('connection',c=>attach(c,epoch));
  peer.on('error',e=>{
    if(epoch!==peerEpoch)return;
    connected=false;running=false;connection('Room unavailable');
    label(e?.type==='unavailable-id'?'Room code already exists. Press Create room again.':'Connection service unavailable. Try again later.');
  });
  refresh();
}
function joinRoom(){
  if(!window.Peer){label('Online library unavailable. Check your internet connection.');return;}
  const code=$('join-code').value.trim().toUpperCase();
  if(!/^[A-Z2-9]{6}$/.test(code)){label('Enter a valid six-character room code.');return;}
  clearNetwork();cancelAI();mode='online';host=false;myColor='b';roomCode=code;endReason='';game.reset();
  resetClock(0);running=false;opponentName='Room host';
  connection('Joining room '+code+'...');label('Contacting room host...');
  const epoch=peerEpoch;
  peer=new window.Peer();
  peer.on('open',()=>{
    if(epoch!==peerEpoch)return;
    const c=peer.connect('pp-chess-'+code.toLowerCase(),{reliable:true,serialization:'json'});
    attach(c,epoch);
    setTimeout(()=>{if(epoch===peerEpoch&&!connected)label('Still waiting for the host. Check the room code and ask them to keep the page open.');},11000);
  });
  peer.on('error',e=>{
    if(epoch!==peerEpoch)return;
    running=false;connection('Connection failed');
    label(e?.type==='peer-unavailable'?'Room not found. Ask the host to open it first.':'Cannot connect to the room service. Please retry.');
  });
  refresh();
}
$('create-room').addEventListener('click',createRoom);
$('join-room').addEventListener('click',joinRoom);
$('local-btn').addEventListener('click',startLocal);
$('new-local').addEventListener('click',startLocal);
$('computer-btn').addEventListener('click',startComputer);
$('copy-invite').addEventListener('click',()=>roomCode&&copyText(roomUrl()));
$('copy-pgn').addEventListener('click',()=>copyText(game.pgn()||'No moves yet.'));
$('resign-btn').addEventListener('click',()=>{
  if(game.isGameOver()||endReason)return;
  if(!confirm('Resign this game?'))return;
  if(mode==='online'){
    if(!connected)return;
    send({type:'resign'});
    finish((host?'White':'Black')+' resigned — '+(host?'Black':'White')+' wins.',false);
  }else finish((game.turn()==='w'?'White':'Black')+' resigned — '+(game.turn()==='w'?'Black':'White')+' wins.');
});
$('time-control').addEventListener('change',()=>{
  if(mode==='online')return;
  settleClock();resetClock(Number($('time-control').value));refresh();label('Clock updated for this local game.');
});
$('cancel-promotion').addEventListener('click',()=>{promotionMoves=[];$('promotion-dialog').classList.add('hidden');});
$('join-code').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z2-9]/g,'').slice(0,6);});
$('join-code').addEventListener('keydown',e=>{if(e.key==='Enter')joinRoom();});
const inviteCode=new URLSearchParams(location.search).get('room');
if(inviteCode&&/^[A-Z2-9]{6}$/i.test(inviteCode)){$('join-code').value=inviteCode.toUpperCase();label('Invite detected. Enter your name and press Join.');}
window.setInterval(()=>{
  showClock();
  if(!duration||!running||game.isGameOver()||endReason)return;
  const side=game.turn(), seconds=remaining[side]-(Date.now()-stamp)/1000;
  // The host adjudicates timeouts during online games; clients only display the countdown.
  if(seconds<=0&&(mode!=='online'||host))finish('Time expired — '+(side==='w'?'Black':'White')+' wins.');
},250);

// 3D chess scene. All board coordinates and user gestures remain in browser space.
const positionOf=s=>({x:files.indexOf(s[0])-3.5,z:3.5-(Number(s[1])-1)});
function mesh(g,m,parent,x=0,y=0,z=0){
  const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
}
function cylinder(parent,r1,r2,h,y,mat,segments=32){return mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat,parent,0,y,0);}
function sphere(parent,r,y,mat,x=0,z=0){return mesh(new THREE.SphereGeometry(r,20,14),mat,parent,x,y,z);}
function pieceShape(piece){
  const root=new THREE.Group(), mat=piece.color==='w'?materials.white:materials.black, trim=piece.color==='w'?materials.gold:materials.silver;
  const p=piece.type;
  cylinder(root,.32,.37,.10,.05,mat);
  cylinder(root,.255,.30,.09,.14,trim);
  cylinder(root,.22,.29,.16,.26,mat);
  if(p==='p'){
    cylinder(root,.11,.17,.28,.46,mat);
    sphere(root,.16,.72,mat);
    return root;
  }
  cylinder(root,.13,.20,.42,.49,mat);
  cylinder(root,.22,.15,.08,.72,trim);
  if(p==='r'){
    cylinder(root,.20,.20,.20,.85,mat);
    cylinder(root,.23,.23,.07,.98,trim);
    for(let j=0;j<6;j++){const a=j*Math.PI/3;mesh(new THREE.BoxGeometry(.13,.12,.13),mat,root,Math.cos(a)*.18,1.06,Math.sin(a)*.18);}
  }else if(p==='n'){
    const shape=new THREE.Shape();shape.moveTo(-.22,.73);shape.lineTo(-.27,1.01);shape.lineTo(-.11,1.13);shape.lineTo(.09,1.20);shape.lineTo(.13,1.07);shape.lineTo(.25,.99);shape.lineTo(.23,.87);shape.lineTo(.03,.88);shape.lineTo(.14,.72);shape.closePath();
    const head=new THREE.ExtrudeGeometry(shape,{depth:.23,bevelEnabled:true,bevelSize:.03,bevelThickness:.025,bevelSegments:2});head.translate(0,0,-.115);
    mesh(head,mat,root);sphere(root,.022,1.05,trim,.12,.12);
  }else if(p==='b'){
    sphere(root,.24,.90,mat);cylinder(root,.09,.17,.23,1.04,mat);
    sphere(root,.08,1.19,trim);
  }else if(p==='q'){
    cylinder(root,.24,.13,.22,.88,mat);
    for(let j=0;j<7;j++){const a=j*Math.PI*2/7;sphere(root,.064,1.10,trim,Math.cos(a)*.17,Math.sin(a)*.17);}
    sphere(root,.10,1.15,trim);
  }else if(p==='k'){
    cylinder(root,.21,.13,.27,.89,mat);
    cylinder(root,.16,.16,.07,1.05,trim);
    mesh(new THREE.BoxGeometry(.09,.32,.09),trim,root,0,1.21,0);
    mesh(new THREE.BoxGeometry(.25,.08,.09),trim,root,0,1.23,0);
  }
  return root;
}
function squareTiles(){
  const boardMaterial=new THREE.MeshStandardMaterial({color:0x65432d,roughness:.55});
  mesh(new THREE.BoxGeometry(8.65,.3,8.65),boardMaterial,scene,0,-.26,0);
  const rim=new THREE.MeshStandardMaterial({color:0x9d642f,metalness:.2,roughness:.42});
  const border=mesh(new THREE.BoxGeometry(8.23,.055,8.23),rim,scene,0,-.08,0);
  const baseWhite=0xeedbb5,baseBlack=0x855c3d;
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const s=files[col]+(row+1), {x,z}=positionOf(s);
    const mat=new THREE.MeshStandardMaterial({color:(col+row)%2===0?baseBlack:baseWhite,roughness:.52,emissive:0,emissiveIntensity:.3});
    const tile=mesh(new THREE.BoxGeometry(.994,.09,.994),mat,scene,x,.015,z);
    tile.userData.square=s;tiles.set(s,tile);pickables.push(tile);
  }
}
function clearGroup(group){
  while(group.children.length){
    const obj=group.children[0];group.remove(obj);
    obj.traverse(child=>{if(child.geometry)child.geometry.dispose();});
  }
}
function drawPieces(){
  clearGroup(pieceLayer);
  for(const row of game.board())for(const p of row){
    if(!p)continue;
    const at=positionOf(p.square),figure=pieceShape(p);
    figure.position.set(at.x,.068,at.z);
    figure.traverse(obj=>{obj.userData.square=p.square;});
    pieceLayer.add(figure);
  }
  markSquares();
}
function markSquares(){
  if(!scene)return;
  clearGroup(markerLayer);
  for(const [s,tile] of tiles){
    tile.material.emissive.setHex(selected===s?0xd29e2b:0);
    tile.material.emissiveIntensity=selected===s?.7:0;
  }
  for(const move of legalTargets){
    const {x,z}=positionOf(move.to);
    if(markerLayer.children.some(o=>o.userData.square===move.to))continue;
    const isCapture=!!game.get(move.to)||!!move.flags?.includes('e');
    const disk=mesh(new THREE.CylinderGeometry(isCapture?.42:.16,isCapture?.42:.16,.012,40),new THREE.MeshBasicMaterial({color:isCapture?0xed7b51:0x32aa75,transparent:true,opacity:.7,depthWrite:false}),markerLayer,x,.095,z);
    disk.userData.square=move.to;
  }
}
function initScene(){
  const el=$('three-scene');
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'default'});}
  catch{$('loading').textContent='3D rendering is unavailable in this browser. Please enable WebGL.';return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
  scene=new THREE.Scene();scene.background=new THREE.Color(0xd9edf9);
  camera=new THREE.PerspectiveCamera(40,1,.1,100);camera.position.set(6.2,8.9,10.4);
  controls=new OrbitControls(camera,renderer.domElement);
  controls.target.set(0,.05,0);controls.minDistance=6.7;controls.maxDistance=19;
  controls.minPolarAngle=.30;controls.maxPolarAngle=1.43;
  controls.enableDamping=true;controls.dampingFactor=.07;
  raycaster=new THREE.Raycaster();
  scene.add(new THREE.HemisphereLight(0xffffff,0x788ba2,2.1));
  const key=new THREE.DirectionalLight(0xffffff,3.4);key.position.set(-3,11,8);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;
  scene.add(key);
  const fill=new THREE.DirectionalLight(0xd4e9ff,1.35);fill.position.set(8,4,-5);scene.add(fill);
  const floor=mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xcee5f4,roughness:1}),scene,0,-.435,0);
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
  squareTiles();pieceLayer=new THREE.Group();scene.add(pieceLayer);markerLayer=new THREE.Group();scene.add(markerLayer);
  drawPieces();
  let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',e=>{
    if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>8){down=null;return;}
    down=null;const rect=renderer.domElement.getBoundingClientRect();
    const pointer=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects([pieceLayer,markerLayer,...pickables],true)[0];
    if(hit){let o=hit.object;while(o&&!o.userData.square)o=o.parent;if(o?.userData.square)choose(o.userData.square);}
  });
  const resize=()=>{const rect=el.getBoundingClientRect();camera.aspect=rect.width/Math.max(1,rect.height);camera.updateProjectionMatrix();renderer.setSize(rect.width,rect.height,false);};
  new ResizeObserver(resize).observe(el);resize();
  $('reset-view').addEventListener('click',()=>{camera.position.set(6.2,8.9,10.4);controls.target.set(0,.05,0);controls.update();});
  $('flip-view').addEventListener('click',()=>{camera.position.set(-camera.position.x,Math.max(6,camera.position.y),-camera.position.z);controls.update();});
  let last=0;
  function frame(t){requestAnimationFrame(frame);if(t-last<32)return;last=t;controls.update();renderer.render(scene,camera);}
  requestAnimationFrame(frame);
  $('loading').classList.add('hidden');
}
initScene();refresh();
