const express = require('express');
const router = express.Router();

const contactos = [
    
]

const fotos = [
]

router.get( "/", (req, resp) => {
    resp.json(fotos);
});

router.get( "/contactos", (req, resp) => {
    resp.json(contactos);
});


router.post( "/", (req, resp) => {
    
        const foto = {
            foto : req.body.foto
        }
    
        fotos.push(foto);
        console.log("Mis fotos", fotos);
        resp.json({
            ok : true,
            foto
        });
});

router.post( "/contactos", (req, resp) => {
    
    const contacto = {
        nombre : req.body.nombre,
        telefono : req.body.telefono,
        foto : req.body.foto
    }

    contactos.push(contacto);
    console.log("Mis contactos", contactos);
    resp.json({
        ok : true,
        contacto
    });
});

module.exports = router;