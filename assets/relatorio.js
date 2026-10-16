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

  /* =====================================================================
     LEITURA DA MOLLA: um parágrafo curto que muda a cada filtro.
     Cada gerador monta frases candidatas, mantém só as que valem para o
     recorte escolhido e mostra as primeiras (no máximo 3).
     ===================================================================== */
  function caixaInsight(id){
    var el = document.getElementById(id); if (!el) return null;
    var box = document.getElementById(id+'-insight');
    if (!box){
      box = document.createElement('div'); box.className='insight'; box.id=id+'-insight'; box.setAttribute('aria-live','polite');
      el.insertAdjacentElement('afterend', box);
    }
    return box;
  }
  function mostrar(id, titulo, frases, reserva){
    var box = caixaInsight(id); if (!box) return;
    var ok = frases.filter(function(f){ return f && f.ok; }).map(function(f){ return f.t; }).slice(0,3);
    if (!ok.length && reserva) ok = [reserva];
    box.innerHTML = '<div class="ins-cab"><span class="ins-ic">✦</span>Leitura da Molla<span class="ins-rec">'+titulo+'</span></div><p>'+ok.join(' ')+'</p>';
  }
  function pc(a,b){ return (a===null||b===null||b===undefined||!b) ? null : 100*(a/b-1); }
  function p0(v){ return nf0.format(Math.abs(v)); }
  function pp(a,b){ return nf1.format(Math.abs(a-b)); }
  function B(x){ return '<b>'+x+'</b>'; }
  function agrega(lista){
    var a={cl:0,im:0,cu:0,sw:0,pw:0}, n=0;
    lista.forEach(function(o){ if(!o) return; n++; a.cl+=o.cliques||0; a.im+=o.impr||0; a.cu+=o.custo||0; a.sw+=(o.sup||0)*(o.impr||0); a.pw+=(o.pos1||0)*(o.impr||0); });
    return n ? deriv(a) : null;
  }
  function minus(s){ return s.charAt(0).toLowerCase()+s.slice(1); }

  // ---------- evolução mensal
  function insEvolucao(id, H, estado, dest, marca){
    var E = estado.estr;
    var cur = agrega(dest.map(function(i){ return H[i][E]; }));
    if (!cur){ mostrar(id,'', [], E==='antigas' ? 'A estrutura anterior não está detalhada neste período. A leitura completa do mês está na visão Conta toda.' : 'Esta estrutura ainda não estava no ar no período destacado.'); return; }
    var nome = dest.length>1 ? 'o trimestre' : minus(H[dest[0]].longo), noNome = dest.length>1 ? 'No trimestre' : 'Em '+nome;
    var i0 = dest[0], n = dest.length;
    var prevIdx = []; for (var k=i0-n;k<i0;k++) if (k>=0) prevIdx.push(k);
    var prev = prevIdx.length===n ? agrega(prevIdx.map(function(i){ return H[i][E]; })) : null;
    var nomePrev = n>1 ? 'o trimestre anterior' : (prevIdx.length ? H[prevIdx[0]].label : '');
    var aPrev = n>1 ? 'ao trimestre anterior' : 'a '+nomePrev, emPrev = n>1 ? 'no trimestre anterior' : 'em '+nomePrev;
    var mi = -1; if (marca) H.forEach(function(h,i){ if (h.label===marca.x) mi=i; });
    var pre = mi>0 && i0>=mi ? agrega(H.slice(0,mi).map(function(h){ return h.total; })) : null;
    var serie = function(m){ return H.slice(0, dest[n-1]+1).map(function(h){ return h[E] ? h[E][m] : null; }); };
    var ultimo = dest[n-1];
    var f = [];
    if (mi>=0 && ultimo < mi) f.push({ok:true, t:'Este é o retrato da conta antes da gestão da Agência Molla, que começou em março de 2026, e serve de régua para os meses seguintes.'});
    var maxDe = function(m){ var s=serie(m), mx=-1, im=-1, nn=0, prim=-1; s.forEach(function(v,i){ if(v!==null){ nn++; if(prim<0) prim=i; if(v>mx){mx=v;im=i;} } }); return {v:mx,i:nn>=4?im:-1,prim:prim}; };
    var dentro = mi>=0 && dest.indexOf(mi)>=0;
    if (dentro && E==='total'){
      var hm = H[mi].total, hp = H[mi-1] ? H[mi-1].total : null;
      f.push({ok:estado.par==='volume', t:H[mi].longo+' marca o início da gestão da Agência Molla. O primeiro efeito aparece na qualidade do clique, antes do volume: troque para a visão "Investimento × taxa de clique".'});
      if (hp) f.push({ok:hm.ctr>hp.ctr, t:'No primeiro mês de gestão, a taxa de clique saltou de '+fmt(hp.ctr,'pct')+' para '+B(fmt(hm.ctr,'pct'))+', e o anúncio em 1º lugar foi de '+fmt(hp.pos1,'pct')+' para '+fmt(hm.pos1,'pct')+'.'});
    }
    if (estado.par==='volume'){
      if (prev) f.push({ok:pc(cur.cliques,prev.cliques)>=1, t:'O volume cresceu '+B(p0(pc(cur.cliques,prev.cliques))+'%')+' em relação '+aPrev+', com '+fmt(cur.cliques)+' cliques.'});
      if (prev) f.push({ok:pc(cur.cpc,prev.cpc)<=-1, t:'Cada clique ficou '+B(p0(pc(cur.cpc,prev.cpc))+'% mais barato')+' que '+emPrev+' ('+fmt(cur.cpc,'brl')+').'});
      var pk = maxDe('cpc');
      if (pk.i>=0 && n===1) f.push({ok:pk.i!==ultimo && cur.cpc<pk.v*0.95, t:'O custo por clique está '+B(p0(pc(cur.cpc,pk.v))+'% abaixo')+' do pico da série, em '+H[pk.i].label+' ('+fmt(pk.v,'brl')+').'});
      var mxc = maxDe('cliques');
      if (n===1) f.push({ok:mxc.i===ultimo && ultimo>0, t:'É o '+B('maior volume de cliques')+' de toda a série desde '+H[mxc.prim].label+'.'});
      if (pre && n===1) f.push({ok:cur.cliques>pre.cliques/mi, t:'São '+B(p0(pc(cur.cliques,pre.cliques/mi))+'% mais visitas')+' que a média mensal antes da gestão Molla.'});
      if (pre && n>1) f.push({ok:cur.cliques/n>pre.cliques/mi, t:'A média de '+fmt(cur.cliques/n)+' cliques por mês fica '+B(p0(pc(cur.cliques/n,pre.cliques/mi))+'% acima')+' da média antes da gestão Molla.'});
    }
    if (estado.par==='invest'){
      if (pre) f.push({ok:cur.ctr>pre.ctr, t:'A taxa de clique de '+B(fmt(cur.ctr,'pct'))+' está '+pp(cur.ctr,pre.ctr)+' p.p. acima da média dos meses anteriores à gestão Molla ('+fmt(pre.ctr,'pct')+'): o anúncio ficou mais relevante para quem busca.'});
      var mxt = maxDe('ctr');
      if (n===1) f.push({ok:mxt.i===ultimo && ultimo>0, t:B('Maior taxa de clique da série')+', acompanhada desde '+H[mxt.prim].label+'.'});
      if (prev) f.push({ok:cur.ctr-prev.ctr>=0.2, t:'A taxa de clique subiu '+pp(cur.ctr,prev.ctr)+' p.p. contra '+nomePrev+'.'});
      if (prev) f.push({ok:(cur.cliques/cur.custo)>(prev.cliques/prev.custo)*1.02, t:'Cada R$ 100 investidos trouxeram '+B(nf0.format(100*cur.cliques/cur.custo)+' visitas')+', contra '+nf0.format(100*prev.cliques/prev.custo)+' '+emPrev+'.'});
      if (pre) f.push({ok:cur.ctr<=pre.ctr && cur.cliques/n>pre.cliques/mi, t:'Com '+fmt(cur.custo,'brl0')+' investidos, a conta trouxe '+fmt(cur.cliques)+' cliques, acima da média mensal antes da gestão Molla.'});
    }
    if (estado.par==='presenca'){
      if (pre) f.push({ok:cur.sup>pre.sup, t:'O anúncio apareceu no topo da página em '+B(fmt(cur.sup,'pct'))+' das exibições, '+pp(cur.sup,pre.sup)+' p.p. acima da média antes da gestão Molla.'});
      if (pre) f.push({ok:cur.pos1>pre.pos1, t:'Em 1º lugar, foram '+fmt(cur.pos1,'pct')+' das exibições, contra '+fmt(pre.pos1,'pct')+' na média anterior.'});
      if (prev) f.push({ok:pc(cur.impr,prev.impr)>=2, t:'As exibições cresceram '+B(p0(pc(cur.impr,prev.impr))+'%')+' contra '+nomePrev+', sem perder espaço no alto da página.'});
      var mxs = maxDe('sup');
      if (n===1) f.push({ok:mxs.i===ultimo && ultimo>0, t:B('Melhor presença no topo da série')+'.'});
      if (prev) f.push({ok:cur.sup-prev.sup>=0.5, t:'A presença no topo subiu '+pp(cur.sup,prev.sup)+' p.p. em relação '+aPrev+'.'});
    }
    // comparação entre estruturas no mesmo período
    var nov = agrega(dest.map(function(i){ return H[i].novas; })), ant = agrega(dest.map(function(i){ return H[i].antigas; }));
    if (E==='novas' && nov && ant) f.unshift({ok:nov.cpc<ant.cpc, t:'Na estrutura nova, o clique custou '+B(p0(pc(nov.cpc,ant.cpc))+'% menos')+' que na estrutura anterior no mesmo período ('+fmt(nov.cpc,'brl')+' contra '+fmt(ant.cpc,'brl')+').'});
    if (E==='novas' && nov && ant) f.splice(1,0,{ok:nov.ctr>ant.ctr, t:'A taxa de clique da estrutura nova foi de '+fmt(nov.ctr,'pct')+', contra '+fmt(ant.ctr,'pct')+' da anterior.'});
    if (E==='antigas' && ant) f = [];
    if (E==='antigas' && ant) f.unshift({ok:true, t:'A estrutura anterior fica aqui como referência: é a régua contra a qual a estrutura nova da Molla é medida.'+(nov && nov.cpc<ant.cpc ? ' No mesmo período, a nova entregou o clique '+B(p0(pc(nov.cpc,ant.cpc))+'% mais barato')+'.' : '')});
    mostrar(id, H[dest[0]].label+(n>1?' a '+H[ultimo].label:'')+' · '+{volume:'volume e custo',invest:'investimento e relevância',presenca:'presença'}[estado.par],
      f, noNome+', foram '+fmt(cur.cliques)+' cliques com '+fmt(cur.custo,'brl0')+' investidos e taxa de clique de '+fmt(cur.ctr,'pct')+'.');
  }

  // ---------- dia a dia / semana a semana
  function insDiario(id, D, estado, pts, longas, totSel, totAll){
    var sem = estado.gran==='semana', un = sem ? 'semana' : 'dia';
    var ativos = []; pts.forEach(function(p,i){ if (p.impr>0) ativos.push(i); });
    var nomeSel = estado.camp==='__todas' ? 'a estrutura nova' : (D.nomes[estado.camp]||estado.camp);
    var f = [];
    if (!ativos.length){ mostrar(id,nomeSel,[],'Esta campanha não teve exibições no período.'); return; }
    var best = ativos.reduce(function(a,i){ return pts[i].cliques>pts[a].cliques ? i : a; }, ativos[0]);
    var minClk = sem ? 15 : 5;
    var baratos = ativos.filter(function(i){ return pts[i].cliques>=minClk; });
    var barato = baratos.length ? baratos.reduce(function(a,i){ return pts[i].cpc<pts[a].cpc ? i : a; }, baratos[0]) : null;
    var meio = Math.floor(ativos.length/2);
    var h1 = agrega(ativos.slice(0,meio).map(function(i){ return pts[i]; })), h2 = agrega(ativos.slice(meio).map(function(i){ return pts[i]; }));
    var n1 = meio, n2 = ativos.length-meio;
    var sel = estado.camp!=='__todas';
    var em = sel ? 'em '+nomeSel : 'na estrutura nova';
    var quando = function(i){ return sem ? 'a semana de '+D.semanas[i].rot+' a '+(function(s){ var u=s.idx[s.idx.length-1]; return D.rotulos[u]; })(D.semanas[i]) : minus(longas[i]); };
    var porR = 100*totSel.cliques/totSel.custo, porRall = 100*totAll.cliques/totAll.custo;
    var conc = /concorrentes/i.test(nomeSel);
    if (sel && estado.par!=='presenca' && conc && totSel.cpc>totAll.cpc) f.push({ok:true, t:B(nomeSel)+' é uma frente de conquista: aparece para quem pesquisa marcas concorrentes e coloca a SMS na comparação, em buscas naturalmente mais disputadas.'});
    if (sel && estado.par!=='presenca' && totSel.cpc>totAll.cpc && totSel.sup>=70) f.push({ok:true, t:(conc?'Mesmo nessas buscas, o':'Em buscas das mais disputadas do setor, o')+' anúncio ficou no topo da página em '+B(fmt(totSel.sup,'pct'))+' das exibições.'});
    if (estado.par==='volume'){
      if (sel) f.push({ok:totSel.cpc<totAll.cpc, t:B(nomeSel)+' trouxe cliques a '+fmt(totSel.cpc,'brl')+', '+B(p0(pc(totSel.cpc,totAll.cpc))+'% abaixo')+' da média da estrutura nova.'});
      if (sel) f.push({ok:totSel.cliques/totAll.cliques>=0.1, t:'Responde por '+B(p0(100*totSel.cliques/totAll.cliques)+'% dos cliques')+' da estrutura nova no período.'});
      f.push({ok:pts[best].cliques>=(sem?20:5), t:(sem?'A melhor semana foi ':'O melhor dia foi ')+quando(best)+', com '+B(fmt(pts[best].cliques)+' cliques')+'.'});
      if (h1 && h2 && n1>=2) f.push({ok:h2.cpc<h1.cpc*0.97, t:'Na segunda metade do período, o custo por clique caiu '+B(p0(pc(h2.cpc,h1.cpc))+'%')+' em relação à primeira.'});
      var vr = (h1 && h2 && n1>=2) ? pc(h2.cliques/n2, h1.cliques/n1) : null;
      if (vr!==null) f.push({ok:Math.round(vr)>=3, t:'O ritmo de cliques por '+un+' com veiculação subiu '+B(p0(vr)+'%')+' da primeira para a segunda metade.'});
      if (barato!==null) f.push({ok:true, t:'O clique mais barato veio '+(sem?'n':'n')+(sem?'a semana de '+D.semanas[barato].rot:'o dia '+D.rotulos[barato])+': '+fmt(pts[barato].cpc,'brl')+'.'});
    }
    if (estado.par==='invest'){
      f.push({ok:!sel || porR>=porRall*0.9, t:'Cada R$ 100 investidos '+em+' trouxeram '+B(nf0.format(porR)+' visitas')+' ao site.'});
      if (sel) f.push({ok:totSel.ctr>totAll.ctr, t:'A taxa de clique de '+B(fmt(totSel.ctr,'pct'))+' supera a média da estrutura nova ('+fmt(totAll.ctr,'pct')+'), sinal de anúncio bem alinhado à busca.'});
      var ctrs = ativos.filter(function(i){ return pts[i].impr>=(sem?150:30); });
      if (ctrs.length){ var bc = ctrs.reduce(function(a,i){ return pts[i].ctr>pts[a].ctr ? i : a; }, ctrs[0]);
        f.push({ok:pts[bc].ctr>=5, t:'O pico de relevância foi '+(sem?'n':'em ')+quando(bc)+', com taxa de clique de '+B(fmt(pts[bc].ctr,'pct'))+'.'}); }
      if (h1 && h2 && n1>=2) f.push({ok:h2.ctr-h1.ctr>=0.2, t:'A taxa de clique subiu de '+fmt(h1.ctr,'pct')+' para '+fmt(h2.ctr,'pct')+' ao longo do período.'});
    }
    if (estado.par==='presenca'){
      var alto = ativos.filter(function(i){ return pts[i].sup>=75; }).length;
      f.push({ok:alto/ativos.length>=0.5, t:'Em '+B(alto+' de '+ativos.length+' '+(sem?'semanas':'dias'))+' com veiculação, mais de 75% das exibições ficaram no topo da página.'});
      if (sel) f.push({ok:totSel.sup>totAll.sup, t:B(nomeSel)+' aparece no topo em '+fmt(totSel.sup,'pct')+' das exibições, acima da média da estrutura nova ('+fmt(totAll.sup,'pct')+').'});
      f.push({ok:totSel.pos1>=35, t:'O anúncio foi o primeiro da página em '+B(fmt(totSel.pos1,'pct'))+' das exibições.'});
      var bs = ativos.filter(function(i){ return pts[i].impr>=(sem?150:30); });
      if (bs.length){ var b2 = bs.reduce(function(a,i){ return pts[i].sup>pts[a].sup ? i : a; }, bs[0]);
        f.push({ok:true, t:'O ponto mais alto foi '+quando(b2)+', com '+fmt(pts[b2].sup,'pct')+' no topo.'}); }
    }
    mostrar(id, nomeSel+' · '+(sem?'semana a semana':'dia a dia'), f, 'No recorte, foram '+fmt(totSel.cliques)+' cliques com '+fmt(totSel.custo,'brl')+' investidos.');
  }

  // ---------- campanhas lado a lado
  function insCampanhas(id, l, estado, L_TODAS){
    var f = [], tot = agrega(l);
    if (!l.length || !tot){ mostrar(id,'',[],'Sem campanhas neste recorte.'); return; }
    if (estado.estr==='antiga'){
      var nv = agrega(L_TODAS.filter(function(x){ return x.estrutura==='nova'; }));
      mostrar(id, 'estrutura anterior', [{ok:true, t:'A estrutura anterior aparece somada e serve de referência para a migração da verba.'+(nv && nv.cpc<tot.cpc ? ' Contra ela, a estrutura nova entrega o clique '+B(p0(pc(nv.cpc,tot.cpc))+'% mais barato')+' ('+fmt(nv.cpc,'brl')+' contra '+fmt(tot.cpc,'brl')+') e taxa de clique de '+fmt(nv.ctr,'pct')+'.' : '')}]);
      return;
    }
    var temAnt = l.some(function(x){ return x.estrutura==='antiga'; });
    var lN = temAnt && l.some(function(x){ return x.estrutura==='nova'; }) ? l.filter(function(x){ return x.estrutura==='nova'; }) : l;
    var totN = agrega(lN), doTot = lN!==l ? ' da estrutura nova' : ' do total';
    var porCl = lN.slice().sort(function(a,b){ return b.cliques-a.cliques; });
    var cand = lN.filter(function(x){ return x.cliques>=20; });
    var barata = cand.length ? cand.reduce(function(a,x){ return x.cpc<a.cpc ? x : a; }) : null;
    var relevante = cand.length ? cand.reduce(function(a,x){ return x.ctr>a.ctr ? x : a; }) : null;
    if (estado.par==='volume'){
      f.push({ok:porCl[0].estrutura!=='antiga', t:B(porCl[0].longo)+' lidera em visitas, com '+fmt(porCl[0].cliques)+' cliques ('+p0(100*porCl[0].cliques/totN.cliques)+'%'+doTot+').'});
      if (barata) f.push({ok:barata.cpc<totN.cpc, t:'O clique mais barato é de '+B(barata.longo)+': '+fmt(barata.cpc,'brl')+', '+p0(pc(barata.cpc,totN.cpc))+'% abaixo da média ('+fmt(totN.cpc,'brl')+').'});
      if (porCl.length>=4){ var t3 = agrega(porCl.slice(0,3)); f.push({ok:t3.cpc<=totN.cpc, t:'As três campanhas com mais visitas somam '+B(p0(100*t3.cliques/totN.cliques)+'% dos cliques')+' com custo médio de '+fmt(t3.cpc,'brl')+', abaixo da média: o volume está concentrado onde o clique é eficiente.'}); }
    }
    if (estado.par==='invest'){
      var porCu = lN.slice().sort(function(a,b){ return b.custo-a.custo; });
      if (relevante) f.push({ok:relevante.ctr>totN.ctr, t:B(relevante.longo)+' tem a maior taxa de clique: '+B(fmt(relevante.ctr,'pct'))+', '+(relevante.ctr>totN.ctr*2?'mais que o dobro':'acima')+' da média ('+fmt(totN.ctr,'pct')+').'});
      var acima = lN.filter(function(x){ return x.ctr>=7; }).length;
      f.push({ok:acima>=lN.length/2, t:B(acima+' de '+lN.length+' campanhas'+(lN!==l?' da estrutura nova':''))+' têm taxa de clique de 7% ou mais, patamar alto para busca no setor industrial.'});
      f.push({ok:porCu[0].cpc<=totN.cpc*1.1, t:'A maior fatia do investimento está em '+B(porCu[0].longo)+' ('+p0(100*porCu[0].custo/totN.custo)+'%), que entrega o clique a '+fmt(porCu[0].cpc,'brl')+'.'});
      f.push({ok:true, t:'A verba está distribuída entre '+lN.length+' frentes, cada uma com leitura própria de retorno.'});
    }
    if (estado.par==='presenca'){
      var topo = lN.filter(function(x){ return x.sup>=75; }).length;
      var mx = lN.reduce(function(a,x){ return x.sup>a.sup ? x : a; });
      var pi = lN.slice().sort(function(a,b){ return b.impr-a.impr; })[0];
      f.push({ok:true, t:B(mx.longo)+' aparece no topo da página em '+B(fmt(mx.sup,'pct'))+' das exibições.'});
      f.push({ok:topo>=lN.length/2, t:B(topo+' de '+lN.length+' campanhas'+(lN!==l?' da estrutura nova':''))+' ficam no topo em 75% ou mais das vezes em que aparecem.'});
      f.push({ok:true, t:B(pi.longo)+' é a que mais coloca a SMS diante de quem busca: '+fmt(pi.impr)+' exibições.'});
    }
    var nov = agrega(l.filter(function(x){ return x.estrutura==='nova'; })), ant = agrega(l.filter(function(x){ return x.estrutura==='antiga'; }));
    if (estado.estr==='todas' && nov && ant) f.unshift({ok:nov.cpc<ant.cpc, t:'Somadas, as campanhas da estrutura nova entregam o clique '+B(p0(pc(nov.cpc,ant.cpc))+'% mais barato')+' que a estrutura anterior.'});
    mostrar(id, {todas:'todas as campanhas',nova:'estrutura nova',antiga:'estrutura anterior'}[estado.estr]+' · '+{volume:'volume e custo',invest:'investimento e relevância',presenca:'presença'}[estado.par], f);
  }

  // ---------- estrutura nova × anterior
  function insMix(id, H, nov, ant, shr, m){
    var nomeM = {cliques:'dos cliques',custo:'do investimento',impr:'das exibições'}[m];
    var f = [], idx = []; shr.forEach(function(v,i){ if (v!==null) idx.push(i); });
    var u = m==='custo'?'brl0':'int';
    if (idx.length){
      var li = idx[idx.length-1];
      f.push({ok:li===H.length-1 || idx.length>=2, t:'Em '+H[li].label+', a estrutura nova já respondia por '+B(p0(shr[li])+'% '+nomeM)+' da conta'+(idx.length>1?', contra '+p0(shr[idx[0]])+'% em '+H[idx[0]].label:'')+'.'});
    }
    var first = 0, last = nov.length-1;
    f.push({ok:nov[last]>nov[first], t:'De '+H[first].label+' a '+H[last].label+', a estrutura nova passou de '+fmt(nov[first],u)+' para '+B(fmt(nov[last],u))+' '+{cliques:'cliques',custo:'investidos',impr:'exibições'}[m]+' por mês.'});
    if (m!=='custo') f.push({ok:true, t:'A troca foi gradual, com as duas estruturas rodando lado a lado, para que cada passo da migração fosse comprovado com números.'});
    else f.push({ok:true, t:'A verba migra à medida que a estrutura nova comprova eficiência, sem desligar de uma vez o que já funcionava.'});
    mostrar(id, 'estrutura nova × anterior · '+{cliques:'cliques',custo:'investimento',impr:'exibições'}[m], f);
  }

  // ---------- presença (sem filtro)
  function insPresenca(id, cfg){
    var f = [], n = cfg.sup.length, li = n-1;
    var mi = cfg.marca ? cfg.cats.indexOf(cfg.marca.x) : -1;
    var mxp = 0; cfg.pos1.forEach(function(v,i){ if (v>cfg.pos1[mxp]) mxp=i; });
    f.push({ok:cfg.sup[li]>cfg.sup[0], t:'O anúncio no topo da página passou de '+fmt(cfg.sup[0],'pct')+' em '+cfg.cats[0]+' para '+B(fmt(cfg.sup[li],'pct'))+' em '+cfg.cats[li]+'.'});
    if (mi>0 && li>=mi){
      var av = function(a,i0,i1){ var s=0,c=0; for(var i=i0;i<=i1;i++){ s+=a[i]; c++; } return s/c; };
      var bS = av(cfg.sup,0,mi-1), dS = av(cfg.sup,mi,li), bP = av(cfg.pos1,0,mi-1), dP = av(cfg.pos1,mi,li);
      f.push({ok:dS>bS, t:'Desde o início da gestão Molla, a média no topo é de '+B(fmt(dS,'pct'))+', contra '+fmt(bS,'pct')+' nos meses anteriores.'});
      f.push({ok:dP>bP, t:'Em 1º lugar, a média subiu de '+fmt(bP,'pct')+' para '+B(fmt(dP,'pct'))+'.'});
    }
    f.push({ok:true, t:'O melhor mês em 1º lugar foi '+cfg.longos[mxp].toLowerCase()+', com '+fmt(cfg.pos1[mxp],'pct')+' das exibições.'});
    mostrar(id, 'presença na página', f);
  }

  // ---------- rankings (termos e palavras)
  function insRanking(id, itens, par){
    var f = [];
    var top = itens.slice().sort(function(a,b){ return b.cliques-a.cliques; });
    var tot = itens.reduce(function(s,x){ return s+x.cliques; },0);
    var marca = itens.filter(function(x){ return /sms/i.test(x.rot); });
    if (par==='cpc' || par==='ctr'){
      var mc = marca.reduce(function(s,x){ return s+x.cliques; },0);
      f.push({ok:mc>0, t:'Buscas pelo nome da SMS somam '+B(p0(100*mc/tot)+'% das visitas')+' entre os termos com 5 cliques ou mais: a marca é procurada e a campanha Institucional garante que quem procura encontra.'});
      if (par==='cpc'){ var c = top.slice(0,14).filter(function(x){ return !/sms/i.test(x.rot); }).sort(function(a,b){ return a.cpc-b.cpc; })[0];
        if (c) f.push({ok:true, t:'Fora a marca, o clique mais barato entre as principais buscas é '+B('"'+c.rot+'"')+', a '+fmt(c.cpc,'brl')+'.'}); }
      else { var r = top.slice(0,14).sort(function(a,b){ return (b.ctr||0)-(a.ctr||0); })[0];
        f.push({ok:true, t:B('"'+r.rot+'"')+' tem a maior taxa de clique entre as principais buscas: '+fmt(r.ctr,'pct')+'.'}); }
      f.push({ok:true, t:'São buscas de quem procura fabricante e produto, resultado das negativações feitas junto com a SMS.'});
    } else {
      var campo = par==='is1' ? 'is1' : 'is';
      var acima = top.slice(0,14).filter(function(x){ return (x[campo]||0)>=50; }).length;
      var mm = marca.length ? marca.reduce(function(a,x){ return (x[campo]||0)>(a[campo]||0) ? x : a; }) : null;
      if (mm) f.push({ok:true, t:'Na busca '+B(mm.rot)+', a SMS aparece '+(campo==='is1'?'em 1º lugar ':'')+'em '+B(fmt(mm[campo],'pct'))+' das oportunidades.'});
      if (campo==='is') f.push({ok:acima>=4, t:B(acima+' das 14 palavras')+' com mais cliques mostram o anúncio em metade ou mais das buscas possíveis.'});
      else f.push({ok:true, t:'O 1º lugar é a posição mais disputada do leilão; nas palavras de marca a SMS a ocupa na maior parte das vezes.'});
    }
    mostrar(id, {cpc:'buscas · custo',ctr:'buscas · relevância',is:'palavras · presença',is1:'palavras · 1º lugar'}[par], f);
  }

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
      insEvolucao(id, H, estado, dest, cfg.marca);
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
      var all = (function(){ var a={cl:0,im:0,cu:0,sw:0,pw:0}; Object.keys(D.camp).forEach(function(k){ var c=D.camp[k]; a.cl+=soma(c.cl); a.im+=soma(c.im); a.cu+=soma(c.cu); a.sw+=soma(c.sw); a.pw+=soma(c.pw); }); return deriv(a); })();
      insDiario(id, D, estado, pts, longas, tot, all);
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
      insCampanhas(id, l, estado, L);
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
      insMix(id, H, nov, ant, shr, estado.m);
    }
    montarFiltros(document.getElementById(id+'-filtros'), filtros, estado, desenhar);
    desenhar();
  };

  /* Presença no topo e 1ª posição */
  Molla.presenca = function(id, cfg){
    var inst = iniciar(id); if (!inst) return;
    linhas(inst, {cats:cfg.cats, catsLongas:cfg.longos, eixo:'% das impressões', u:'pct', max:100, marca:cfg.marca,
      series:[{nome:'Anúncio no topo da página',dados:cfg.sup,cor:C.laranja,area:true},{nome:'Anúncio em 1º lugar',dados:cfg.pos1,cor:C.navy}]});
    insPresenca(id, cfg);
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
      insRanking(id, cfg.itens, estado.par);
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
