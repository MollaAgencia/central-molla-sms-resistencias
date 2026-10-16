/* =====================================================================
   Central do Cliente · SMS Resistências · Agência Molla
   Gráficos interativos dos relatórios mensais e trimestrais (ECharts).
   Cada página define window.DADOS e chama Molla.* para montar os gráficos.
   ===================================================================== */
(function(){
  var C = {
    laranja:'#FF7A33', laranjaEsc:'#E05E14', laranjaClaro:'#FFC9A8', navy:'#1A212B',
    navy2:'#3B4656', cinza:'#B9BEC6', cinzaClaro:'#D9DCE1', verde:'#2E7D4F', azul:'#2563EB',
    tinta:'#1E242C', muted:'#69717C', linha:'#E5E3DC', grade:'#EFEEE9'
  };
  var FONTE = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
  var MONO = "'JetBrains Mono',Consolas,monospace";

  var nf0 = new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0});
  var nf1 = new Intl.NumberFormat('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1});
  var nf2 = new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});

  function fmt(v, u){
    if (v === null || v === undefined || isNaN(v)) return '—';
    switch(u){
      case 'brl':  return 'R$ ' + nf2.format(v);
      case 'brl0': return 'R$ ' + nf0.format(v);
      case 'pct':  return nf1.format(v) + '%';
      case 'dec':  return nf1.format(v);
      default:     return nf0.format(v);
    }
  }
  function fmtEixo(v, u){
    if (u === 'brl' ) return 'R$ ' + (v % 1 ? nf1.format(v) : nf0.format(v));
    if (u === 'brl0') return v >= 1000 ? 'R$ ' + nf1.format(v/1000).replace(',0','') + ' mil' : 'R$ ' + nf0.format(v);
    if (u === 'pct' ) return nf0.format(v) + '%';
    return v >= 1000 ? nf1.format(v/1000).replace(',0','') + ' mil' : nf0.format(v);
  }

  /* ---------- agregações ---------- */
  function soma(a){ var s=0; for (var i=0;i<a.length;i++) s+= a[i]||0; return s; }
  function div(a,b){ return b ? a/b : null; }
  // metricas derivadas a partir de cliques, impressões, custo e pesos de topo
  function deriv(o){
    return {
      cliques:o.cl, impr:o.im, custo:o.cu,
      ctr: o.im ? 100*o.cl/o.im : null,
      cpc: o.cl ? o.cu/o.cl : null,
      sup: o.im ? o.sw/o.im : null,
      pos1: o.im ? o.pw/o.im : null
    };
  }

  /* ---------- tema base ---------- */
  function base(){
    return {
      animationDuration:500,
      textStyle:{fontFamily:FONTE,color:C.tinta},
      grid:{left:12,right:12,top:56,bottom:44,containLabel:true},
      legend:{top:0,left:0,itemWidth:14,itemHeight:10,itemGap:18,icon:'roundRect',
              textStyle:{fontSize:12.5,color:'#4a5058',fontFamily:FONTE}},
      tooltip:{trigger:'axis',confine:true,backgroundColor:'#fff',borderColor:C.linha,borderWidth:1,padding:[10,14],
               textStyle:{color:C.tinta,fontSize:12.5,fontFamily:FONTE},
               extraCssText:'box-shadow:0 12px 30px rgba(26,33,43,.14);border-radius:12px;',
               axisPointer:{type:'shadow',shadowStyle:{color:'rgba(255,122,51,.07)'}}}
    };
  }
  function eixoY(nome, u, lado, cor, extra){
    var e = {type:'value',name:nome,position:lado,nameLocation:'end',
      nameTextStyle:{color:cor,fontWeight:700,fontSize:11.5,fontFamily:MONO,align:lado==='left'?'left':'right',padding:[0,0,4,0]},
      axisLine:{show:true,lineStyle:{color:cor,width:2}},axisTick:{show:false},
      axisLabel:{color:C.muted,fontSize:11,fontFamily:MONO,formatter:function(v){return fmtEixo(v,u);}},
      splitLine:{show:lado==='left',lineStyle:{color:C.grade}},
      splitNumber:5,min:0};
    if (extra) for (var k in extra) e[k]=extra[k];
    return e;
  }
  function eixoX(cats, rot){
    return {type:'category',data:cats,axisTick:{show:false},axisLine:{lineStyle:{color:C.linha,width:1.5}},
      axisLabel:{color:'#4a5058',fontSize:11.5,interval:0,rotate:rot||0,hideOverlap:true,fontFamily:FONTE}};
  }
  function tooltipComb(series, extras, catsLongas){
    return function(ps){
      if (!ps || !ps.length) return '';
      var i = ps[0].dataIndex;
      var cab = catsLongas ? catsLongas[i] : ps[0].axisValueLabel;
      var h = '<div style="font-weight:800;margin-bottom:6px">'+cab+'</div>';
      series.forEach(function(s){
        h += '<div style="display:flex;justify-content:space-between;gap:18px"><span><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:'+s.cor+';margin-right:7px"></span>'+s.nome+'</span><b style="font-family:'+MONO+'">'+fmt(s.dados[i],s.u)+'</b></div>';
      });
      (extras||[]).forEach(function(s){
        h += '<div style="display:flex;justify-content:space-between;gap:18px;color:#69717C"><span style="padding-left:16px">'+s.nome+'</span><span style="font-family:'+MONO+'">'+fmt(s.dados[i],s.u)+'</span></div>';
      });
      return h;
    };
  }

  /* ---------- gráfico combinado: barras no eixo esquerdo, linha no direito ---------- */
  function combo(inst, cfg){
    var o = base();
    var corBarra = cfg.barra.cor || C.laranja, corLinha = cfg.linha ? (cfg.linha.cor || C.navy) : null;
    var dadosBarra = cfg.barra.dados.map(function(v,i){
      var dest = cfg.destaque ? cfg.destaque.indexOf(i) >= 0 : true;
      return {value: v===null?null:+(+v).toFixed(2), itemStyle:{color: dest ? corBarra : (cfg.barra.corFraca || C.laranjaClaro)}};
    });
    var ser = [{name:cfg.barra.nome,type:'bar',yAxisIndex:0,data:dadosBarra,barMaxWidth:46,
      itemStyle:{color:corBarra,borderRadius:[4,4,0,0]},
      label:{show:!!cfg.rotulos,position:'top',fontSize:10.5,fontFamily:MONO,color:'#4a5058',formatter:function(p){return fmtEixo(p.value,cfg.barra.u);}}}];
    var eixos = [eixoY(cfg.barra.eixo || cfg.barra.nome, cfg.barra.u, 'left', corBarra)];
    var tt = [{nome:cfg.barra.nome,dados:cfg.barra.dados,u:cfg.barra.u,cor:corBarra}];
    if (cfg.empilhar){
      ser[0].stack='s';
      cfg.empilhar.forEach(function(s){
        ser.push({name:s.nome,type:'bar',stack:'s',yAxisIndex:0,data:s.dados.map(function(v){return v===null?null:+(+v).toFixed(2);}),
          barMaxWidth:46,itemStyle:{color:s.cor,borderRadius:[4,4,0,0]}});
        tt.push({nome:s.nome,dados:s.dados,u:cfg.barra.u,cor:s.cor});
      });
      ser[0].itemStyle={color:corBarra,borderRadius:[0,0,0,0]};
    }
    if (cfg.linha){
      var ext = {};
      if (cfg.linha.u === 'pct' && cfg.linha.max100) ext.max = 100;
      eixos.push(eixoY(cfg.linha.eixo || cfg.linha.nome, cfg.linha.u, 'right', corLinha, ext));
      if (cfg.linha.soPontos) ser.push({name:cfg.linha.nome,type:'scatter',yAxisIndex:1,data:cfg.linha.dados.map(function(v){return v===null?null:+(+v).toFixed(2);}),
        symbolSize:12,itemStyle:{color:corLinha,borderColor:'#fff',borderWidth:2},z:5});
      else ser.push({name:cfg.linha.nome,type:'line',yAxisIndex:1,data:cfg.linha.dados.map(function(v){return v===null?null:+(+v).toFixed(2);}),
        smooth:false,connectNulls:true,symbol:'circle',symbolSize:cfg.linha.pontos===false?0:8,showSymbol:cfg.linha.pontos!==false,
        lineStyle:{width:2.5,color:corLinha},itemStyle:{color:corLinha,borderColor:'#fff',borderWidth:2},z:5});
      tt.push({nome:cfg.linha.nome,dados:cfg.linha.dados,u:cfg.linha.u,cor:corLinha});
    }
    (cfg.linhasExtras||[]).forEach(function(s){
      ser.push({name:s.nome,type:'line',yAxisIndex:1,data:s.dados,symbol:'circle',symbolSize:7,
        lineStyle:{width:2,color:s.cor,type:s.tracejado?'dashed':'solid'},itemStyle:{color:s.cor,borderColor:'#fff',borderWidth:2},z:4});
      tt.push({nome:s.nome,dados:s.dados,u:cfg.linha.u,cor:s.cor});
    });
    if (cfg.marca){
      ser[0].markLine = {silent:true,symbol:'none',label:{formatter:cfg.marca.texto,color:C.laranjaEsc,fontWeight:700,fontSize:11,fontFamily:MONO,position:'insideEndTop'},
        lineStyle:{color:C.laranjaEsc,type:'dashed',width:1.5},data:[{xAxis:cfg.marca.x}]};
    }
    o.xAxis = eixoX(cfg.cats, cfg.rotacao);
    if (cfg.cats.length > 16) o.xAxis.axisLabel.interval = 'auto';
    o.yAxis = eixos;
    if (cfg.faixas && cfg.faixas.length) ser[0].markArea = {silent:true,itemStyle:{color:'rgba(105,113,124,.10)'},
      label:{color:C.muted,fontSize:10.5,fontFamily:MONO,position:'insideTop'},data:cfg.faixas.map(function(f){ return [{name:f.nome,xAxis:f.de},{xAxis:f.ate}]; })};
    o.series = ser;
    o.tooltip.formatter = tooltipComb(tt, cfg.extrasTooltip, cfg.catsLongas);
    if (cfg.zoom){ o.dataZoom=[{type:'inside'},{type:'slider',height:18,bottom:6,borderColor:C.linha,fillerColor:'rgba(255,122,51,.12)',handleStyle:{color:C.laranja},textStyle:{fontSize:10,color:C.muted}}]; o.grid.bottom=58; }
    if (cfg.rotacao) { o.grid.left = 34; o.grid.bottom = 52; }
    if (cfg.gridLeft) o.grid.left = cfg.gridLeft;
    inst.setOption(o, true);
  }

  /* ---------- linhas simples (mesma grandeza) ---------- */
  function linhas(inst, cfg){
    var o = base();
    o.tooltip.axisPointer = {type:'line',lineStyle:{color:C.cinza,width:1}};
    o.xAxis = eixoX(cfg.cats, cfg.rotacao); o.xAxis.boundaryGap = false; o.grid.right = 28; o.grid.left = 16;
    o.yAxis = [eixoY(cfg.eixo, cfg.u, 'left', C.navy2, cfg.max ? {max:cfg.max} : (cfg.min!==undefined?{min:cfg.min}:null))];
    var tt = [];
    o.series = cfg.series.map(function(s){
      tt.push({nome:s.nome,dados:s.dados,u:cfg.u,cor:s.cor});
      return {name:s.nome,type:'line',data:s.dados.map(function(v){return v===null?null:+(+v).toFixed(2);}),symbol:'circle',symbolSize:8,connectNulls:false,
        lineStyle:{width:2.5,color:s.cor,type:s.tracejado?'dashed':'solid'},itemStyle:{color:s.cor,borderColor:'#fff',borderWidth:2},
        areaStyle:s.area?{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'rgba(255,122,51,.18)'},{offset:1,color:'rgba(255,122,51,0)'}]}}:undefined};
    });
    if (cfg.marca) o.series[0].markLine = {silent:true,symbol:'none',label:{formatter:cfg.marca.texto,color:C.laranjaEsc,fontWeight:700,fontSize:11,fontFamily:MONO,position:'insideEndTop'},
        lineStyle:{color:C.laranjaEsc,type:'dashed',width:1.5},data:[{xAxis:cfg.marca.x}]};
    o.tooltip.formatter = tooltipComb(tt, cfg.extrasTooltip, cfg.catsLongas);
    inst.setOption(o, true);
  }

  /* ---------- filtros ---------- */
  function montarFiltros(cont, filtros, estado, aoMudar){
    if (!cont) return;
    filtros.forEach(function(f){
      var w = document.createElement('div'); w.className='filtro';
      var l = document.createElement('span'); l.textContent=f.rotulo; w.appendChild(l);
      if (f.tipo === 'sel'){
        var s = document.createElement('select'); s.className='sel'; s.setAttribute('aria-label',f.rotulo);
        f.opcoes.forEach(function(op){ var e=document.createElement('option'); e.value=op.v; e.textContent=op.t; if (op.v===estado[f.id]) e.selected=true; s.appendChild(e); });
        s.addEventListener('change',function(){ estado[f.id]=s.value; aoMudar(); });
        w.appendChild(s);
      } else {
        var g = document.createElement('div'); g.className='seg'; g.setAttribute('role','group'); g.setAttribute('aria-label',f.rotulo);
        f.opcoes.forEach(function(op){
          var b=document.createElement('button'); b.type='button'; b.textContent=op.t; b.dataset.v=op.v;
          if (op.v===estado[f.id]) b.className='on';
          b.setAttribute('aria-pressed', op.v===estado[f.id] ? 'true':'false');
          b.addEventListener('click',function(){
            estado[f.id]=op.v;
            [].forEach.call(g.children,function(x){ var on = x===b; x.className=on?'on':''; x.setAttribute('aria-pressed',on?'true':'false'); });
            aoMudar();
          });
          g.appendChild(b);
        });
        w.appendChild(g);
      }
      cont.appendChild(w);
    });
  }

  var instancias = [];
  function iniciar(id){
    var el = document.getElementById(id); if (!el || !window.echarts) return null;
    var inst = echarts.init(el, null, {renderer:'svg'});
    instancias.push(inst); return inst;
  }
  window.addEventListener('resize', function(){ instancias.forEach(function(i){ i.resize(); }); });
  window.addEventListener('beforeprint', function(){ instancias.forEach(function(i){ i.resize(); }); });

  /* ---------- pares de métricas usados nos seletores ---------- */
  var PARES = {
    volume:   {t:'Cliques × custo por clique', barra:['cliques','Cliques','int','Cliques'], linha:['cpc','Custo por clique','brl','R$ por clique']},
    invest:   {t:'Investimento × taxa de clique', barra:['custo','Investimento','brl0','Investimento'], linha:['ctr','Taxa de clique (CTR)','pct','CTR']},
    presenca: {t:'Impressões × presença no topo', barra:['impr','Impressões','int','Impressões'], linha:['sup','Presença no topo','pct','% no topo']}
  };
  function opcoesPares(lista){ return lista.map(function(k){ return {v:k,t:PARES[k].t}; }); }

  var Molla = {fmt:fmt, cores:C};

  /* Evolução mensal da conta (histórico) */
  Molla.evolucao = function(id, cfg){
    var inst = iniciar(id); if (!inst) return;
    var H = cfg.meses; // [{label, longo, total:{...}, novas:{...}|null, antigas:{...}|null}]
    var estado = {par: cfg.par || 'volume', estr: 'total'};
    var filtros = [{id:'par',rotulo:'Visão',tipo:'seg',opcoes:opcoesPares(cfg.pares||['volume','invest','presenca'])}];
    if (cfg.estruturas) filtros.push({id:'estr',rotulo:'Campanhas',tipo:'seg',opcoes:[{v:'total',t:'Conta toda'},{v:'novas',t:'Estrutura nova'},{v:'antigas',t:'Estrutura anterior'}]});
    function desenhar(){
      var p = PARES[estado.par];
      var serie = function(m){ return H.map(function(h){ var o=h[estado.estr]; return o && o[m] !== undefined ? o[m] : null; }); };
      var dest = cfg.destaque || [H.length-1];
      combo(inst, {cats:H.map(function(h){return h.label;}), catsLongas:H.map(function(h){return h.longo;}),
        barra:{nome:p.barra[1],dados:serie(p.barra[0]),u:p.barra[2],eixo:p.barra[3]},
        linha:{nome:p.linha[1],dados:serie(p.linha[0]),u:p.linha[2],eixo:p.linha[3],max100:estado.par==='presenca'},
        destaque:dest, rotacao:H.length>12?40:0, marca:cfg.marca,
        extrasTooltip:[
          {nome:'Impressões',dados:serie('impr'),u:'int'},
          {nome:'Investimento',dados:serie('custo'),u:'brl'},
          {nome:'CTR',dados:serie('ctr'),u:'pct'},
          {nome:'Presença no topo',dados:serie('sup'),u:'pct'}
        ].filter(function(x){ return x.nome!==p.barra[1] && x.nome!==p.linha[1] && !(estado.par==='invest'&&x.nome==='CTR') && !(estado.par==='presenca'&&x.nome==='Presença no topo'); })
      });
    }
    montarFiltros(document.getElementById(id+'-filtros'), filtros, estado, desenhar);
    desenhar();
  };

  /* Dia a dia (ou semana a semana) por campanha */
  Molla.diario = function(id, cfg){
    var inst = iniciar(id); if (!inst) return;
    var D = cfg.diario; // {dias:[...], rotulos:[...], semanas:[{rot, ini, fim, idx:[...]}], camp:{nome:{cl,im,cu,sw,pw}}, nomes:{id:curto}}
    var estado = {camp:'__todas', par:'volume', gran: cfg.gran || 'dia'};
    var opsCamp = [{v:'__todas',t:'Todas as campanhas'}].concat(Object.keys(D.camp).sort(function(a,b){ return (D.nomes[a]||a).localeCompare(D.nomes[b]||b); }).map(function(k){ return {v:k,t:D.nomes[k]||k}; }));
    var filtros = [{id:'camp',rotulo:'Campanha',tipo:'sel',opcoes:opsCamp},
                   {id:'par',rotulo:'Visão',tipo:'seg',opcoes:opcoesPares(['volume','invest','presenca'])}];
    if (D.semanas && D.semanas.length > 1) filtros.push({id:'gran',rotulo:'Período',tipo:'seg',opcoes:[{v:'dia',t:'Dia'},{v:'semana',t:'Semana'}]});
    function base1(){
      var n = D.dias.length, z = function(){ var a=[]; for(var i=0;i<n;i++) a.push(0); return a; };
      var o = {cl:z(),im:z(),cu:z(),sw:z(),pw:z()};
      var ks = estado.camp==='__todas' ? Object.keys(D.camp) : [estado.camp];
      ks.forEach(function(k){ var c=D.camp[k]; for (var i=0;i<n;i++){ o.cl[i]+=c.cl[i]; o.im[i]+=c.im[i]; o.cu[i]+=c.cu[i]; o.sw[i]+=c.sw[i]; o.pw[i]+=c.pw[i]; } });
      return o;
    }
    function desenhar(){
      var o = base1(), grupos, cats, longas;
      if (estado.gran==='semana'){
        grupos = D.semanas.map(function(s){ return s.idx; }); cats = D.semanas.map(function(s){ return s.rot; }); longas = D.semanas.map(function(s){ return s.longo; });
      } else {
        grupos = D.dias.map(function(_,i){ return [i]; }); cats = D.rotulos; longas = D.longos;
      }
      var pts = grupos.map(function(g){
        var a={cl:0,im:0,cu:0,sw:0,pw:0}; g.forEach(function(i){ a.cl+=o.cl[i]; a.im+=o.im[i]; a.cu+=o.cu[i]; a.sw+=o.sw[i]; a.pw+=o.pw[i]; });
        return deriv(a);
      });
      var p = PARES[estado.par];
      var s = function(m){ return pts.map(function(x){ return x[m]; }); };
      var faixas = [];
      if (estado.gran==='dia' && D.semVeiculacao){
        D.semVeiculacao.forEach(function(f){ if (cats.indexOf(f.de)>=0) faixas.push({nome:f.nome,de:f.de,ate:cats.indexOf(f.ate)>=0?f.ate:cats[cats.length-1]}); });
      }
      combo(inst, {cats:cats, catsLongas:longas, faixas:faixas,
        barra:{nome:p.barra[1],dados:s(p.barra[0]),u:p.barra[2],eixo:p.barra[3]},
        linha:{nome:p.linha[1],dados:s(p.linha[0]),u:p.linha[2],eixo:p.linha[3],max100:estado.par==='presenca',pontos:estado.gran==='semana'},
        rotacao: estado.gran==='dia' && cats.length>40 ? 0 : 0, zoom: estado.gran==='dia' && cats.length>45,
        extrasTooltip:[{nome:'Impressões',dados:s('impr'),u:'int'},{nome:'Investimento',dados:s('custo'),u:'brl'},{nome:'CTR',dados:s('ctr'),u:'pct'},{nome:'Presença no topo',dados:s('sup'),u:'pct'}]
          .filter(function(x){ return x.nome!==p.barra[1] && x.nome!==p.linha[1] && !(estado.par==='invest'&&x.nome==='CTR') && !(estado.par==='presenca'&&x.nome==='Presença no topo'); })
      });
      var tot = deriv({cl:soma(o.cl),im:soma(o.im),cu:soma(o.cu),sw:soma(o.sw),pw:soma(o.pw)});
      var r = document.getElementById(id+'-resumo');
      if (r) r.innerHTML = '<span>'+(estado.camp==='__todas'?'Todas as campanhas da estrutura nova':(D.nomes[estado.camp]||estado.camp))+'</span><span><b>'+fmt(tot.cliques)+'</b> cliques · <b>'+fmt(tot.custo,'brl')+'</b> · CPC <b>'+fmt(tot.cpc,'brl')+'</b> · CTR <b>'+fmt(tot.ctr,'pct')+'</b> · topo <b>'+fmt(tot.sup,'pct')+'</b></span>';
    }
    montarFiltros(document.getElementById(id+'-filtros'), filtros, estado, desenhar);
    desenhar();
  };

  /* Campanhas lado a lado */
  Molla.campanhas = function(id, cfg){
    var inst = iniciar(id); if (!inst) return;
    var L = cfg.lista; // [{curto, longo, cliques, impr, custo, ctr, cpc, sup, estrutura}]
    var estado = {par:'volume', estr:'todas'};
    var filtros = [{id:'par',rotulo:'Visão',tipo:'seg',opcoes:opcoesPares(['volume','invest','presenca'])}];
    var temAntigas = L.some(function(x){ return x.estrutura==='antiga'; });
    if (temAntigas) filtros.push({id:'estr',rotulo:'Estrutura',tipo:'seg',opcoes:[{v:'todas',t:'Todas'},{v:'nova',t:'Nova'},{v:'antiga',t:'Anterior'}]});
    function desenhar(){
      var p = PARES[estado.par];
      var l = L.filter(function(x){ return estado.estr==='todas' || x.estrutura===estado.estr; })
               .slice().sort(function(a,b){ return (b[p.barra[0]]||0)-(a[p.barra[0]]||0); });
      combo(inst, {cats:l.map(function(x){return x.curto;}), catsLongas:l.map(function(x){return x.longo;}),
        barra:{nome:p.barra[1],dados:l.map(function(x){return x[p.barra[0]];}),u:p.barra[2],eixo:p.barra[3]},
        linha:{nome:p.linha[1],dados:l.map(function(x){return x[p.linha[0]];}),u:p.linha[2],eixo:p.linha[3],max100:estado.par==='presenca',soPontos:true},
        rotacao: l.length>6 ? 30 : 0,
        extrasTooltip:[{nome:'Impressões',dados:l.map(function(x){return x.impr;}),u:'int'},{nome:'Investimento',dados:l.map(function(x){return x.custo;}),u:'brl'},
                       {nome:'CTR',dados:l.map(function(x){return x.ctr;}),u:'pct'},{nome:'Presença no topo',dados:l.map(function(x){return x.sup;}),u:'pct'}]
          .filter(function(x){ return x.nome!==p.barra[1] && x.nome!==p.linha[1] && !(estado.par==='invest'&&x.nome==='CTR') && !(estado.par==='presenca'&&x.nome==='Presença no topo'); })
      });
    }
    montarFiltros(document.getElementById(id+'-filtros'), filtros, estado, desenhar);
    desenhar();
  };

  /* Participação: estrutura nova × anterior (empilhado, mesma grandeza) */
  Molla.mix = function(id, cfg){
    var inst = iniciar(id); if (!inst) return;
    var H = cfg.meses;
    var estado = {m:'cliques'};
    var filtros = [{id:'m',rotulo:'Métrica',tipo:'seg',opcoes:[{v:'cliques',t:'Cliques'},{v:'custo',t:'Investimento'},{v:'impr',t:'Impressões'}]}];
    function desenhar(){
      var u = estado.m==='custo' ? 'brl0' : 'int';
      var nov = H.map(function(h){ return h.novas ? h.novas[estado.m] : 0; });
      var ant = H.map(function(h){ return h.antigas ? h.antigas[estado.m] : null; });
      var shr = H.map(function(h,i){ if (ant[i]===null) return null; var t=(nov[i]||0)+(ant[i]||0); return t ? 100*(nov[i]||0)/t : null; });
      combo(inst, {cats:H.map(function(h){return h.label;}), catsLongas:H.map(function(h){return h.longo;}),
        barra:{nome:'Estrutura anterior',dados:ant,u:u,eixo:{cliques:'Cliques',custo:'Investimento',impr:'Impressões'}[estado.m],cor:C.cinza},
        empilhar:[{nome:'Estrutura nova (Molla)',dados:nov,cor:C.laranja}],
        linha:{nome:'Participação da estrutura nova',dados:shr,u:'pct',eixo:'% da conta',max100:true,cor:C.navy}
      });
    }
    montarFiltros(document.getElementById(id+'-filtros'), filtros, estado, desenhar);
    desenhar();
  };

  /* Presença no topo e 1ª posição */
  Molla.presenca = function(id, cfg){
    var inst = iniciar(id); if (!inst) return;
    linhas(inst, {cats:cfg.cats, catsLongas:cfg.longos, eixo:'% das impressões', u:'pct', max:100, marca:cfg.marca,
      series:[{nome:'Anúncio no topo da página',dados:cfg.sup,cor:C.laranja,area:true},{nome:'Anúncio em 1º lugar',dados:cfg.pos1,cor:C.navy}]});
  };

  /* Barras horizontais simples (termos, palavras) com segundo eixo opcional */
  Molla.ranking = function(id, cfg){
    var inst = iniciar(id); if (!inst) return;
    var estado = {par: cfg.pares ? cfg.pares[0].v : null};
    function desenhar(){
      var p = cfg.pares ? cfg.pares.filter(function(x){return x.v===estado.par;})[0] : cfg;
      var l = cfg.itens.slice().sort(function(a,b){ return (b[p.barra]||0)-(a[p.barra]||0); }).slice(0, cfg.max||12).reverse();
      var o = base();
      o.grid = {left:12,right:24,top:52,bottom:34,containLabel:true};
      o.yAxis = {type:'category',data:l.map(function(x){return x.rot;}),axisTick:{show:false},axisLine:{lineStyle:{color:C.linha}},
        axisLabel:{color:'#4a5058',fontSize:11.5,width:220,overflow:'truncate'}};
      o.xAxis = [ {type:'value',name:p.nomeBarra,position:'bottom',nameLocation:'middle',nameGap:26,min:0,
          nameTextStyle:{color:C.laranjaEsc,fontWeight:700,fontSize:11,fontFamily:MONO},
          axisLine:{show:true,lineStyle:{color:C.laranja,width:2}},axisLabel:{color:C.muted,fontSize:10.5,fontFamily:MONO,formatter:function(v){return fmtEixo(v,p.uBarra);}},
          splitLine:{lineStyle:{color:C.grade}}} ];
      var tt=[{nome:p.nomeBarra,dados:l.map(function(x){return x[p.barra];}),u:p.uBarra,cor:C.laranja}];
      o.series = [{name:p.nomeBarra,type:'bar',xAxisIndex:0,data:l.map(function(x){return +(x[p.barra]||0).toFixed(2);}),barMaxWidth:18,itemStyle:{color:C.laranja,borderRadius:[0,4,4,0]}}];
      if (p.ponto){
        o.xAxis.push({type:'value',name:p.nomePonto,position:'top',nameLocation:'middle',nameGap:24,min:0,max:p.uPonto==='pct'?100:null,
          nameTextStyle:{color:C.navy,fontWeight:700,fontSize:11,fontFamily:MONO},
          axisLine:{show:true,lineStyle:{color:C.navy,width:2}},axisLabel:{color:C.muted,fontSize:10.5,fontFamily:MONO,formatter:function(v){return fmtEixo(v,p.uPonto);}},splitLine:{show:false}});
        o.series.push({name:p.nomePonto,type:'scatter',xAxisIndex:1,data:l.map(function(x){return x[p.ponto]===null?null:+(+x[p.ponto]).toFixed(2);}),symbolSize:11,
          itemStyle:{color:C.navy,borderColor:'#fff',borderWidth:2},z:5});
        tt.push({nome:p.nomePonto,dados:l.map(function(x){return x[p.ponto];}),u:p.uPonto,cor:C.navy});
        o.grid.top = 64;
      }
      o.legend.top = 0;
      o.tooltip.formatter = tooltipComb(tt, (cfg.extras||[]).map(function(e){ return {nome:e.nome,dados:l.map(function(x){return x[e.campo];}),u:e.u}; }), l.map(function(x){return x.longo||x.rot;}));
      inst.setOption(o,true);
    }
    if (cfg.pares) montarFiltros(document.getElementById(id+'-filtros'), [{id:'par',rotulo:'Visão',tipo:'seg',opcoes:cfg.pares.map(function(x){return {v:x.v,t:x.t};})}], estado, desenhar);
    desenhar();
  };

  /* Tabela ordenável */
  Molla.tabela = function(id){
    var t = document.getElementById(id); if (!t) return;
    var ths = t.querySelectorAll('th.sort');
    [].forEach.call(ths, function(th, idx){
      th.tabIndex = 0;
      function ordenar(){
        var col = [].indexOf.call(th.parentNode.children, th);
        var asc = !th.classList.contains('desc') && th.classList.contains('asc') ? false : (th.classList.contains('desc') ? true : false);
        [].forEach.call(ths, function(x){ x.classList.remove('asc','desc'); });
        th.classList.add(asc ? 'asc' : 'desc');
        var tb = t.tBodies[0];
        var linhas = [].slice.call(tb.rows).filter(function(r){ return !r.classList.contains('tot'); });
        var tot = [].slice.call(tb.rows).filter(function(r){ return r.classList.contains('tot'); });
        linhas.sort(function(a,b){
          var va = a.cells[col].getAttribute('data-v'), vb = b.cells[col].getAttribute('data-v');
          if (va !== null && vb !== null){ va=+va; vb=+vb; return asc ? va-vb : vb-va; }
          va = a.cells[col].textContent; vb = b.cells[col].textContent;
          return asc ? va.localeCompare(vb) : vb.localeCompare(va);
        });
        linhas.concat(tot).forEach(function(r){ tb.appendChild(r); });
      }
      th.addEventListener('click', ordenar);
      th.addEventListener('keydown', function(e){ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); ordenar(); } });
    });
  };

  /* Navegação ativa no menu de seções */
  Molla.navegacao = function(){
    var links=[].slice.call(document.querySelectorAll('.docnav a'));
    var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));});
    function onScroll(){
      var y=window.scrollY+140, act=0;
      for(var i=0;i<secs.length;i++){ if(secs[i]&&secs[i].offsetTop<=y) act=i; }
      links.forEach(function(a,i){ a.classList.toggle('active',i===act); });
    }
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  };

  window.Molla = Molla;
})();
