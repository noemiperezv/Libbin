let db = new PouchDB("bdcontactos");
let dbFotos = new PouchDB("bdfotos");

function guardarMensaje(mensaje){
    mensaje._id = new Date().toISOString();

    return db.put( mensaje)
    .then(resp => {
        console.log("Se guardo en indexdb");

        self.registration.sync.register("nuevo-contacto");

        const respuesta = {ok: true, offline: true};

        return new Response(JSON.stringify(respuesta));
    })
    .catch(error => {
        console.log("Error al guardar " + error);
    })
}

function enviarMensajes(){

    let mensajes = []
    return db.allDocs({include_docs : true}).then(docs => {
        docs.rows.forEach(row => {
            const doc = row.doc;
            const prom = fetch("/api/contactos",{
                method : "POST",
                headers : {
                    "Content-Type": "application/json"
                },
                body : JSON.stringify(doc)
            })
            .then(resp => {
                return db.remove(doc);
            });
            mensajes.push(prom);
        });
        return Promise.all(mensajes);
    })
}

function guardarFoto(mensaje){
    mensaje._id = new Date().toISOString();

    return dbFotos.put( mensaje)
    .then(resp => {
        console.log("Se guardo la foto indexdb");

        self.registration.sync.register("nueva-foto");

        const respuesta = {ok: true, offline: true};

        return new Response(JSON.stringify(respuesta));
    })
    .catch(error => {
        console.log("Error al guardar " + error);
    })
}

function enviarFotos(){

    let fotos = []
    return dbFotos.allDocs({include_docs : true}).then(docs => {
        docs.rows.forEach(row => {
            const doc = row.doc;
            const prom = fetch("/api",{
                method : "POST",
                headers : {
                    "Content-Type": "application/json"
                },
                body : JSON.stringify(doc)
            })
            .then(resp => {
                return dbFotos.remove(doc);
            });
            fotos.push(prom);
        });
        return Promise.all(fotos);
    });
}