(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const lines={
    dc24:{label:'LINE A — 24 V DC traffic controller',kind:'dc',voltage:24,current:.50,frequency:0,duty:100},
    ac12:{label:'LINE B — 12 V AC isolated transformer',kind:'ac',voltage:12,current:.25,frequency:50,duty:50},
    pwm5:{label:'LINE C — 5 V PWM controller output',kind:'pwm',voltage:5,current:.08,frequency:1000,duty:60},
    sensor10:{label:'LINE D — 0–10 V analogue sensor',kind:'analog',voltage:7.2,current:.02,frequency:2,duty:100}
  };
  let selected='dc24';
  function selectLine(id){selected=id;$$('.supply-line').forEach(b=>b.classList.toggle('active',b.dataset.line===id));$('#selectedLine').textContent='Selected: '+lines[id].label;$('#supplyDisplay').textContent=lines[id].kind==='ac'?`${lines[id].voltage.toFixed(1)} V AC`:`${lines[id].voltage.toFixed(1)} V`;$('#meterDisplay').textContent='0.00';$('#measurementFeedback').className='feedback neutral';$('#measurementFeedback').textContent='Supply selected. Choose a suitable instrument, function and connection.';if(typeof log==='function')log(`${lines[id].label} selected`,'SUPPLY')}
  $$('.supply-line').forEach(b=>b.addEventListener('click',()=>selectLine(b.dataset.line)));
  function drawScope(line,reverse=false){
    const canvas=$('#scopeCanvas'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#07110f';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#163e36';ctx.lineWidth=1;
    for(let x=0;x<w;x+=38){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=22){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    ctx.strokeStyle='#58f5aa';ctx.lineWidth=3;ctx.beginPath();const mid=h*.62,amp=Math.min(78,line.voltage*4);
    for(let x=0;x<w;x++){
      let y=mid;if(line.kind==='dc')y=mid-amp;if(line.kind==='ac')y=mid-Math.sin(x/w*Math.PI*8)*amp;if(line.kind==='pwm')y=(x%120)<72?mid-amp:mid+25;if(line.kind==='analog')y=mid-amp+Math.sin(x/w*Math.PI*4)*5;if(reverse)y=h-y;
      if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)
    }ctx.stroke();ctx.fillStyle='#b8f9eb';ctx.font='15px monospace';ctx.fillText('CH1',12,20)
  }
  function updateInstrument(){const scope=$('#instrument').value==='oscilloscope';$('#scopePanel').classList.toggle('hidden',!scope);$('#meterName').textContent=scope?'OSCILLOSCOPE CH1':$('#instrument').selectedOptions[0].textContent.toUpperCase();if(scope){$('#functionSelect').value='waveform';$('#connection').value='parallel'}}
  $('#instrument').addEventListener('change',updateInstrument);
  $('#takeMeasurement').onclick=()=>{
    const line=lines[selected],inst=$('#instrument').value,fn=$('#functionSelect').value,conn=$('#connection').value,red=$('#redProbe').value,black=$('#blackProbe').value,range=$('#rangeSelect').value;
    const probes=red!=='none'&&black!=='none'&&red!==black,reverse=red==='return'&&black==='high';let ok=false,value='OL',reason='Check the selected function, connection and probe positions.';
    const voltageInstrument=inst==='voltmeter'||inst==='multimeter';const currentInstrument=inst==='ammeter'||inst==='multimeter'||inst==='clamp';
    if(inst==='oscilloscope'&&fn==='waveform'&&conn==='parallel'&&probes){ok=true;value=`${line.voltage.toFixed(1)} V`;drawScope(line,reverse);$('#scopeReadout').textContent=`CH1 • ${line.voltage.toFixed(1)} V • ${line.frequency?line.frequency+' Hz':'DC'}${line.kind==='pwm'?' • '+line.duty+'% duty':''}`;reason='Waveform captured across the selected line.'}
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
