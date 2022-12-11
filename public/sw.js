importScripts("js/pouchdb-7.3.1.min.js");
importScripts("js/sw-db.js");
importScripts("js/sw-utils.js");
const CACHE_STATIC_NAME = "pwa-static-v1";
const CACHE_DYNAMIC_NAME = "pwa-dynamic-v1";
const CACHE_INMUTABLE_NAME = "pwa-inmutable-v1";

console.log("Holiwiiiiii");

const APP_SHELL = [
    "/",
    "index.html",
    "pages/contactos.html",
    "pages/pendientes.html",
    "pages/agregarContacto.html",
    "pages/fotos.html",
    "img/icons/logo1024.png",
    "img/icons/logo144.png",
    "img/icons/logo192.png",
    "img/icons/logo48.png",
    "img/icons/logo512.png",
    "img/icons/logo72.png",
    "img/icons/logo96.png",
    "img/icons/Logo_libbin.png",
    "img/bg.png",
    "img/favicon.ico",
    "css/style.css",
    "css/base.css",
    "js/app.js",
    "js/sw-utils.js",
    "js/camara-class.js",
    "js/base.js",
    "js/pouchdb-7.3.1.min.js",
    "js/pouchdb-nightly.js",
    "js/sw-db.js"
];

const APP_SHELL_INMUTABLE = [
    "https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css",
    "https://code.jquery.com/jquery-3.2.1.slim.min.js",
    "https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"
];


self.addEventListener("install", (evento) => {
    const cacheEstatico = caches.open(CACHE_STATIC_NAME).then((cache) => {
        return cache.addAll(APP_SHELL);
    });

    const cacheInmutable = caches.open(CACHE_INMUTABLE_NAME).then((cache) => {
        return cache.addAll(APP_SHELL_INMUTABLE);
    });

    evento.waitUntil(Promise.all([cacheEstatico, cacheInmutable]));
});

self.addEventListener("activate", (evento) => {
    const respuesta = caches.keys().then((llaves) => {
        llaves.forEach((llave) => {
        if (llave !== CACHE_STATIC_NAME && llave.includes("static")) {
            return caches.delete(llave);
        }

        if (llave !== CACHE_DYNAMIC_NAME && llave.includes("dynamic")) {
            return caches.delete(llave);
        }
        });
    });

    evento.waitUntil(respuesta);
});

self.addEventListener("fetch", (evento) => {
    let respuesta;
    if( evento.request.url.includes("/api")){
        respuesta = manejarPeticionesApi(CACHE_DYNAMIC_NAME, evento.request);
    }else{
        respuesta = caches.match(evento.request).then((res) => {
            if (res) {
                verificarCache(CACHE_STATIC_NAME, evento.request, APP_SHELL_INMUTABLE);
                return res;
    
            } else {
                return fetch(evento.request).then((newRes) => {
                    return actualizaCache(CACHE_DYNAMIC_NAME, evento.request, newRes);
                });
            }
        });
    }

    evento.respondWith(respuesta);
});

self.addEventListener("sync", evento =>{
    console.log("SW: Sync");

    if(evento.tag === "nuevo-contacto"){
        const respuesta = enviarMensajes();
        evento.waitUntil(respuesta);
    }

    if(evento.tag === "nueva-foto"){
        const respuesta = enviarFotos();
        evento.waitUntil(respuesta)
    }
});