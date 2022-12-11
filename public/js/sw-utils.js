// Actualizar en el cache 
function actualizaCache(cacheName, req, res) {
    if (res.ok) {
        return caches.open(cacheName).then((cache) => {
        cache.put(req, res.clone());
        return res.clone();
        });
    } else {
        return res;
    }
}

// Cache with network update
function verificarCache(staticCache, req, APP_SHELL_INMUTABLE) {
    if (APP_SHELL_INMUTABLE.includes(req.url)) {
        // No hace falta actualizar el inmutable
    } else {
        // console.log('actualizando', req.url );
        return fetch(req).then((res) => {
            return actualizaCache(staticCache, req, res);
        });
    }
}

function manejarPeticionesApi(nombreCache, req){

    if(req.clone().method === "POST"){
        if(self.registration.sync){
            return req.clone().text().then(resp => {
                console.log(resp);
                const obj = JSON.parse(resp);
                if(obj.nombre){
                    return guardarMensaje(obj);
                }else{
                    return guardarFoto(obj);
                    
                }
                
            });
        }
        else{
            return fetch(req);
        }
    }
    else{
        return fetch( req)
    .then(resp => {
        if(resp.ok){
            actualizaCache(nombreCache, req, resp.clone());
            return resp.clone();
        }else{
            return caches.match(req);
        }
    })
    .catch(error => {
        return caches.match(req);
    })
    }
    
}
