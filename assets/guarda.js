/* Central do Cliente · SMS Resistências · Agência Molla
   Acesso restrito à Central e barra "‹ Central · Exportar PDF · Sair" dentro dos materiais.
   Uso em cada material (logo depois de <meta charset="UTF-8">):
     <script src="../assets/guarda.js"></script>
   Na central.html o script usa data-barra="nao" (sem barra). */
(function(){
  var CHAVE = 'sms_auth', NOME = 'sms_nome';
  var me = document.currentScript;
  var raiz = new URL('../', me.src).href;   // pasta raiz do site

  function ler(k){ try { return sessionStorage.getItem(k); } catch(e){ return null; } }
  function armazenamentoOk(){ try { sessionStorage.setItem('__t','1'); sessionStorage.removeItem('__t'); return true; } catch(e){ return false; } }

  // Sem login: volta para a tela de acesso (se o navegador bloquear o sessionStorage, não trava o cliente)
  if (ler(CHAVE) !== 'ok' && armazenamentoOk()) {
    document.documentElement.style.visibility = 'hidden';
    location.replace(raiz + 'index.html');
    return;
  }

  window.MOLLA_SAIR = function(){ try { sessionStorage.removeItem(CHAVE); sessionStorage.removeItem(NOME); } catch(e){} location.replace(raiz + 'index.html'); };

  if (me.getAttribute('data-barra') === 'nao') return;

  function voltar(){
    var ref = document.referrer || '';
    if (ref.indexOf(raiz) === 0 && /central(\.html)?([?#].*)?$/.test(ref) && history.length > 1) { history.back(); return; }  // volta para a categoria de origem
    location.href = raiz + 'central.html';
  }

  function montar(){
    if (document.getElementById('molla-barra')) return;
    var host = document.createElement('div');
    host.id = 'molla-barra';
    var css = document.createElement('style');
    css.textContent = '@media print{#molla-barra{display:none!important}}';
    document.head.appendChild(css);

    var root = host.attachShadow ? host.attachShadow({mode:'open'}) : host;
    root.innerHTML =
      '<style>' +
      ':host{all:initial;display:block;position:relative;z-index:2147483000;}' +
      '.b{font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;background:#1A212B;color:#fff;-webkit-font-smoothing:antialiased;}' +
      '.s{height:4px;background:linear-gradient(90deg,#FF7A33,#E05E14);}' +
      '.i{max-width:1180px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;gap:12px;box-sizing:border-box;}' +
      '.lg{height:20px;width:auto;display:block;}' +
      '.sep{width:1px;height:20px;background:rgba(255,255,255,.18);}' +
      '.t{font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:800;color:rgba(255,255,255,.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '.sp{flex:1;}' +
      'button{font:inherit;font-weight:800;font-size:13px;line-height:1;border-radius:999px;padding:10px 16px;cursor:pointer;white-space:nowrap;transition:filter .2s,background .2s,border-color .2s;}' +
      '.c{border:none;color:#fff;background:linear-gradient(90deg,#FF7A33,#E05E14);}' +
      '.c:hover{filter:brightness(1.06);}' +
      '.o{background:transparent;color:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.25);}' +
      '.o:hover{border-color:#FF7A33;color:#fff;background:rgba(255,122,51,.14);}' +
      'button:focus-visible{outline:3px solid rgba(255,122,51,.55);outline-offset:2px;}' +
      '@media (max-width:720px){.lg,.sep,.t{display:none;}.i{padding:10px 12px;gap:8px;}button{padding:9px 13px;font-size:12.5px;}}' +
      '</style>' +
      '<div class="b"><div class="s"></div><div class="i">' +
        '<button class="c" id="c" type="button">‹ Central</button>' +
        '<img class="lg" src="' + raiz + 'assets/molla-branca.png" alt="Molla">' +
        '<span class="sep"></span><span class="t">Central do Cliente · SMS Resistências</span>' +
        '<span class="sp"></span>' +
        '<button class="o" id="p" type="button">Exportar PDF</button>' +
        '<button class="o" id="x" type="button">Sair</button>' +
      '</div></div>';
    var q = function(id){ return root.querySelector('#' + id); };
    q('c').addEventListener('click', voltar);
    q('p').addEventListener('click', function(){ window.print(); });
    q('x').addEventListener('click', window.MOLLA_SAIR);
    document.body.insertBefore(host, document.body.firstChild);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();
