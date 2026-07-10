/* Service Worker Euro Ecologic — cache-ul aplicatiei (shell-ul), ca sa se deschida si fara net.
   Datele in sine (Supabase) au nevoie de net oricum si sunt gestionate separat, prin coada offline. */
const NUME_CACHE = "euro-ecologic-v1";
const FISIERE_DE_BAZA = [
  "./",
  "./index.html",
  "./dispecerat.html",
  "./manifest.json",
  "./manifest-dispecerat.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(NUME_CACHE).then((cache) => cache.addAll(FISIERE_DE_BAZA)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((chei) =>
      Promise.all(chei.filter((c) => c !== NUME_CACHE).map((c) => caches.delete(c)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // doar cererile din acelasi domeniu (pagina in sine); Supabase si CDN-urile merg direct la retea
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((raspuns) => {
        const copie = raspuns.clone();
        caches.open(NUME_CACHE).then((cache) => cache.put(event.request, copie));
        return raspuns;
      })
      .catch(() => caches.match(event.request))
  );
});
