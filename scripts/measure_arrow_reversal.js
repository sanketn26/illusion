// Reproduces the arrow-of-time chart: share of gas back in the left third after a 350-step reversal.
// Run from the repo root: node scripts/measure_arrow_reversal.js  (uses Math.random, so values vary by about 1-2 points)
const fs=require('fs'),vm=require('vm');const win={};vm.runInNewContext(fs.readFileSync('site/sims.js','utf8'),{window:win,matchMedia:()=>({matches:false}),Math,console});
const d=win.IllusionSims.arrow;
function run(errIdx,steps){const texts=[];const ctx=new Proxy({}, {get:(t,k)=>k==='fillText'?((s)=>texts.push(String(s))):(k in t?t[k]:(()=>({addColorStop(){}}))),set:(t,k,v)=>{t[k]=v;return true}});
 let e=0;const sim=d.make(ctx,()=>e);sim.reset();
 const share=()=>{texts.length=0;sim.draw();const m=texts.find(s=>/left third/.test(s));return +m.match(/(\d+)%/)[1];};
 for(let i=0;i<steps;i++)sim.step();const mid=share();e=errIdx;sim.act('reverse');for(let i=0;i<steps;i++)sim.step();return [mid,share()];}
const labels=[0,1,2,3,4,5,6,7];
for(const e of labels){let a=0,b=0;const N=80;for(let r=0;r<N;r++){const [m,f]=run(e,350);a+=m;b+=f;}console.log('err idx',e,'mid-run share',(a/N).toFixed(1),'after reversal',(b/N).toFixed(1));}
