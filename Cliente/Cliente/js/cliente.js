const PRODUCTOS = {
    guitarra: {
        nombre: "Guitarra Eléctrica Standard Custom",
        codigo: "CHIB-2026-GT01",
        precio: 749990,
        imagen: "img/guitarra.png",
        stock: 10
    },
    teclado: {
        nombre: "Teclado Sintetizador Pro 61 Teclas",
        codigo: "CHIB-2026-TK61",
        precio: 489990,
        imagen: "img/teclado.png",
        stock: 10
    }
};

const COSTO_DESPACHO = 5000;

function precioCLP(valor) {
    return "$" + Number(valor).toLocaleString("es-CL");
}

function leerCarro() {
    let datos = sessionStorage.getItem("carroChibson");

    if (datos == null) {
        return {};
    }

    return JSON.parse(datos);
}

function guardarCarro(carro) {
    sessionStorage.setItem("carroChibson", JSON.stringify(carro));
}

function agregarAlCarro(producto) {
    let carro = leerCarro();

    if (carro[producto] == null) {
        carro[producto] = 1;
    } else if (carro[producto] < PRODUCTOS[producto].stock) {
        carro[producto]++;
    }

    guardarCarro(carro);
    window.location.href = "carrito.html";
}

function cambiarCantidad(producto, cantidad) {
    let carro = leerCarro();
    let numero = Number(cantidad);

    if (numero < 1) {
        numero = 1;
    }

    if (numero > PRODUCTOS[producto].stock) {
        numero = PRODUCTOS[producto].stock;
    }

    carro[producto] = numero;
    guardarCarro(carro);
    mostrarCarro();
}

function eliminarDelCarro(producto) {
    let carro = leerCarro();
    delete carro[producto];
    guardarCarro(carro);
    mostrarCarro();
}

function calcularCarro() {
    let carro = leerCarro();
    let subtotal = 0;
    let cantidadTotal = 0;

    for (let producto in carro) {
        subtotal += PRODUCTOS[producto].precio * carro[producto];
        cantidadTotal += carro[producto];
    }

    let despacho = subtotal > 0 ? COSTO_DESPACHO : 0;

    return {
        subtotal: subtotal,
        despacho: despacho,
        total: subtotal + despacho,
        cantidad: cantidadTotal
    };
}

function mostrarCarro() {
    let cuerpo = document.getElementById("productos-carro");

    if (cuerpo == null) {
        return;
    }

    let carro = leerCarro();
    let productos = Object.keys(carro);

    if (productos.length == 0) {
        cuerpo.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <h2 class="h5 fw-bold">Tu carro está vacío</h2>
                    <p class="text-muted mb-0">
                        Agrega un instrumento desde los productos destacados del inicio.
                    </p>
                </td>
            </tr>
        `;
    } else {
        cuerpo.innerHTML = "";

        productos.forEach(function(id) {
            let producto = PRODUCTOS[id];
            let cantidad = carro[id];
            let subtotal = producto.precio * cantidad;

            cuerpo.innerHTML += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-3">
                            <img src="${producto.imagen}"
                                 alt="${producto.nombre}"
                                 class="border rounded p-2 bg-white producto-carro-img">

                            <div>
                                <strong>${producto.nombre}</strong>
                                <div class="text-muted">${producto.codigo}</div>
                            </div>
                        </div>
                    </td>

                    <td>${precioCLP(producto.precio)} CLP</td>

                    <td>
                        <input type="number"
                               class="form-control cantidad-carro"
                               min="1"
                               max="${producto.stock}"
                               value="${cantidad}"
                               onchange="cambiarCantidad('${id}', this.value)">

                        <small class="text-muted">
                            Máximo ${producto.stock}
                        </small>
                    </td>

                    <td>
                        <strong>${precioCLP(subtotal)} CLP</strong>
                    </td>

                    <td>
                        <button type="button"
                                class="btn btn-outline-danger btn-sm"
                                onclick="eliminarDelCarro('${id}')">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    let resumen = calcularCarro();

    document.getElementById("subtotal-resumen").textContent =
        precioCLP(resumen.subtotal);

    document.getElementById("despacho-resumen").textContent =
        precioCLP(resumen.despacho);

    document.getElementById("total-resumen").textContent =
        precioCLP(resumen.total);

    let boton = document.getElementById("continuar-compra");

    if (productos.length == 0) {
        boton.classList.add("disabled");
        boton.setAttribute("aria-disabled", "true");
        boton.href = "#";
    } else {
        boton.classList.remove("disabled");
        boton.removeAttribute("aria-disabled");
        boton.href = "checkout.html";
    }
}

function mostrarCheckout() {
    let lista = document.getElementById("lista-checkout");

    if (lista == null) {
        return;
    }

    let carro = leerCarro();
    let productos = Object.keys(carro);

    if (productos.length == 0) {
        lista.innerHTML = `
            <div class="alert alert-warning">
                No hay productos en el carro.
            </div>
        `;

        document.getElementById("confirmar-compra").disabled = true;
        document.getElementById("total-checkout").textContent = "$0 CLP";
        return;
    }

    lista.innerHTML = "";

    productos.forEach(function(id) {
        let producto = PRODUCTOS[id];
        let cantidad = carro[id];

        lista.innerHTML += `
            <div class="d-flex justify-content-between gap-3 mb-2">
                <span>
                    ${producto.nombre}
                    <span class="text-muted">x${cantidad}</span>
                </span>

                <strong>
                    ${precioCLP(producto.precio * cantidad)}
                </strong>
            </div>
        `;
    });

    let resumen = calcularCarro();

    document.getElementById("despacho-checkout").textContent =
        precioCLP(resumen.despacho);

    document.getElementById("total-checkout").textContent =
        precioCLP(resumen.total) + " CLP";

    let direccionGuardada = localStorage.getItem("direccionChibson");

    if (direccionGuardada != null) {
        document.getElementById("direccion-guardada").textContent = direccionGuardada;
    }
}

function confirmarCompra(event) {
    event.preventDefault();

    let formulario = document.getElementById("form-checkout");

    if (!formulario.checkValidity()) {
        formulario.classList.add("was-validated");
        return;
    }

    let carro = leerCarro();
    let productos = Object.keys(carro);

    if (productos.length == 0) {
        return;
    }

    let numeroPedido = localStorage.getItem("numeroPedidoChibson");

    if (numeroPedido == null) {
        numeroPedido = 3;
    } else {
        numeroPedido = Number(numeroPedido);
    }

    let pedido = {
        numero: String(numeroPedido).padStart(4, "0"),
        fecha: new Date().toLocaleDateString("es-CL"),
        estado: "Confirmado",
        productos: carro,
        total: calcularCarro().total
    };

    sessionStorage.setItem("ultimoPedidoChibson", JSON.stringify(pedido));
    localStorage.setItem("numeroPedidoChibson", numeroPedido + 1);

    sessionStorage.removeItem("carroChibson");

    window.location.href = "confirmacion-pedido.html";
}

function leerUltimoPedido() {
    let datos = sessionStorage.getItem("ultimoPedidoChibson");

    if (datos == null) {
        return null;
    }

    return JSON.parse(datos);
}

function mostrarConfirmacion() {
    let contenedor = document.getElementById("confirmacion-datos");

    if (contenedor == null) {
        return;
    }

    let pedido = leerUltimoPedido();

    if (pedido == null) {
        contenedor.innerHTML = `
            <p class="mb-0 text-muted">
                No hay una compra reciente para mostrar.
            </p>
        `;
        return;
    }

    let cantidad = 0;

    for (let producto in pedido.productos) {
        cantidad += pedido.productos[producto];
    }

    document.getElementById("numero-confirmacion").textContent = pedido.numero;
    document.getElementById("fecha-confirmacion").textContent = pedido.fecha;
    document.getElementById("cantidad-confirmacion").textContent = cantidad;
    document.getElementById("total-confirmacion").textContent =
        precioCLP(pedido.total) + " CLP";
}

function mostrarPedidoNuevoEnLista() {
    let cuerpo = document.getElementById("tabla-pedidos");

    if (cuerpo == null) {
        return;
    }

    let pedido = leerUltimoPedido();

    if (pedido == null) {
        return;
    }

    let fila = document.createElement("tr");

    fila.innerHTML = `
        <td><strong>${pedido.numero}</strong></td>
        <td>${pedido.fecha}</td>
        <td>${precioCLP(pedido.total)} CLP</td>
        <td><span class="badge badge-custom">${pedido.estado}</span></td>
        <td>
            <a href="pedido-detalle-nuevo.html"
               class="btn btn-custom btn-sm">
                Ver detalle
            </a>
        </td>
    `;

    cuerpo.prepend(fila);
}

function mostrarDetallePedidoNuevo() {
    let tabla = document.getElementById("productos-pedido-nuevo");

    if (tabla == null) {
        return;
    }

    let pedido = leerUltimoPedido();

    if (pedido == null) {
        document.getElementById("pedido-nuevo-contenido").innerHTML = `
            <div class="alert alert-warning">
                No hay una compra reciente para mostrar.
            </div>
        `;
        return;
    }

    document.getElementById("numero-pedido-nuevo").textContent = pedido.numero;
    document.getElementById("fecha-pedido-nuevo").textContent = pedido.fecha;

    tabla.innerHTML = "";

    for (let id in pedido.productos) {
        let producto = PRODUCTOS[id];
        let cantidad = pedido.productos[id];

        tabla.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td>${cantidad}</td>
                <td>${precioCLP(producto.precio * cantidad)} CLP</td>
            </tr>
        `;
    }

    document.getElementById("total-pedido-nuevo").textContent =
        precioCLP(pedido.total) + " CLP";
}

function validarRut(rut) {
    let limpio = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();

    if (!/^[0-9]{7,8}[0-9K]$/.test(limpio)) {
        return false;
    }

    let cuerpo = limpio.slice(0, -1);
    let dv = limpio.slice(-1);

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplicador;
        multiplicador++;

        if (multiplicador == 8) {
            multiplicador = 2;
        }
    }

    let resultado = 11 - (suma % 11);
    let dvCorrecto;

    if (resultado == 11) {
        dvCorrecto = "0";
    } else if (resultado == 10) {
        dvCorrecto = "K";
    } else {
        dvCorrecto = String(resultado);
    }

    return dv == dvCorrecto;
}

function guardarDatos(event) {
    event.preventDefault();

    let formulario = document.getElementById("formDatos");
    let rut = document.getElementById("rut");

    rut.setCustomValidity("");

    if (!validarRut(rut.value)) {
        rut.setCustomValidity("RUT inválido");
    }

    if (!formulario.checkValidity()) {
        formulario.classList.add("was-validated");
        return;
    }

    let datos = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        rut: rut.value,
        correo: document.getElementById("correo").value,
        telefono: document.getElementById("telefono").value
    };

    localStorage.setItem("perfilChibson", JSON.stringify(datos));

    document.getElementById("mensajeDatos").classList.remove("d-none");
}

function cargarDatosPerfil() {
    let datos = localStorage.getItem("perfilChibson");

    if (datos == null) {
        return;
    }

    datos = JSON.parse(datos);

    document.getElementById("nombre").value = datos.nombre;
    document.getElementById("apellido").value = datos.apellido;
    document.getElementById("rut").value = datos.rut;
    document.getElementById("correo").value = datos.correo;
    document.getElementById("telefono").value = datos.telefono;
}

function cambiarPassword(event) {
    event.preventDefault();

    let formulario = document.getElementById("formPassword");
    let password = document.getElementById("password");
    let confirmar = document.getElementById("confirmar");

    confirmar.setCustomValidity("");

    if (password.value != confirmar.value) {
        confirmar.setCustomValidity("Las contraseñas no coinciden");
    }

    if (!formulario.checkValidity()) {
        formulario.classList.add("was-validated");
        document.getElementById("errorPassword").classList.remove("d-none");
        document.getElementById("mensajePassword").classList.add("d-none");
        return;
    }

    document.getElementById("errorPassword").classList.add("d-none");
    document.getElementById("mensajePassword").classList.remove("d-none");

    formulario.reset();
    formulario.classList.remove("was-validated");
}

function editarDireccion() {
    document.getElementById("direccionVista").classList.add("d-none");
    document.getElementById("formDireccion").classList.remove("d-none");
}

function cancelarDireccion() {
    document.getElementById("formDireccion").classList.add("d-none");
    document.getElementById("direccionVista").classList.remove("d-none");
}

function guardarDireccion(event) {
    event.preventDefault();

    let formulario = document.getElementById("formDireccion");

    if (!formulario.checkValidity()) {
        formulario.classList.add("was-validated");
        return;
    }

    let calle = document.getElementById("calle").value;
    let comuna = document.getElementById("comuna").value;
    let region = document.getElementById("region").value;

    let direccion = calle + ", " + comuna + ", " + region;

    localStorage.setItem("direccionChibson", direccion);
    document.getElementById("textoDireccion").textContent = direccion;

    cancelarDireccion();
}

function cargarDireccion() {
    let direccion = localStorage.getItem("direccionChibson");

    if (direccion != null && document.getElementById("textoDireccion") != null) {
        document.getElementById("textoDireccion").textContent = direccion;
    }
}

function crearDevolucion(event) {
    event.preventDefault();

    let formulario = document.getElementById("form-devolucion");

    if (!formulario.checkValidity()) {
        formulario.classList.add("was-validated");
        return;
    }

    let devolucion = {
        numero: "DEV-002",
        pedido: "#0002",
        producto: "Guitarra Eléctrica Standard Custom",
        fecha: new Date().toLocaleDateString("es-CL"),
        estado: "En revisión"
    };

    sessionStorage.setItem("devolucionNuevaChibson", JSON.stringify(devolucion));
    window.location.href = "mis-devoluciones.html";
}

function mostrarDevolucionNueva() {
    let cuerpo = document.getElementById("tabla-devoluciones");

    if (cuerpo == null) {
        return;
    }

    let datos = sessionStorage.getItem("devolucionNuevaChibson");

    if (datos == null) {
        return;
    }

    let devolucion = JSON.parse(datos);

    let fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${devolucion.numero}</td>
        <td>${devolucion.pedido}</td>
        <td>${devolucion.producto}</td>
        <td>${devolucion.fecha}</td>
        <td><span class="badge badge-custom">${devolucion.estado}</span></td>
    `;

    cuerpo.prepend(fila);
}

function crearTicket(event) {
    event.preventDefault();

    let formulario = document.getElementById("form-ticket");

    if (!formulario.checkValidity()) {
        formulario.classList.add("was-validated");
        return;
    }

    let ticket = {
        numero: "TCK-002",
        asunto: document.getElementById("asunto").value,
        mensaje: document.getElementById("mensaje").value,
        fecha: new Date().toLocaleDateString("es-CL"),
        estado: "Abierto"
    };

    sessionStorage.setItem("ticketNuevoChibson", JSON.stringify(ticket));
    window.location.href = "mis-tickets.html";
}

function mostrarTicketNuevo() {
    let cuerpo = document.getElementById("tabla-tickets");

    if (cuerpo == null) {
        return;
    }

    let datos = sessionStorage.getItem("ticketNuevoChibson");

    if (datos == null) {
        return;
    }

    let ticket = JSON.parse(datos);

    let fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${ticket.numero}</td>
        <td>${ticket.asunto}</td>
        <td>${ticket.fecha}</td>
        <td><span class="badge badge-custom">${ticket.estado}</span></td>
        <td>
            <a href="ticket-detalle-nuevo.html"
               class="btn btn-custom btn-sm">
                Ver
            </a>
        </td>
    `;

    cuerpo.prepend(fila);
}

function mostrarTicketNuevoDetalle() {
    let titulo = document.getElementById("ticket-nuevo-numero");

    if (titulo == null) {
        return;
    }

    let datos = sessionStorage.getItem("ticketNuevoChibson");

    if (datos == null) {
        document.getElementById("ticket-nuevo-contenido").innerHTML =
            '<div class="alert alert-warning">No hay un ticket nuevo para mostrar.</div>';
        return;
    }

    let ticket = JSON.parse(datos);

    titulo.textContent = "Ticket #" + ticket.numero;
    document.getElementById("ticket-nuevo-asunto").textContent = ticket.asunto;
    document.getElementById("ticket-nuevo-mensaje").textContent = ticket.mensaje;
    document.getElementById("ticket-nuevo-fecha").textContent = ticket.fecha;
}

function publicarResena(event) {
    event.preventDefault();

    let formulario = document.getElementById("form-resena");

    if (!formulario.checkValidity()) {
        formulario.classList.add("was-validated");
        return;
    }

    document.getElementById("mensaje-resena").classList.remove("d-none");
    formulario.reset();
    formulario.classList.remove("was-validated");
}

function calificarTicket(event) {
    event.preventDefault();

    let formulario = document.getElementById("form-calificacion-ticket");

    if (!formulario.checkValidity()) {
        formulario.classList.add("was-validated");
        return;
    }

    document.getElementById("mensaje-calificacion").classList.remove("d-none");
    formulario.reset();
    formulario.classList.remove("was-validated");
}

document.addEventListener("DOMContentLoaded", function() {
    mostrarCarro();
    mostrarCheckout();
    mostrarConfirmacion();
    mostrarPedidoNuevoEnLista();
    mostrarDetallePedidoNuevo();
    mostrarDevolucionNueva();
    mostrarTicketNuevo();
    mostrarTicketNuevoDetalle();

    if (document.getElementById("formDatos") != null) {
        cargarDatosPerfil();
        cargarDireccion();
    }
});
