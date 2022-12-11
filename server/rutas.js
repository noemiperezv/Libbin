const express = require('express');
const router = express.Router();

const contactos = [
    {
        _id : "1",
        nombre : "Diana",
        telefono : "4156782398"
    },
    {
        _id : "2",
        nombre : "Vanesa",
        telefono : "4189034576"
    },
    {
        _id : "3",
        nombre : "Esteban",
        telefono : "4446781243"
    }
]

const fotos = [
    {
        _id: "1",
        foto: "https://dam.ngenespanol.com/wp-content/uploads/2022/05/4-pasos-para-hacer-realidad-ese-viaje-que-no-has-podido-emprender.jpg"
    },
    {
        _id: "2",
        foto: "https://www.entornoturistico.com/wp-content/uploads/2020/01/viajes.jpg"
    }
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