// --- helpers ---
function clamp(v){ return Math.max(0, Math.min(100, v)); }
function log(msg){
  const feed = document.getElementById('logFeed');
  const div = document.createElement('div');
  div.className='log-entry';
  div.textContent=msg;
  feed.prepend(div);
}
function save(){ localStorage.setItem('petState', JSON.stringify(state)); }
function load(){ return JSON.parse(localStorage.getItem('petState')||'null'); }

function showToast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1700);
}

// --- state ---
let state = load() || {
  hunger:40,happiness:85,energy:90,
  minutes:360,asleep:false,skin:'cat',ach:[]
};

const ACH = [
  {id:'first',txt:'First action!',test:()=>state.ach.length===0},
  {id:'perfect',txt:'All stats above 80!',test:()=>state.hunger<20&&state.happiness>80&&state.energy>80}
];

function award(id){
  if(!state.ach.includes(id)){
    state.ach.push(id);
    renderAchievements();
    log("🏆 Achievement unlocked!");
  }
}

// --- render ---
function render(){
  document.getElementById('hungerVal').textContent=Math.round(state.hunger);
  document.getElementById('happinessVal').textContent=Math.round(state.happiness);
  document.getElementById('energyVal').textContent=Math.round(state.energy);

  document.getElementById('hungerFill').style.width=state.hunger+"%";
  document.getElementById('happinessFill').style.width=state.happiness+"%";
  document.getElementById('energyFill').style.width=state.energy+"%";

  const h = Math.floor(state.minutes/60)%24;
  const m = state.minutes%60;
  document.getElementById('clock').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  document.getElementById('phase').textContent=(h>=6&&h<18)?"Day":"Night";

  let mood="Cheery";
  if(state.hunger>70)mood="Hungry";
  if(state.energy<30)mood="Tired";
  if(state.happiness<30)mood="Sad";
  document.getElementById('moodText').textContent=mood;
}

// --- achievements ---
function renderAchievements(){
  const ul=document.getElementById('achList'); ul.innerHTML="";
  state.ach.forEach(a=>{
    const li=document.createElement('li');
    li.textContent="🏅 "+ACH.find(x=>x.id===a).txt;
    ul.appendChild(li);
  });
}

// --- skins ---
function renderSkin(){
  const pet=document.getElementById('pet');
  if(state.skin==='cat')pet.textContent="🐱";
  if(state.skin==='panda')pet.textContent="🐼";
  if(state.skin==='bunny')pet.textContent="🐰";
}
document.querySelectorAll('.pet-chooser .chip').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    state.skin=btn.dataset.skin;
    renderSkin(); save();
  });
});

// --- actions ---
function act(name,fn){
  log(name); fn(); award('first'); save(); render();
}
document.getElementById('feedBtn').onclick=()=>act("🍖 Ate food",()=>state.hunger=clamp(state.hunger-30));
document.getElementById('playBtn').onclick=()=>act("🎮 Played",()=>{state.happiness=clamp(state.happiness+25);state.energy=clamp(state.energy-10);});
document.getElementById('sleepBtn').onclick=()=>act("💤 Slept",()=>{state.asleep=!state.asleep;});
document.getElementById('cleanBtn').onclick=()=>act("🧼 Cleaned",()=>state.happiness=clamp(state.happiness+5));
document.getElementById('spinBtn').onclick=()=>act("🌀 Spun around",()=>state.happiness=clamp(state.happiness+8));
document.getElementById('bounceBtn').onclick=()=>act("⛹️ Bounced",()=>state.energy=clamp(state.energy-5));

// --- game loop ---
let gameInterval=null, paused=false;
function tick(){
  if(paused)return;
  state.minutes=(state.minutes+1)%(24*60);
  if(!state.asleep){
    state.hunger=clamp(state.hunger+0.4);
    state.happiness=clamp(state.happiness-0.15);
    state.energy=clamp(state.energy-0.25);
  }else{
    state.energy=clamp(state.energy+0.6);
    state.hunger=clamp(state.hunger+0.1);
  }
  if(ACH[1].test())award('perfect');
  save(); render();
}

// --- start / pause ---
document.getElementById('startBtn').onclick=()=>{
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameUI').classList.remove('hidden');
  if(!gameInterval)gameInterval=setInterval(tick,1000);
};
document.getElementById('pauseBtn').onclick=()=>{
  paused=true;
  document.getElementById('pauseScreen').classList.remove('hidden');
};
document.getElementById('resumeBtn').onclick=()=>{
  paused=false;
  document.getElementById('pauseScreen').classList.add('hidden');
};

// --- init ---
render(); renderSkin(); renderAchievements();

// THEME TOGGLE
document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  showToast(document.body.classList.contains("light") ? "☀️ Light mode on!" : "🌙 Dark mode on!");
});

// RESET BUTTON
document.getElementById("resetBtn").addEventListener("click", () => {
  state = {
    hunger:40,happiness:85,energy:90,
    minutes:360,asleep:false,skin:'cat',ach:[]
  };
  localStorage.removeItem("petState");
  log("🔄 Game reset!");
  render(); renderSkin(); renderAchievements();
  showToast("🔄 Game reset!");
});
