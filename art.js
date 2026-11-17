(function(){
  var top=document.getElementById('top'),bg=document.getElementById('burger');
  function zamknij(){top.classList.remove('open');bg.setAttribute('aria-expanded','false');bg.setAttribute('aria-label','Otwórz menu')}
  bg.addEventListener('click',function(){var o=top.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu')});
  document.querySelectorAll('.menu a').forEach(function(a){a.addEventListener('click',zamknij)});

  /* nieskonczone przewijanie: po dojsciu do konca artykulu doczytuje kolejny (prawdziwa strona z wlasnym adresem) */
  var main=document.getElementById('tresc'),bar=document.getElementById('postep'),cur=null,tk=false;
  var first=main.querySelector('.art');first.dataset.url=location.href.split('#')[0];
  function wczytaj(link){
    if(link.dataset.st)return;link.dataset.st='1';link.classList.add('wczyt');
    fetch(link.href).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){
      var d=new DOMParser().parseFromString(t,'text/html'),art=d.querySelector('.art');if(!art)throw 0;
      art.dataset.url=link.href;art.classList.add('nowy');
      var dalej=art.nextElementSibling&&(art.nextElementSibling.matches('.a-next,.a-koniec'))?art.nextElementSibling:null;
      link.after(art);if(dalej)art.after(dalej);
      art.querySelectorAll('img').forEach(function(i){i.removeAttribute('fetchpriority');i.loading='lazy'});
      link.classList.remove('wczyt');
      if(dalej&&dalej.matches('[data-next]'))obs(dalej);
    }).catch(function(){link.classList.remove('wczyt');delete link.dataset.st});
  }
  var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);wczytaj(e.target)}})},{rootMargin:'0px 0px 1400px 0px'}):null;
  function obs(l){if(io)io.observe(l)}
  document.querySelectorAll('[data-next]').forEach(obs);

  function biezacy(){
    tk=false;var arts=main.querySelectorAll('.art'),y=innerHeight*.35,a=arts[0];
    for(var i=0;i<arts.length;i++){if(arts[i].getBoundingClientRect().top<=y)a=arts[i]}
    var r=a.getBoundingClientRect(),hh=top.offsetHeight,p=Math.min(1,Math.max(0,(hh-r.top)/Math.max(1,r.height-innerHeight+hh)));
    bar.style.transform='scaleX('+p.toFixed(3)+')';
    top.classList.toggle('sc',pageYOffset>40);
    if(a!==cur){cur=a;if(location.href.split('#')[0]!==a.dataset.url){history.replaceState(null,'',a.dataset.url)}document.title=a.dataset.title}
  }
  addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(biezacy)}},{passive:true});
  addEventListener('resize',function(){if(!tk){tk=true;requestAnimationFrame(biezacy)}});

  /* lightbox - delegowany, dziala tez dla doczytanych artykulow; grupa = wszystkie zdjecia danego artykulu */
  var lb=document.getElementById('lb'),li=lb.querySelector('img'),lp=lb.querySelector('p'),k=0,last=null,grp=[];
  function pokaz(i){k=(i+grp.length)%grp.length;var b=grp[k];li.src=b.dataset.lb;li.alt=b.querySelector('img').alt;lp.textContent=(b.dataset.cap||li.alt)+'  ('+(k+1)+'/'+grp.length+')'}
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-lb]');if(!b||lb.contains(b))return;e.preventDefault();last=b;
    var art=b.closest('.art');grp=[].slice.call(art.querySelectorAll('.siatka-g [data-lb]'));
    var i=0;grp.forEach(function(g,j){if(g.dataset.lb===b.dataset.lb)i=j});
    pokaz(i);lb.classList.add('otw');document.body.style.overflow='hidden';lb.querySelector('.x').focus();
  });
  function zam(){lb.classList.remove('otw');document.body.style.overflow='';li.removeAttribute('src');if(last)last.focus()}
  lb.querySelector('.x').addEventListener('click',zam);
  lb.querySelector('.p').addEventListener('click',function(){pokaz(k-1)});
  lb.querySelector('.n').addEventListener('click',function(){pokaz(k+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)zam()});
  var tx=0;lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)pokaz(k+(d<0?1:-1))});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){if(lb.classList.contains('otw'))zam();else zamknij()}
    if(!lb.classList.contains('otw'))return;
    if(e.key==='ArrowRight')pokaz(k+1);if(e.key==='ArrowLeft')pokaz(k-1);
  });
  var r=document.getElementById('rok');if(r)r.textContent=new Date().getFullYear();
})();
