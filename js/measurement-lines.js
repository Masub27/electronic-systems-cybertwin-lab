(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const lines={
    dc24:{label:'LINE A — 24 V DC traffic controller',kind:'dc',voltage:24,current:.50,frequency:0,duty:100},
    ac12:{label:'LINE B — 12 V AC isolated transformer',kind:'ac',voltage:12,current:.25,frequency:50,duty:50},
    pwm5:{label:'LINE C — 5 V PWM controller output',kind:'pwm',voltage:5,current:.08,frequency:1000,duty:60},
    sensor10:{label:'LINE D — 0–10 V analogue sensor',kind:'analog',voltage:7.2,current:.02,frequency:2,duty:100},
    acCurrent:{label:'LINE E — 6 V AC current measurement loop',kind:'ac',voltage:6,current:1.50,frequency:50,duty:50}
  };
  let selected='dc24';
  function selectLine(id){selected=id;$$('.supply-line').forEach(b=>b.classList.toggle('active',b.dataset.line===id));$('#selectedLine').textContent='Selected: '+lines[id].label;$('#supplyDisplay').textContent=lines[id].kind==='ac'?`${lines[id].voltage.toFixed(1)} V AC`:`${lines[id].voltage.toFixed(1)} V`;$('#meterDisplay').textContent='0.00';$('#measurementFeedback').className='feedback neutral';$('#measurementFeedback').textContent='Supply selected. Choose a suitable instrument, function and connection.';if(typeof log==='function')log(`${lines[id].label} selected`,'SUPPLY')}
  $$('.supply-line').forEach(b=>b.addEventListener('click',()=>selectLine(b.dataset.line)));
  function drawScope(line,reverse=false){
    const canvas=$('#scopeCanvas'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#07110f';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#163e36';ctx.lineWidth=1;
    for(let x=0;x<w;x+=38){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=22){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    ctx.strokeStyle='#58f5aa';ctx.lineWidth=3;ctx.beginPath();const mid=h*.56,voltsDiv=line.voltage<=5?1:line.voltage<=12?5:10,amp=Math.min(82,(line.kind==='ac'?line.voltage*Math.SQRT2:line.voltage)/voltsDiv*22),cycles=line.frequency===0?0:line.kind==='pwm'?5:line.frequency<=2?2:4;
    for(let x=0;x<w;x++){
      let y=mid;if(line.kind==='dc')y=mid-amp;if(line.kind==='ac')y=mid-Math.sin(x/w*Math.PI*2*cycles)*amp;if(line.kind==='pwm'){const period=w/cycles;y=(x%period)<period*(line.duty/100)?mid-amp:mid+25}if(line.kind==='analog')y=mid-amp+Math.sin(x/w*Math.PI*2*cycles)*6;if(reverse)y=h-y;
      if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)
    }ctx.stroke();ctx.fillStyle='#b8f9eb';ctx.font='15px monospace';ctx.fillText('CH1',12,20);ctx.fillText(line.kind==='ac'?'AC coupling':'DC coupling',w-125,20);return {voltsDiv,timeDiv:line.frequency?((cycles/line.frequency)/10):.001}
  }
  function updateInstrument(){const scope=$('#instrument').value==='oscilloscope';$('#scopePanel').classList.toggle('hidden',!scope);$('#meterName').textContent=scope?'OSCILLOSCOPE CH1':$('#instrument').selectedOptions[0].textContent.toUpperCase();if(scope){$('#functionSelect').value='waveform';$('#connection').value='parallel'}}
  $('#instrument').addEventListener('change',updateInstrument);
  $('#takeMeasurement').onclick=()=>{
    const line=lines[selected],inst=$('#instrument').value,fn=$('#functionSelect').value,conn=$('#connection').value,red=$('#redProbe').value,black=$('#blackProbe').value,range=$('#rangeSelect').value;
    const probes=red!=='none'&&black!=='none'&&red!==black,reverse=red==='return'&&black==='high';let ok=false,value='OL',reason='Check the selected function, connection and probe positions.';
    const voltageInstrument=inst==='voltmeter'||inst==='multimeter';const currentInstrument=inst==='ammeter'||inst==='multimeter'||inst==='clamp';
    if(inst==='oscilloscope'&&fn==='waveform'&&conn==='parallel'&&probes){ok=true;value=`${line.voltage.toFixed(1)} V`;const scale=drawScope(line,reverse),peak=line.kind==='ac'?line.voltage*Math.SQRT2:line.voltage;$('#scopeReadout').textContent=`CH1 • ${line.kind.toUpperCase()} • TRIGGERED`;$('#scopeFrequency').textContent=line.frequency?(line.frequency>=1000?`${(line.frequency/1000).toFixed(1)} kHz`:`${line.frequency.toFixed(1)} Hz`):'0 Hz / DC';$('#scopeVoltage').textContent=line.kind==='ac'?`${line.voltage.toFixed(1)} Vrms / ${peak.toFixed(1)} Vpk`:`${line.voltage.toFixed(1)} V`;$('#scopeDuty').textContent=line.kind==='pwm'?`${line.duty}%`:'—';$('#scopeTimebase').textContent=scale.timeDiv>=.001?`${(scale.timeDiv*1000).toFixed(1)} ms`:`${(scale.timeDiv*1e6).toFixed(0)} µs`;$('#scopeScale').textContent=`${scale.voltsDiv} V`;reason='Waveform, frequency and scale captured across the selected line.'}
    else if(voltageInstrument&&conn==='parallel'&&probes&&((line.kind==='ac'&&fn==='vac')||(line.kind!=='ac'&&fn==='vdc'))){ok=true;value=`${reverse?'-':''}${line.voltage.toFixed(1)} V`;reason='Voltage measurement is correctly connected in parallel.'}
    else if(currentInstrument&&((inst==='clamp'&&conn==='clamp')||(inst!=='clamp'&&conn==='series'))&&((line.kind==='ac'&&fn==='aac')||(line.kind!=='ac'&&fn==='adc'))){ok=true;value=`${line.current.toFixed(2)} A`;reason=inst==='clamp'?'Current measured safely around one conductor.':'Ammeter inserted correctly in series.'}
    if(range==='2'&&line.voltage>2&&(fn==='vdc'||fn==='vac'||fn==='waveform')){ok=false;value='OL';reason='Selected voltage range is too low.'}
    if(conn==='wrong'){ok=false;value='FUSE';reason='Incorrect probe port: measurement rejected to protect the instrument.'}
    if((inst==='ammeter'||fn==='adc'||fn==='aac')&&conn==='parallel'){ok=false;value='DANGER';reason='An ammeter must not be connected directly across a supply. The virtual protection has opened the circuit.'}
    $('#meterDisplay').textContent=value;$('#measurementFeedback').className='feedback '+(ok?'success':'error');$('#measurementFeedback').textContent=`${ok?'Valid measurement':'Invalid or unsafe connection'}: ${reason}`;
    if(typeof log==='function')log(`${lines[selected].label}; ${inst}/${fn}; ${conn}; result=${value}; accepted=${ok}`,ok?'MEASURE':'TEST ERROR')
  };
  selectLine(selected);updateInstrument();
})();
