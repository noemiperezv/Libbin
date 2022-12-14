var url = window.location.href;
var swLocation = '/sw.js';

if ( navigator.serviceWorker ) {


    if ( url.includes('localhost') ) {
        swLocation = '/sw.js';
    }

    navigator.serviceWorker.register( swLocation );
}

var postBtn = $('#post-btn');
var nombre = $('#nombre');
var telefono = $('#telefono');


var timeline = $('#timeline');
var timelinefoto = $('#fotos');

function crearContacto(nombre, telefono, foto) {

    var content =`
    <div  class="col-md-4">
        <div class="card tarjeta" style="width:200px;">`;
    
    if ( foto ) {
        content += `
                <img class="card-img-top" src="${ foto }">
        `;
    }else{
        content += `
                <img class="card-img-top" src="../img/icons/contacto.png">
        `;
    }
        
    content += `
            <div class="card-body">
                <h5 class="card-title">${ nombre }</h5>
                <p class="card-text">${ telefono }</p>
            </div>
        </div>
    </div>
    `;

    
    // si existe la latitud y longitud, 
    // llamamos la funcion para crear el mapa
    if ( lat ) {
        crearMapa( lat, lng, personaje );
    }
    
    // Borramos la latitud y longitud 
    lat = null;
    lng = null;

    $('.modal-mapa').remove();

    timeline.prepend(content);
    //cancelarBtn.click();

}

function crearFoto(foto) {
    var contentFoto =`
    `;
    
    if ( foto ) {
        contentFoto += `
        <div  class="col-md-4">
            <div class="card tarjeta" style="width: 18rem;">
                <img class="card-img-top" src="${ foto }">
            </div>
        </div>
        `;
    }else{
        contentFoto += `
        No hay fotos ${ foto }
    `;
    }
        
    
    timelinefoto.prepend(contentFoto);
}

// Boton de enviar
postBtn.on('click', function() {

    var nombreContacto = nombre.val();
    if ( nombreContacto.length === 0 ) {
        //cancelarBtn.click();
        return;
    }

    var telefonoContacto = telefono.val();
    if( telefonoContacto.length === 0 ) {
        //cancelarBtn.click();
        return;
    }
    var data = {
        nombre: nombreContacto,
        telefono : telefonoContacto,
        foto : foto
    }

    fetch("/api/contactos",{
        method : "POST",
        headers : {
            "Content-Type": "application/json"
        },
        body : JSON.stringify(data)
    }).then( resp => resp.json)
    .then(resp => console.log("funciona:", resp))
    .catch( error => console.log("Falla: " + error));
    crearContacto( nombreContacto, telefonoContacto, foto );
    $("#nombre").val('');
    $("#telefono").val('')
    .then(Push.create("Contacto agregado!", {
        body: "El contacto se ha guardado existosamente, para verlo ve a la secci??n de contactos.",
        icon: '../img/icons/Logo_libbin.png',
        onClick: function () {
            window.focus();
            this.close();
        }
    }));
});


function listarContactos(){
    fetch("/api/contactos")
    .then(resp => resp.json())
    .then(datos => {
        if(datos.length > 0){
            datos.forEach(contacto => {
                console.log(contacto);
                crearContacto( contacto.nombre, contacto.telefono, contacto.foto );
            })
        }else{
            timeline.prepend("<br> <h1>A??n no tienes contactos. Registra algunos. </h1>");
        }
        
    })
}

function listarFotos(){
    fetch("/api")
    .then(resp => resp.json())
    .then(datos => {
        if(datos.length > 0){
            console.log(datos);
            datos.forEach(f => {
                console.log(f);
                crearFoto( f.foto);
            })
        }else{
            timelinefoto.prepend("<br> <h1>A??n no tienes fotos. Toma algunas. </h1>")
        }
        
    })
}


listarContactos();
listarFotos();

function verificarConexion(){
    if(navigator.onLine){
        console.log("Si hay conexi??n. :)")
    }else{
        console.log("No hay :(")
    }
}

window.addEventListener("online", verificarConexion);
window.addEventListener("offline", verificarConexion);

var googleMapKey = 'AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8';
var btnLocation = $("#location-btn");
var modaMapa = $(".modal-mapa");
var lat = null;
var lng = null;
var foto = null;



//C??mara
var btnPhoto = $("#photo-btn");
var btnTomar = $("#tomar-foto-btn");
var contenedorCamara = $(".camara-contenedor");

const camara = new Camara($("#player")[0]);

btnPhoto.on("click", () => {
    console.log("bot??n c??mara");
    contenedorCamara.removeClass("oculto");
    camara.encender();
});

btnTomar.on("click", () => {
    foto = camara.tomarFoto();
    console.log(foto);
    camara.apagar();
    var data = {
        foto : foto
    }

    fetch("/api",{
        method : "POST",
        headers : {
            "Content-Type": "application/json"
        },
        body : JSON.stringify(data)
    }).then( resp => resp.json)
    .then(resp => console.log("funciona:", resp))
    .catch( error => console.log("Falla: " + error));
    crearFoto( foto );
    contenedorCamara.addClass("oculto")
    .then(Push.create("Foto tomada!", {
        body: "La foto se ha guardado existosamente.",
        icon: '../img/favicon.ico',
        timeout: 4000,
        onClick: function () {
            window.focus();
            this.close();
        }
    }));
});




//Inicia ToDo
(function() {
    var ENTER_KEY = 13;
    var newTodoDom = document.getElementById('new-todo');
    var syncDom = document.getElementById('sync-wrapper');

    var db = new PouchDB('bdpendientes');//SE MODIFICA ESTA L??NEA
    var remoteCouch = false;
    var cookie;

    db.changes({
        since : "now",
        live : true
    }).on("change", showTodos );
   

  // We have to create a new todo document and enter it in the database
  function addTodo(text) {
    var todo = {
      _id: new Date().toISOString(),
      title: text,
      completed: false
    };

// Guardar o modificar los datos.
    db.post(todo)
    .then(resp => {
      console.log('Se guard?? el registro. :)')
    })
    .catch(error => {
      console.log('Fall?? el registro. : (')
    });
  }

  // Show the current list of todos by reading them from the database
  function showTodos() {
    /*db.allDocs({include_docs: true}, function(err, doc) {
      redrawTodosUI(doc.rows);
    });*/
    db.allDocs({include_docs: true})
    .then(respuesta => {
      redrawTodosUI(respuesta.rows);
      console.log('Funcion??.')
    })
    .catch(error => {
      console.log('Error al listar. :(')
    });
  }

  function checkboxChanged(todo, event) {

    console.log("check ", event);
    todo.completed = event.target.checked;
    db.put(todo);
  }

  // User pressed the delete button for a todo, delete it
  function deleteButtonPressed(todo) {
    db.remove(todo);
  }

  // The input box when editing a todo has blurred, we should save
  // the new title or delete the todo if the title is empty
  function todoBlurred(todo, event) {
    var trimmedText = event.target.value.trim();
    if (!trimmedText) {
      db.remove(todo);
    } else {
      todo.title = trimmedText;
      db.put(todo);
    }
  }

  // Initialise a sync with the remote server
  function sync() {
    syncDom.setAttribute('data-sync-state', 'syncing');
    var remote = new PouchDB(remoteCouch, {headers: {'Cookie': cookie}});
    var pushRep = db.replicate.to(remote, {
      continuous: true,
      complete: syncError
    });
    var pullRep = db.replicate.from(remote, {
      continuous: true,
      complete: syncError
    });
  }

  // EDITING STARTS HERE (you dont need to edit anything below this line)

  // There was some form or error syncing
  function syncError() {
    syncDom.setAttribute('data-sync-state', 'error');
  }

  // User has double clicked a todo, display an input so they can edit the title
  function todoDblClicked(todo) {
    var div = document.getElementById('li_' + todo._id);
    var inputEditTodo = document.getElementById('input_' + todo._id);
    div.className = 'editing';
    inputEditTodo.focus();
  }

  // If they press enter while editing an entry, blur it to trigger save
  // (or delete)
  function todoKeyPressed(todo, event) {
    if (event.keyCode === ENTER_KEY) {
      var inputEditTodo = document.getElementById('input_' + todo._id);
      inputEditTodo.blur();
    }
  }

  // Given an object representing a todo, this will create a list item
  // to display it.
  function createTodoListItem(todo) {
    var checkbox = document.createElement('input');
    checkbox.className = 'toggle';
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', checkboxChanged.bind(this, todo));

    var label = document.createElement('label');
    label.appendChild( document.createTextNode(todo.title));
    label.addEventListener('dblclick', todoDblClicked.bind(this, todo));

    var deleteLink = document.createElement('button');
    deleteLink.className = 'destroy';
    deleteLink.addEventListener( 'click', deleteButtonPressed.bind(this, todo));

    var divDisplay = document.createElement('div');
    divDisplay.className = 'view';
    divDisplay.appendChild(checkbox);
    divDisplay.appendChild(label);
    divDisplay.appendChild(deleteLink);

    var inputEditTodo = document.createElement('input');
    inputEditTodo.id = 'input_' + todo._id;
    inputEditTodo.className = 'edit';
    inputEditTodo.value = todo.title;
    inputEditTodo.addEventListener('keypress', todoKeyPressed.bind(this, todo));
    inputEditTodo.addEventListener('blur', todoBlurred.bind(this, todo));

    var li = document.createElement('li');
    li.id = 'li_' + todo._id;
    li.appendChild(divDisplay);
    li.appendChild(inputEditTodo);

    if (todo.completed) {
      li.className += 'complete';
      checkbox.checked = true;
    }

    return li;
  }

  function redrawTodosUI(todos) {
    var ul = document.getElementById('todo-list');
    ul.innerHTML = '';
    todos.forEach(function(todo) {
      ul.appendChild(createTodoListItem(todo.doc));
    });
  }

  function newTodoKeyPressHandler( event ) {
    if (event.keyCode === ENTER_KEY) {
      addTodo(newTodoDom.value);
      newTodoDom.value = '';
    }
  }

  function addEventListeners() {
    newTodoDom.addEventListener('keypress', newTodoKeyPressHandler, false);
  }

  addEventListeners();
  showTodos();

  if (remoteCouch) {
    sync();
  }

  // Host that the couch-persona server is running on
  var authHost = 'http://127.0.0.1:3000';

  var loggedIn = function(result) {
    console.log('logged in:', result);
    remoteCouch = result.dbUrl;
    cookie = result.authToken.replace('HttpOnly', '');
    sync();
  };

  var loggedOut = function() {
    console.log('logged out!');
  };

  function simpleXhrSentinel(xhr) {
    return function() {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status == 200) {
        var result = {};
        try {
          result = JSON.parse(xhr.responseText);
        } catch(e) {}
        loggedIn(result);
      } else {
        navigator.id.logout();
        loggedOut();
      }
    };
  }

  function verifyAssertion(assertion) {
    var xhr = new XMLHttpRequest();
    var param = 'assert=' + assertion;
    xhr.open('POST', authHost + '/persona/sign-in', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-length", param.length);
    xhr.setRequestHeader("Connection", "close");
    xhr.send(param);
    xhr.onreadystatechange = simpleXhrSentinel(xhr);
  }

  function signoutUser() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", authHost + '/persona/sign-out', true);
    xhr.send(null);
    xhr.onreadystatechange = simpleXhrSentinel(xhr);
  }
})();