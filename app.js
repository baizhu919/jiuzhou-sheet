(() => {
const D = window.JZ_DATA;
const SKILLS = [["格斗","体魄"],["射击","体魄"],["闪避","体魄"],["运动","体魄"],["潜行","体魄"],["驾驶","智慧"],["侦查","智慧"],["学识","智慧"],["神秘学","智慧"],["医术","智慧"],["机械","智慧"],["语言","智慧"],["说服","心魂"],["欺骗","心魂"],["威吓","心魂"],["共情","心魂"],["礼仪","心魂"],["灵感","心魂"],["冥想","心魂"],["仪式","智慧"],["通灵","心魂"]];
const ORIGINS = [["平民",""],["官方非凡者","侦查、神秘学、射击"],["教会执事","仪式、礼仪、学识"],["世家子弟","礼仪、说服、格斗"],["野生非凡者","潜行、欺骗、灵感"],["学者 / 医师","学识、医术、语言"],["海商 / 旅行者","驾驶、运动、共情"]];
const ABIL_DICE = {9:"1d4",8:"2d4",7:"3d4",6:"3d4+1d6",5:"3d4+2d6",4:"3d4+2d6+1d12",3:"3d4+2d6+2d12",2:"3d4+2d6+2d12+1d20",1:"3d4+2d6+2d12+2d20",0:"3d4+2d6+2d12+3d20"};
const ARMOR = {"无甲":{block:0,dur:0,pen:0,base:null},"轻甲":{block:1,dur:4,pen:0,base:[5,11]},"中甲":{block:2,dur:6,pen:1,base:[6,13]},"重甲":{block:3,dur:8,pen:2,base:[7,15]}};
const CONTINENTS = ["华胥川","诺德加德","阿拜多斯","马尔瓦阿巴德","拉尼努沙","格温戈伊","安农菲德","玄圃","幽都"];
const TIER = {9:"低序列",8:"低序列",7:"低序列",6:"中序列",5:"中序列",4:"半神",3:"圣者",2:"天使",1:"天使",0:"真神"};
const CAP = {9:5,8:6,7:7,6:8,5:9,4:10,3:11,2:12,1:13,0:14};
const POWER = s => s>=8?1:s>=5?2:s>=3?3:s>=1?4:5;
const $ = q => document.querySelector(q);
const $$ = q => Array.from(document.querySelectorAll(q));
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }
function blank(){ const sk={}; SKILLS.forEach(function(p){ sk[p[0]]={grow:0,alloc:0}; }); return {name:"",title:"",gender:"",age:"",origin:"平民",faction:"",continent:"华胥川",faith:"",path:"",seq:"",pollution:0,digest:0,attr:{body:3,wits:3,soul:3},loss:0,vogue:10,props:0,armorNote:"",lifeLost:0,armor:"无甲",armorDur:0,weapons:[],skills:sk,myAbilities:"",equip:[],inv:[],rel:[],beasts:[],profile:{desc:"",traits:"",notes:""}}; }
function normalize(o){
  if(!o || typeof o!=="object") return blank();
  if(o.background && !o.profile){ o.profile={desc:"",traits:"",notes:o.background}; }
  if(o.armor===undefined) o.armor="无甲";
  if(o.armorDur===undefined) o.armorDur=0;
  if(o.lifeLost===undefined) o.lifeLost=0;
  ['equip','inv','rel','beasts','weapons'].forEach(function(k){ if(!Array.isArray(o[k])) o[k]=[]; });
  if(!o.skills || typeof o.skills!=="object") o.skills={};
  if(!o.profile) o.profile={desc:"",traits:"",notes:""};
  return o;
}
let SLOTS = loadSlots(); let S = normalize(currentSlot().state);
function uid(){ return String(Date.now())+Math.random().toString(36).slice(2,6); }
function loadSlots(){
  var store=null;
  try{ store=JSON.parse(localStorage.getItem("jz-sheets-v2")||"null"); }catch(e){}
  if(!store || !store.list || !store.list.length){
    var st=null;
    try{ var old=localStorage.getItem("jz-sheet-v1"); st=old?JSON.parse(old):null; }catch(e){}
    var id=uid();
    store={current:id, list:[{id:id, state:st||blank(), updated:Date.now()}]};
  }
  try{
    var h=location.hash.match(/^#s=(.+)$/);
    if(h){
      var imported=JSON.parse(decodeURIComponent(escape(atob(h[1].replace(/-/g,"+").replace(/_/g,"/")))));
      var slot=store.list.filter(function(x){ return x.id===store.current; })[0] || store.list[0];
      slot.state=imported; store.current=slot.id;
      history.replaceState(null,"",location.pathname+location.search);
    }
  }catch(e){}
  return store;
}
function currentSlot(){ return SLOTS.list.filter(function(x){ return x.id===SLOTS.current; })[0] || SLOTS.list[0]; }
function renderSlots(){
  var cur=currentSlot(); var nm=(cur.state&&cur.state.name)||"未命名";
  var cn=$("#curName"); if(cn) cn.textContent=nm;
  var list=$("#slotList"); if(!list) return;
  list.innerHTML="";
  SLOTS.list.forEach(function(x){
    var st=x.state||{}; var row=document.createElement("div");
    row.className="slot"+(x.id===SLOTS.current?" active":"");
    var d=new Date(x.updated||Date.now());
    row.innerHTML='<div><div class="nm">'+esc(st.name||"未命名")+(st.title?' · <span style="font-weight:400;color:#5a6472">'+esc(st.title)+'</span>':'')+'</div><div class="mt">'+d.toLocaleString("zh-CN",{hour12:false})+'</div></div><div class="mt">'+(x.id===SLOTS.current?'当前':'选择')+'</div>';
    row.onclick=function(){ switchTo(x.id); closeSlots(); };
    list.appendChild(row);
  });
}
function openSlots(){ renderSlots(); $("#slotModal").hidden=false; }
function closeSlots(){ $("#slotModal").hidden=true; }
function save(){ var slot=currentSlot(); slot.state=S; slot.updated=Date.now();
  localStorage.setItem("jz-sheets-v2", JSON.stringify(SLOTS)); renderSlots();
  $("#saveState").textContent = "已保存 " + new Date().toLocaleTimeString("zh-CN",{hour12:false}); }
function switchTo(id){ save(); SLOTS.current=id; S=normalize(currentSlot().state); if(location.hash) history.replaceState(null,"",location.pathname+location.search); fill(); render(); renderSlots(); }
var st=null; function scheduleSave(){ clearTimeout(st); st=setTimeout(save,500); }
function setPath(o,p,v){ var ps=p.split("."); for(var i=0;i<ps.length-1;i++){ o=o[ps[i]]=o[ps[i]]||{}; } o[ps[ps.length-1]]=v; }
function getPath(o,p){ return p.split(".").reduce(function(a,k){ return a==null?undefined:a[k]; }, o); }
D.paths.forEach(function(p){ var o=document.createElement("option"); o.value=p; o.textContent=p; $("#selPath").append(o); });
for(var sq=9;sq>=0;sq--){ var o2=document.createElement("option"); o2.value=sq; o2.textContent=sq; $("#selSeq").append(o2); }
ORIGINS.forEach(function(x){ var o=document.createElement("option"); o.value=x[0]; if(x[1]) o.label=x[1]; $("#originList").append(o); });
["无甲","轻甲","中甲","重甲"].forEach(function(a){ var o=document.createElement("option"); o.value=a; o.textContent=a; document.querySelector("#selArmor").append(o); });
CONTINENTS.forEach(function(c){ var o=document.createElement("option"); o.value=c; o.textContent=c; $("#selContinent").append(o); });
$$("[data-k]").forEach(function(el){ var k=el.dataset.k; var v=getPath(S,k); if(el.type==="checkbox"){ el.checked=!!v; } else { el.value = (el.type==="number") ? (v==null?0:v) : (v==null?"":v); } el.addEventListener("input", function(){ var val = el.type==="checkbox" ? el.checked : el.value; if(el.type==="number"){ val = val===""?"":Number(val); } setPath(S,k,val); render(); scheduleSave(); }); });
function str(v){ v=Number(v)||0; return v<=9?Math.ceil(v/2):v-4; }
function attrRows(){ var cap = S.seq===""?5:CAP[S.seq]; var rows=[["体魄",S.attr.body],["智慧",S.attr.wits],["心魂",S.attr.soul]]; var h=""; rows.forEach(function(r){ h += "<tr><td class=\"l\">"+r[0]+"</td><td>"+r[1]+"</td><td>"+str(r[1])+"</td><td>"+cap+"</td></tr>"; }); $("#attrBody").innerHTML=h; $$("[data-k^=\"attr.\"]").forEach(function(inp){ inp.max=cap; if(Number(inp.value)>cap) inp.value=cap; }); var used=Number(S.attr.body)+Number(S.attr.wits)+Number(S.attr.soul); var asc=(S.seq===""?0:(9-Number(S.seq))); var pool=9+2*asc; var left=pool-used; var el=$("#attrLeft"); el.textContent = left>=0?("剩 "+left+" 点"):("超 "+(-left)+" 点"); el.style.color = left<0?"#b4453c":""; $("#outPool").value = "池 " + pool + "（剩 " + left + "）"; $("#outPool").title = "创建 9 + 晋升 " + (2*asc) + "，已用 " + used; }
function status(){ var b=str(S.attr.body), w=Number(S.attr.wits), so=str(S.attr.soul);
  var L = S.seq===""?0:(10-Number(S.seq)); var A = ARMOR[S.armor]||ARMOR["无甲"];
  $("#outLife").value = 6 + b;
  $("#outEvasion").value = 10 + b - A.pen;
  var tagsEl=$("#outTags"); if(tagsEl) tagsEl.value = S.seq===""?0:(10-Number(S.seq));
  var th = A.base ? [A.base[0]+L, A.base[1]+2*L] : [4+L, 8+2*L];
  $("#outThresh").value = th[0] + " / " + th[1];
  $("#outSpirit").value = 5 + w*2 + Number(S.attr.soul);
  $("#outLossMax").value = so*3;
  if(S.seq===""){ $("#outTier").value="未服"; $("#outCap").value="—"; $("#outPower").value="—"; }
  else{ $("#outTier").value=TIER[S.seq]||""; $("#outCap").value=CAP[S.seq]||""; $("#outPower").value=POWER(Number(S.seq)); }
  var durEl=$('[data-k="armorDur"]'); if(durEl) durEl.value = S.armorDur;
}
function skills(){ var pool=Number(S.attr.body)+Number(S.attr.wits); var used=0; var h1="", h2=""; SKILLS.forEach(function(p,idx){ var n=p[0], a=p[1]; var sk=S.skills[n]||(S.skills[n]={grow:0,alloc:0}); used += Number(sk.alloc)||0; var row="<tr><td class=\"l\">"+n+"</td><td>"+a+"</td><td>0</td><td><input type=\"number\" min=\"0\" value=\""+(sk.grow||0)+"\" data-sk=\""+n+"\" data-f=\"grow\" style=\"width:60px\"></td><td><input type=\"number\" min=\"0\" value=\""+(sk.alloc||0)+"\" data-sk=\""+n+"\" data-f=\"alloc\" style=\"width:60px\"></td><td>"+((Number(sk.grow)||0)+(Number(sk.alloc)||0))+"</td></tr>"; if(idx<11) h1+=row; else h2+=row; }); $("#skillBody").innerHTML=h1; $("#skillBody2").innerHTML=h2; var left=pool-used; var el=$("#skillLeft"); el.textContent="剩余加点 "+left; el.style.color= left<0?"#b4453c":""; $$("[data-sk]").forEach(function(inp){ inp.addEventListener("input", function(){ S.skills[inp.dataset.sk][inp.dataset.f]=Number(inp.value)||0; render(); scheduleSave(); }); }); }
function abilities(){ var list=$("#abilityList"); if(!S.path || S.seq===""){ list.innerHTML="<p class=\"hint\">先在 ② 选途径与序列。</p>"; $("#abilCount").textContent="0"; $("#seqName").textContent=""; return; } var cur=Number(S.seq); var rows=D.entries.filter(function(e){ return e.p===S.path && e.s>=cur; }).sort(function(a,b){ return b.s-a.s; }); var h=""; rows.forEach(function(e){ h += "<div class=\"abil\"><h3>序列 "+e.s+" · "+esc(e.n)+"<span class=\"pill\">"+esc(e.t||e.p)+"</span></h3><div class=\"meta\">能力条目 · 伤害骰 "+(ABIL_DICE[e.s]||"—")+"</div><p>"+esc(e.a).replace(/\n/g,"<br>")+"</p>"+(e.m?"<div class=\"mat\">魔药主材料："+esc(e.m)+"</div>":"")+"</div>"; }); list.innerHTML=h; $("#abilCount").textContent=rows.length+" 段"; $("#seqName").textContent = rows.length ? (rows[rows.length-1].n+" → "+rows[0].n) : ""; }
function equip(){ var h=""; S.equip.forEach(function(x,i){ h += "<div class=\"entry\"><input placeholder=\"名称\" value=\""+esc(x.name)+"\" data-eq=\""+i+"\" data-f=\"name\"><input placeholder=\"类型\" value=\""+esc(x.type)+"\" data-eq=\""+i+"\" data-f=\"type\"><input placeholder=\"等级/编号\" value=\""+esc(x.level)+"\" data-eq=\""+i+"\" data-f=\"level\"><input placeholder=\"合规用法\" value=\""+esc(x.usage)+"\" data-eq=\""+i+"\" data-f=\"usage\"><button data-del=\"equip\" data-i=\""+i+"\">×</button></div>"; }); $("#equipList").innerHTML=h; $$("[data-eq]").forEach(function(el){ el.addEventListener("input", function(){ S.equip[el.dataset.eq][el.dataset.f]=el.value; scheduleSave(); }); }); $$("[data-del=\"equip\"]").forEach(function(b){ b.onclick=function(){ S.equip.splice(b.dataset.i,1); render(); scheduleSave(); }; }); }
function rels(){ var h=""; S.rel.forEach(function(x,i){ h += "<div class=\"entry rel\"><input placeholder=\"对象\" value=\""+esc(x.who)+"\" data-rel=\""+i+"\" data-f=\"who\"><input placeholder=\"关系\" value=\""+esc(x.rel)+"\" data-rel=\""+i+"\" data-f=\"rel\"><input placeholder=\"备注\" value=\""+esc(x.note)+"\" data-rel=\""+i+"\" data-f=\"note\"><button data-del=\"rel\" data-i=\""+i+"\">×</button></div>"; }); $("#relList").innerHTML=h; $("[data-rel]").forEach(function(el){ el.addEventListener("input", function(){ S.rel[el.dataset.rel][el.dataset.f]=el.value; scheduleSave(); }); }); $("[data-del=\"rel\"]").forEach(function(b){ b.onclick=function(){ S.rel.splice(b.dataset.i,1); render(); scheduleSave(); }; }); }

function beasts(){ var h=""; S.beasts.forEach(function(x,i){ h += "<div class=\"entry rel\"><input placeholder=\"名称\" value=\""+esc(x.name)+"\" data-be=\""+i+"\" data-f=\"name\"><input placeholder=\"普通/神话\" value=\""+esc(x.type)+"\" data-be=\""+i+"\" data-f=\"type\"><input placeholder=\"来源\" value=\""+esc(x.source)+"\" data-be=\""+i+"\" data-f=\"source\"><input placeholder=\"能力/用途\" value=\""+esc(x.ability)+"\" data-be=\""+i+"\" data-f=\"ability\"><button data-del=\"beast\" data-i=\""+i+"\">×</button></div>"; }); $("#beastList").innerHTML=h; $$("[data-be]").forEach(function(el){ el.addEventListener("input", function(){ S.beasts[el.dataset.be][el.dataset.f]=el.value; scheduleSave(); }); }); $$("[data-del=\"beast\"]").forEach(function(b){ b.onclick=function(){ S.beasts.splice(b.dataset.i,1); render(); scheduleSave(); }; }); }
function inv(){ var h=""; S.inv.forEach(function(x,i){ h += "<div class=\"entry\"><input placeholder=\"物品\" value=\""+esc(x.name)+"\" data-inv=\""+i+"\" data-f=\"name\"><input placeholder=\"数量\" value=\""+esc(x.qty)+"\" data-inv=\""+i+"\" data-f=\"qty\"><input placeholder=\"说明\" value=\""+esc(x.note)+"\" data-inv=\""+i+"\" data-f=\"note\" style=\"grid-column:span 2\"><button data-del=\"inv\" data-i=\""+i+"\">×</button></div>"; }); $("#invList").innerHTML=h; $$("[data-inv]").forEach(function(el){ el.addEventListener("input", function(){ S.inv[el.dataset.inv][el.dataset.f]=el.value; scheduleSave(); }); }); $$("[data-del=\"inv\"]").forEach(function(b){ b.onclick=function(){ S.inv.splice(b.dataset.i,1); render(); scheduleSave(); }; }); }

function weapons(){ var h=""; S.weapons.forEach(function(x,i){ h += "<div class=\"entry\"><input placeholder=\"武器\" value=\""+esc(x.name)+"\" data-wp=\""+i+"\" data-f=\"name\"><input placeholder=\"伤害骰（1d6）\" value=\""+esc(x.dice)+"\" data-wp=\""+i+"\" data-f=\"dice\"><input placeholder=\"近战/远程\" value=\""+esc(x.kind)+"\" data-wp=\""+i+"\" data-f=\"kind\"><input placeholder=\"备注\" value=\""+esc(x.note)+"\" data-wp=\""+i+"\" data-f=\"note\" style=\"grid-column:span 2\"><button data-del=\"wp\" data-i=\""+i+"\">×</button></div>"; }); $("#weaponList").innerHTML=h; $$("[data-wp]").forEach(function(el){ el.addEventListener("input", function(){ S.weapons[el.dataset.wp][el.dataset.f]=el.value; scheduleSave(); }); }); $$("[data-del=\"wp\"]").forEach(function(b){ b.onclick=function(){ S.weapons.splice(b.dataset.i,1); render(); scheduleSave(); }; }); }

function render(){ var cn=$('#curName'); if(cn) cn.textContent=S.name||'未命名'; attrRows(); status(); skills(); abilities(); weapons(); equip(); inv(); rels(); beasts(); }
$("#addEquip").onclick=function(){ S.equip.push({name:"",type:"",level:"",usage:""}); render(); scheduleSave(); };
$("#addRel").onclick=function(){ S.rel.push({who:"",rel:"",debt:"",note:""}); render(); scheduleSave(); };
$("#addWeapon").onclick=function(){ S.weapons.push({name:"",dice:"",kind:"近战",note:""}); render(); scheduleSave(); };
$("#selArmor").addEventListener("change", function(){ S.armor=this.value; S.armorDur=(ARMOR[this.value]||ARMOR["无甲"]).dur; render(); scheduleSave(); });
$("#addInv").onclick=function(){ S.inv.push({name:"",qty:"",note:""}); render(); scheduleSave(); };
$("#addBeast").onclick=function(){ S.beasts.push({name:"",type:"",source:"",ability:""}); render(); scheduleSave(); };
$("#btnExport").onclick=function(){ var blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"}); var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=(S.name||"九洲人物")+".json"; a.click(); URL.revokeObjectURL(a.href); };
$("#btnImport").onclick=function(){ $("#fileInput").click(); };
$("#fileInput").onchange=function(e){ var f=e.target.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ try{ S=Object.assign(blank(), JSON.parse(r.result)); location.hash=""; fill(); render(); save(); toast("已导入"); }catch(err){ toast("文件读不出来"); } }; r.readAsText(f); };
$("#btnPrint").onclick=function(){ window.print(); };
$("#btnReset").onclick=function(){ if(confirm("清空当前角色？")){ S=blank(); location.hash=""; fill(); render(); save(); } };
$("#btnSlots").onclick=function(){ openSlots(); };
$("#slotClose").onclick=function(){ closeSlots(); };
$("#slotModal").addEventListener("click", function(e){ if(e.target===this) closeSlots(); });
$("#btnNew").onclick=function(){ save(); var id=uid(); SLOTS.list.push({id:id,state:blank(),updated:Date.now()}); SLOTS.current=id; S=normalize(currentSlot().state); history.replaceState(null,"",location.pathname); fill(); render(); renderSlots(); save(); };
$("#btnDup").onclick=function(){ save(); var id=uid(); var copy=JSON.parse(JSON.stringify(S)); copy.name=(copy.name||"未命名")+" 副本"; SLOTS.list.push({id:id,state:copy,updated:Date.now()}); SLOTS.current=id; S=normalize(currentSlot().state); history.replaceState(null,"",location.pathname); fill(); render(); renderSlots(); save(); };
$("#btnRen").onclick=function(){ var cur=(S.name||"").trim(); var v=prompt("角色名（显示在顶部下拉里）", cur||"未命名"); if(v===null) return; S.name=v.trim()||"未命名"; fill(); renderSlots(); save(); };
$("#btnDel").onclick=function(){ if(SLOTS.list.length<=1){ alert("至少留一个角色。"); return; } if(!confirm("删除「"+((S.name||"未命名"))+"」？")) return; var i=SLOTS.list.findIndex(function(x){ return x.id===SLOTS.current; }); SLOTS.list.splice(i,1); SLOTS.current=SLOTS.list[0].id; S=normalize(currentSlot().state); history.replaceState(null,"",location.pathname); fill(); render(); renderSlots(); save(); };
$("#btnShare").onclick=async function(){ var b64=btoa(unescape(encodeURIComponent(JSON.stringify(S)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); var url=location.origin+location.pathname+"#s="+b64; try{ await navigator.clipboard.writeText(url); toast("链接已复制"); }catch(e){ prompt("复制这个链接", url); } history.replaceState(null,"",url); };
function toast(m){ var t=$("#toast"); t.textContent=m; t.classList.add("show"); setTimeout(function(){ t.classList.remove("show"); },1600); }
function fill(){ $$("[data-k]").forEach(function(el){ var v=getPath(S,el.dataset.k); if(el.type==="checkbox"){ el.checked=!!v; } else { el.value=(el.type==="number")?(v==null?0:v):(v==null?"":v); } }); }
renderSlots(); fill(); render();
window.addEventListener("beforeunload", save);

/* 车卡指引：可拖动小窗 */
var GUIDE_STEPS = [
 {t:'身份：姓名、称号、出身', w:'称号是别人叫你的名字，不是本名。',
  b:'<p>姓名随便起；称号用一两字，比如「白霜」「铁卷」「梦枕」。</p><p><b>出身</b>决定你会哪些技能，也决定你从哪拿到魔药：官方非凡者、教会执事、世家子弟、野生非凡者、学者／医师、海商／旅行者，或者自己写一个。</p>',
  ex:'例：白霜，白家旁支，出身「世家子弟」——礼仪、说服、格斗起步。'},
 {t:'决定服没服魔药', w:'这是九洲最重要的一次选择。',
  b:'<p><b>没服</b>：位格「未服」，属性上限 4，生命 6＋体魄强度，闪避 10＋体魄强度。你就是个比常人强一点的人，但能自由选路。</p><p><b>服了</b>：从序列 9 开始，位格「低序列」，上限 5，选一条途径。你会得到那条途径序列 9 的全部能力和 1 个标签。</p>',
  ex:'例：白霜服了「不眠者」途径的序列 9 魔药，位格低序列，标签 1 个。'},
 {t:'分属性：9 点，单项 1–5', w:'体魄管身体，智慧管知识与术法，心魂管意志与灵性。',
  b:'<p>9 点分三项，单项至少 1、最多 5。分完不能反悔，但之后每升一序会再给 2 点。</p><p>强度不是点数：1–2 得 1，3–4 得 2，5–6 得 3，7–8 得 4，9 得 5。</p>',
  ex:'例：体魄 4（强度 2）、智慧 3（强度 2）、心魂 2（强度 1）。'},
 {t:'算衍生值', w:'这几项影响你挨几下、还能不能出手。',
  b:'<ul><li>生命值 ＝ 6 ＋ 体魄强度</li><li>灵性上限 ＝ 5 ＋ 智慧 ×2 ＋ 心魂</li><li>失控上限 ＝ 心魂强度 ×3</li><li>闪避 ＝ 10 ＋ 体魄强度 − 甲重</li></ul>',
  ex:'例：生命 8；灵性 5＋6＋2＝13；失控 3；未穿甲闪避 12。'},
 {t:'技能：花掉技能点', w:'技能点 ＝ 体魄 ＋ 智慧。初始都 0。',
  b:'<p>21 项技能分四类：身体、头脑、社交、灵性。不知道加什么就先点「神秘学」——认途径、辨魔药、看仪式，九洲最常用的就是它。</p>',
  ex:'例：技能点 7，加神秘学 2、侦查 1、礼仪 1、闪避 1、潜行 1、医术 1。'},
 {t:'武器与护甲', w:'武器给伤害骰，护甲给抵挡与耐久。',
  b:'<p>武器：拳 1d3、小刀 1d4、中刀 1d6、弓 1d6、手枪 1d8、步枪 2d6。</p><p>护甲：轻甲 1/4、中甲 2/6、重甲 3/8；甲越重闪避越低。耐久挨一次掉一点，修理才回。</p>',
  ex:'例：左轮 1d8；轻甲（抵挡 1、耐久 4、闪避不减）。'},
 {t:'写下能力、关系、笔记', w:'跑团时 DH 先看这一栏，而不是你的数值。',
  b:'<p>把当前序列的能力名抄到「能力或特性」；写下三个关系（欠谁、谁欠你、谁在找你）和一条冒险理由。</p>',
  ex:'例：欠白家医馆一条命；答应替闻家送一封信；有个同门在外头找他。'},
 {t:'对照检查', w:'最后过一遍，缺什么补什么。',
  b:'<ul class="check"><li>☐ 属性总和是 9，单项 1–5</li><li>☐ 位格、属性上限、标签数对得上序列</li><li>☐ 生命值、灵性、失控、闪避都算过</li><li>☐ 技能加点没超过「体魄＋智慧」</li><li>☐ 有武器、有护甲（或明确不穿）</li><li>☐ 三个关系写了至少一个</li></ul>',
  ex:'都打勾了，就可以把卡交给 DH 了。'}
];
var guideIdx = Number(localStorage.getItem('jz-guide-step')||0);
if (isNaN(guideIdx) || guideIdx<0 || guideIdx>=GUIDE_STEPS.length) guideIdx = 0;
function guideRender(){
  var s=GUIDE_STEPS[guideIdx]; var box=$("#wzBody");
  box.innerHTML='<h3>'+(guideIdx+1)+'. '+s.t+'</h3><div class="why">'+s.w+'</div>'+s.b+(s.ex?'<div class="ex">'+s.ex+'</div>':'');
  $("#wzProg").textContent=(guideIdx+1)+' / '+GUIDE_STEPS.length;
  $("#wzPrev").disabled = guideIdx===0;
  $("#wzNext").textContent = guideIdx===GUIDE_STEPS.length-1 ? '完成' : '下一步';
  localStorage.setItem('jz-guide-step', String(guideIdx));
}
function guideOpen(){ var w=$("#wizard"); if(!w) return; w.classList.add('on'); guideRender();
  if(!w.dataset.pos){ w.style.left=Math.max(8,(window.innerWidth-w.offsetWidth)/2)+'px'; w.style.top='90px'; w.dataset.pos='1'; } }
function guideClose(){ var w=$("#wizard"); if(w) w.classList.remove('on'); }
$("#btnGuide").onclick=guideOpen;
$("#wzClose").onclick=guideClose;
$("#wzPrev").onclick=function(){ if(guideIdx>0){ guideIdx--; guideRender(); } };
$("#wzNext").onclick=function(){ if(guideIdx<GUIDE_STEPS.length-1){ guideIdx++; guideRender(); } else { guideClose(); } };
(function(){
  var head=$("#wzHead"), drag=null;
  head.addEventListener("pointerdown", function(e){ if(e.target.tagName==="BUTTON") return; var w=$("#wizard");
    drag={x:e.clientX,y:e.clientY,l:w.offsetLeft,t:w.offsetTop}; try{ head.setPointerCapture(e.pointerId); }catch(err){} });
  head.addEventListener("pointermove", function(e){ if(!drag) return; var w=$("#wizard");
    var l=drag.l+(e.clientX-drag.x), t=drag.t+(e.clientY-drag.y);
    l=Math.max(4, Math.min(window.innerWidth-w.offsetWidth-4, l));
    t=Math.max(4, Math.min(window.innerHeight-60, t));
    w.style.left=l+"px"; w.style.top=t+"px"; });
  head.addEventListener("pointerup", function(){ drag=null; });
})();

})();
