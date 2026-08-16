// MINHA LISTA KODA — SERVICE WORKER / PWA v3.1.6
// NOVO CACHE A CADA RELEASE. DADOS DO USUÁRIO FICAM FORA DO CACHE.
const CACHE_NAME='minha-lista-cache-v3.1.6';
const APP_SHELL=['./','./index.html','./manifest.json','./sw.js','./icon-192.png','./icon-512.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
  // O NOVO SERVICE WORKER FICA EM WAITING ATÉ O USUÁRIO CLICAR EM ATUALIZAR AGORA.
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('minha-lista-cache-')&&k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin) return;
  if(url.pathname.endsWith('/version.json')){
    event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match('./version.json')));
    return;
  }
  if(url.pathname.endsWith('/index.html')||url.pathname==='/'||url.pathname.endsWith('/manifest.json')||url.pathname.endsWith('/sw.js')){
    event.respondWith(
      fetch(event.request,{cache:'no-store'}).then(r=>{
        if(r.ok){const c=r.clone();caches.open(CACHE_NAME).then(x=>x.put(event.request,c)).catch(()=>{});}
        return r;
      }).catch(()=>caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request).then(r=>{
      if(r.ok){const c=r.clone();caches.open(CACHE_NAME).then(x=>x.put(event.request,c)).catch(()=>{});}
      return r;
    }))
  );
});
