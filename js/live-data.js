(()=>{
  const $=s=>document.querySelector(s);
  const KEY='electronicCyberTwinLiveWeatherV2';
  const REFRESH=15*60*1000;
  const endpoint='https://api.open-meteo.com/v1/forecast?latitude=52.1205&longitude=11.6276&current=temperature_2m,precipitation,visibility,wind_speed_10m,is_day,weather_code&timezone=Europe%2FBerlin';
  let nextAt=Date.now()+REFRESH;
  const value=(id,text)=>{const el=$(id);if(el)el.textContent=text};
  function status(label,kind){const e=$('#liveStatus');e.textContent=label;e.className='live-status '+kind}
  function render(packet,source){
    const c=packet.current,u=packet.current_units||{};
    value('#liveTemperature',`${Number(c.temperature_2m).toFixed(1)} ${u.temperature_2m||'°C'}`);
    value('#liveRain',`${Number(c.precipitation).toFixed(1)} ${u.precipitation||'mm'}`);
    value('#liveVisibility',`${(Number(c.visibility)/1000).toFixed(1)} km`);
    value('#liveWind',`${Number(c.wind_speed_10m).toFixed(1)} ${u.wind_speed_10m||'km/h'}`);
    value('#liveDaylight',c.is_day===1?'DAY':'NIGHT');
    const rain=Number(c.precipitation),vis=Number(c.visibility),wind=Number(c.wind_speed_10m);
    const risk=(vis<1000||rain>=5||wind>=50)?'HIGH':(vis<5000||rain>0||wind>=30)?'ELEVATED':'NORMAL';
    value('#trafficRisk',risk);value('#liveMeasured',`Measurement: ${c.time.replace('T',' ')}`);
    $('#rainLayer').classList.toggle('active',rain>0);$('#visibilityLayer').classList.toggle('active',vis<5000);$('#intersection').classList.toggle('night',c.is_day!==1);
    const a=$('#weatherAdvisory');a.className='feedback '+(risk==='HIGH'?'error':risk==='ELEVATED'?'warning':'success');
    a.textContent=risk==='HIGH'?'Live conditions indicate high environmental traffic risk. Increase caution and verify signal visibility.':risk==='ELEVATED'?'Rain, wind or reduced visibility requires additional traffic-safety attention.':'Live environmental conditions currently indicate normal contextual risk.';
    status(source==='live'?'LIVE DATA':'CACHED DATA',source==='live'?'online':'cached');nextAt=Date.now()+REFRESH;
    if(window.state?.events) window.state.events.push({time:new Date().toISOString(),type:'LIVE DATA',msg:`Weather packet applied; derived traffic risk=${risk}`});
  }
  async function refresh(){
    status('CONNECTING','connecting');
    try{const r=await fetch(endpoint,{cache:'no-store'});if(!r.ok)throw Error(`HTTP ${r.status}`);const data=await r.json();localStorage.setItem(KEY,JSON.stringify({savedAt:Date.now(),data}));render(data,'live')}
    catch(err){const saved=localStorage.getItem(KEY);if(saved){render(JSON.parse(saved).data,'cache')}else{status('OFFLINE','offline');$('#weatherAdvisory').className='feedback error';$('#weatherAdvisory').textContent='Live weather is unavailable and no cached packet exists. Electrical laboratory simulation remains operational.'}}
  }
  $('#refreshLive').addEventListener('click',refresh);
  setInterval(()=>{const seconds=Math.max(0,Math.ceil((nextAt-Date.now())/1000));value('#liveNext',`Next refresh: ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`);if(seconds===0)refresh()},1000);
  refresh();
})();
