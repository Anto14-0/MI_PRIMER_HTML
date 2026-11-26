
// ========================================
// TEJEBONITO 🧶
// LÓGICA PRINCIPAL DE LA PÁGINA
// ========================================


// ========================================
// 1. CONFIGURACIÓN
// ========================================

// Cambiar cuando tengas el número de WhatsApp del emprendimiento.
const NUMERO_WHATSAPP = '573117101908';

// Dirección del backend.
const URL_BACKEND = 'http://localhost:3000';

// ========================================
// 2. VARIABLES GLOBALES
// ========================================

let carrito =
    JSON.parse(localStorage.getItem('carritoTejebonito')) || [];

let favoritos =
    JSON.parse(localStorage.getItem('favoritosTejebonito')) || [];


// ========================================
// 3. ELEMENTOS DEL CARRITO
// ========================================

const contadorCarrito =
    document.getElementById('contadorCarrito');

const listaCarrito =
    document.getElementById('listaCarrito');

const carritoVacioMsg =
    document.getElementById('carritoVacioMsg');

const btnEnviarPedido =
    document.getElementById('btnEnviarPedido');

const btnVaciarCarrito =
    document.getElementById('btnVaciarCarrito');

const btnCarrito =
    document.getElementById('btnCarrito');

const panelCarrito =
    document.getElementById('panelCarrito');


// ========================================
// 4. ELEMENTOS DE FAVORITOS
// ========================================

const btnFavoritos =
    document.getElementById('btnFavoritos');

const panelFavoritos =
    document.getElementById('panelFavoritos');

const listaFavoritos =
    document.getElementById('listaFavoritos');

const favoritosVacioMsg =
    document.getElementById('favoritosVacioMsg');

const contadorFavoritos =
    document.getElementById('contadorFavoritos');

const botonesFavorito =
    document.querySelectorAll('.btn-favorito');


// ========================================
// 5. MENÚ Y NOTIFICACIONES
// ========================================

const botonMenuTeje =
    document.getElementById('botonMenuTeje');

const navTeje =
    document.getElementById('navTeje');

const toastNotification =
    document.getElementById('toastNotification');

const toastMessage =
    document.getElementById('toastMessage');

const toastIcon =
    document.getElementById('toastIcon');


// ========================================
// 6. ENLACES DE WHATSAPP
// ========================================

const enlaceWhatsAppContacto =
    document.getElementById('enlaceWhatsAppContacto');

const whatsappFlotante =
    document.getElementById('whatsappFlotante');


// ========================================
// 7. CONFIGURAR WHATSAPP
// ========================================

function configurarWhatsApp() {

    const enlaceWhatsApp =
        `https://wa.me/573117107908`;

    if (enlaceWhatsAppContacto) {
        enlaceWhatsAppContacto.href = enlaceWhatsApp;
    }

    if (whatsappFlotante) {
        whatsappFlotante.href = enlaceWhatsApp;
    }
}

configurarWhatsApp();


// ========================================
// 8. SISTEMA DE NOTIFICACIONES
// ========================================

function mostrarToast(mensaje, icono = '✨') {

    if (toastNotification && toastMessage) {

        toastMessage.textContent = mensaje;

        if (toastIcon) {
            toastIcon.textContent = icono;
        }

        toastNotification.classList.add('mostrar');
        toastNotification.style.opacity = '1';

        setTimeout(() => {

            toastNotification.style.opacity = '0';

            setTimeout(() => {
                toastNotification.classList.remove('mostrar');
            }, 300);

        }, 3000);

    } else {

        console.log(`${icono} ${mensaje}`);

    }
}


// ========================================
// 9. MENÚ HAMBURGUESA
// ========================================

if (botonMenuTeje && navTeje) {

    botonMenuTeje.addEventListener('click', () => {

        const estaAbierto =
            navTeje.classList.toggle('esta-abierto');

        botonMenuTeje.setAttribute(
            'aria-expanded',
            estaAbierto
        );

        botonMenuTeje.setAttribute(
            'aria-label',
            estaAbierto ? 'Cerrar menú' : 'Abrir menú'
        );

        botonMenuTeje.textContent =
            estaAbierto ? '✕' : '☰';

    });

    navTeje.querySelectorAll('a').forEach((enlace) => {

        enlace.addEventListener('click', () => {

            navTeje.classList.remove('esta-abierto');

            botonMenuTeje.setAttribute(
                'aria-expanded',
                'false'
            );

            botonMenuTeje.setAttribute(
                'aria-label',
                'Abrir menú'
            );

            botonMenuTeje.textContent = '☰';

        });

    });

}


// ========================================
// 10. AGREGAR PRODUCTOS AL CARRITO
// ========================================

document
    .querySelectorAll('.btn-agregar-pedido')
    .forEach((boton) => {

        boton.addEventListener('click', () => {

            const tarjeta =
                boton.closest('article');

            const nombreProducto =
                boton.getAttribute('data-nombre');

            const precioProducto =
                parseFloat(
                    boton.getAttribute('data-precio')
                ) || 0;

            const detalleInput =
                tarjeta?.querySelector(
                    '.input-tamano, .input-color'
                );

            const detalle =
                detalleInput
                    ? detalleInput.value.trim()
                    : '';

            const inputCantidad =
                tarjeta?.querySelector('.input-cantidad');

            let cantidadVal =
                parseInt(inputCantidad?.value) || 1;

            if (cantidadVal < 1) {
                cantidadVal = 1;
            }

            carrito.push({
                nombre: nombreProducto,
                precio: precioProducto,
                detalle: detalle || 'Sin especificación',
                cantidad: cantidadVal
            });

            actualizarCarrito();

            mostrarToast(
                `¡${nombreProducto} agregado al pedido!`,
                '🛍️'
            );

            if (detalleInput) {
                detalleInput.value = '';
            }

            if (inputCantidad) {
                inputCantidad.value = '1';
            }

        });

    });


// ========================================
// 11. ACTUALIZAR Y RENDERIZAR CARRITO
// ========================================

function actualizarCarrito() {

    localStorage.setItem(
        'carritoTejebonito',
        JSON.stringify(carrito)
    );

    if (contadorCarrito) {

        contadorCarrito.textContent =
            carrito.reduce(
                (acumulado, item) =>
                    acumulado + item.cantidad,
                0
            );

    }

    if (listaCarrito) {
        listaCarrito.innerHTML = '';
    }

    let totalAcumulado = 0;

    if (carrito.length === 0) {

        if (carritoVacioMsg) {
            carritoVacioMsg.style.display = 'block';
        }

    } else {

        if (carritoVacioMsg) {
            carritoVacioMsg.style.display = 'none';
        }

        carrito.forEach((item, index) => {

            const subtotal =
                item.precio * item.cantidad;

            totalAcumulado += subtotal;

            if (listaCarrito) {

                const li =
                    document.createElement('li');

                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';
                li.style.marginBottom = '10px';
                li.style.paddingBottom = '5px';
                li.style.borderBottom = '1px solid #ffdeeb';

                const contenido =
                    document.createElement('div');

                const titulo =
                    document.createElement('strong');

                titulo.textContent =
                    `${item.cantidad}x ${item.nombre} - $${subtotal.toLocaleString('es-CO')}`;

                const detalle =
                    document.createElement('small');

                detalle.style.color = '#888';
                detalle.textContent =
                    `Detalle: ${item.detalle}`;

                contenido.appendChild(titulo);
                contenido.appendChild(
                    document.createElement('br')
                );
                contenido.appendChild(detalle);

                const botonEliminar =
                    document.createElement('button');

                botonEliminar.textContent = '❌';
                botonEliminar.title = 'Eliminar';

                botonEliminar.setAttribute(
                    'aria-label',
                    `Eliminar ${item.nombre}`
                );

                botonEliminar.style.background = 'none';
                botonEliminar.style.border = 'none';
                botonEliminar.style.color = '#ff6584';
                botonEliminar.style.cursor = 'pointer';
                botonEliminar.style.fontSize = '1.1rem';

                botonEliminar.addEventListener(
                    'click',
                    () => eliminarDelCarrito(index)
                );

                li.appendChild(contenido);
                li.appendChild(botonEliminar);

                listaCarrito.appendChild(li);

            }

        });

    }

    const totalElemento =
        document.getElementById('totalCarrito');

    if (totalElemento) {

        totalElemento.innerHTML =
            `Total: <strong>$${totalAcumulado.toLocaleString('es-CO')} COP</strong>`;

    }

    const lineas =
        carrito.map((item) => {

            return `• ${item.cantidad}x ${item.nombre} ($${(
                item.precio * item.cantidad
            ).toLocaleString('es-CO')}) - Detalle: ${item.detalle}`;

        });

    let mensaje =
        'Hola TEJEBONITO 🧶, quiero hacer el siguiente pedido:\n\n' +
        lineas.join('\n');

    if (totalAcumulado > 0) {

        mensaje +=
            `\n\n*Total estimado: $${totalAcumulado.toLocaleString('es-CO')} COP*`;

    }

    if (btnEnviarPedido) {

        btnEnviarPedido.href =
            `https://wa.me/${NUMERO_WHATSAPP}?text=` +
            encodeURIComponent(mensaje);

    }

}


// ========================================
// 12. ELIMINAR PRODUCTO DEL CARRITO
// ========================================

window.eliminarDelCarrito =
    function(posicion) {

        const itemEliminado =
            carrito[posicion];

        carrito.splice(posicion, 1);

        actualizarCarrito();

        if (itemEliminado) {

            mostrarToast(
                `Eliminado: ${itemEliminado.nombre}`,
                '🗑️'
            );

        }

    };


// ========================================
// 13. VACIAR CARRITO
// ========================================

if (btnVaciarCarrito) {

    btnVaciarCarrito.addEventListener('click', () => {

        if (carrito.length === 0) {

            mostrarToast(
                'El carrito ya está vacío',
                'ℹ️'
            );

            return;
        }

        if (confirm('¿Estás segura de que deseas vaciar tu carrito?')) {

            carrito = [];

            actualizarCarrito();

            mostrarToast(
                'Carrito vaciado con éxito',
                '🗑️'
            );

        }

    });

}


// ========================================
// 14. ABRIR / CERRAR CARRITO
// ========================================

if (btnCarrito && panelCarrito) {

    btnCarrito.addEventListener('click', () => {

        const estaAbierto =
            panelCarrito.classList.contains('esta-abierto');

        panelCarrito.classList.toggle(
            'esta-abierto',
            !estaAbierto
        );

        if (panelFavoritos) {
            panelFavoritos.classList.remove('esta-abierto');
        }

    });

}


// ========================================
// 15. ABRIR / CERRAR FAVORITOS
// ========================================

if (btnFavoritos && panelFavoritos) {

    btnFavoritos.addEventListener('click', () => {

        const estaAbierto =
            panelFavoritos.classList.contains('esta-abierto');

        panelFavoritos.classList.toggle(
            'esta-abierto',
            !estaAbierto
        );

        if (panelCarrito) {
            panelCarrito.classList.remove('esta-abierto');
        }

    });

}


// ========================================
// 16. BOTONES DE CIERRE
// ========================================

document
    .querySelectorAll('.panel-close')
    .forEach((botonCerrar) => {

        botonCerrar.addEventListener('click', () => {

            const panelId =
                botonCerrar.dataset.panel;

            const panel =
                document.getElementById(panelId);

            if (panel) {
                panel.classList.remove('esta-abierto');
            }

        });

    });


// ========================================
// 17. CERRAR PANELES AL HACER CLIC AFUERA
// ========================================

document.addEventListener('click', (evento) => {

    const panelAbierto =
        document.querySelector(
            '.panel-carrito.esta-abierto, .panel-favoritos.esta-abierto'
        );

    if (!panelAbierto) {
        return;
    }

    const clickDentroPanel =
        panelAbierto.contains(evento.target);

    const clickBotonCarrito =
        btnCarrito && btnCarrito.contains(evento.target);

    const clickBotonFavoritos =
        btnFavoritos && btnFavoritos.contains(evento.target);

    if (
        !clickDentroPanel &&
        !clickBotonCarrito &&
        !clickBotonFavoritos
    ) {

        panelAbierto.classList.remove('esta-abierto');

    }

});


// ========================================
// 18. FAVORITOS
// ========================================

botonesFavorito.forEach((boton) => {

    boton.addEventListener('click', (evento) => {

        evento.stopPropagation();

        const nombreProducto =
            boton.getAttribute('data-nombre');

        const posicion =
            favoritos.indexOf(nombreProducto);

        if (posicion !== -1) {

            favoritos.splice(posicion, 1);

            mostrarToast(
                `Eliminado de favoritos: ${nombreProducto}`,
                '🤍'
            );

        } else {

            favoritos.push(nombreProducto);

            mostrarToast(
                `¡${nombreProducto} agregado a favoritos!`,
                '💖'
            );

        }

        actualizarFavoritos();

    });

});


// ========================================
// 19. ACTUALIZAR FAVORITOS
// ========================================

function actualizarFavoritos() {

    localStorage.setItem(
        'favoritosTejebonito',
        JSON.stringify(favoritos)
    );

    if (contadorFavoritos) {
        contadorFavoritos.textContent = favoritos.length;
    }

    botonesFavorito.forEach((boton) => {

        const nombreProducto =
            boton.getAttribute('data-nombre');

        if (favoritos.includes(nombreProducto)) {

            boton.classList.add('es-favorito');
            boton.textContent = '❤️';

        } else {

            boton.classList.remove('es-favorito');
            boton.textContent = '🤍';

        }

    });

    if (!listaFavoritos) {
        return;
    }

    listaFavoritos.innerHTML = '';

    if (favoritos.length === 0) {

        if (favoritosVacioMsg) {
            favoritosVacioMsg.style.display = 'block';
        }

    } else {

        if (favoritosVacioMsg) {
            favoritosVacioMsg.style.display = 'none';
        }

        favoritos.forEach((nombre) => {

            const li =
                document.createElement('li');

            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.padding = '6px 0';
            li.style.borderBottom = '1px dashed #ffdeeb';

            li.textContent = `🧶 ${nombre}`;

            listaFavoritos.appendChild(li);

        });

    }

}


// ========================================
// 20. ASISTENTE DE ESTILO
// ========================================

let datosAsistente = {
    destino: '',
    paleta: '',
    producto: '',
    precio: 0
};


window.seleccionarOpcion =
    function(clave, valor, siguientePaso) {

        datosAsistente[clave] = valor;

        document
            .querySelectorAll('.paso-asistente')
            .forEach((paso) => {
                paso.classList.remove('activo');
            });

        const pasoSiguiente =
            document.getElementById(`paso${siguientePaso}`);

        if (pasoSiguiente) {
            pasoSiguiente.classList.add('activo');
        }

    };


window.finalizarAsistente =
    function(nombreProducto, precioProducto) {

        datosAsistente.producto = nombreProducto;
        datosAsistente.precio = precioProducto;

        document
            .querySelectorAll('.paso-asistente')
            .forEach((paso) => {
                paso.classList.remove('activo');
            });

        const resumen =
            document.getElementById('resumenRecomendacion');

        if (resumen) {

            resumen.innerHTML = `
                Te sugerimos pedir un
                <strong>${datosAsistente.producto}</strong>.<br>
                🎨 <strong>Paleta recomendada:</strong>
                ${datosAsistente.paleta}.<br>
                💡 <em>Para: ${datosAsistente.destino}.</em>
            `;

        }

        const pasoResultado =
            document.getElementById('pasoResultado');

        if (pasoResultado) {
            pasoResultado.classList.add('activo');
        }

    };


window.reiniciarAsistente =
    function() {

        datosAsistente = {
            destino: '',
            paleta: '',
            producto: '',
            precio: 0
        };

        document
            .querySelectorAll('.paso-asistente')
            .forEach((paso) => {
                paso.classList.remove('activo');
            });

        const paso1 =
            document.getElementById('paso1');

        if (paso1) {
            paso1.classList.add('activo');
        }

    };


// ========================================
// 21. AGREGAR RECOMENDACIÓN DEL ASISTENTE
// ========================================

const btnAgregarAsistente =
    document.getElementById('btnAgregarAsistente');

if (btnAgregarAsistente) {

    btnAgregarAsistente.addEventListener('click', () => {

        carrito.push({
            nombre: datosAsistente.producto,
            precio: datosAsistente.precio,
            detalle: `Paleta recomendada: ${datosAsistente.paleta}`,
            cantidad: 1
        });

        actualizarCarrito();

        mostrarToast(
            `¡${datosAsistente.producto} personalizado agregado!`,
            '✨'
        );

        reiniciarAsistente();

    });

}


// ========================================
// 22. ETIQUETAS "MÁS VENDIDO"
// ========================================

const productosPopulares = [
    'Scrunchie',
    'Posavasos'
];

document
    .querySelectorAll('#productos article')
    .forEach((tarjeta) => {

        const botonAgregar =
            tarjeta.querySelector('.btn-agregar-pedido');

        if (!botonAgregar) {
            return;
        }

        const nombre =
            botonAgregar.getAttribute('data-nombre');

        if (productosPopulares.includes(nombre)) {

            const badge =
                document.createElement('span');

            badge.className = 'badge-mas-vendido';
            badge.textContent = '⭐ Más Vendido';

            tarjeta.appendChild(badge);

        }

    });


// ========================================
// 23. BOTÓN VOLVER ARRIBA
// ========================================

const volverArriba =
    document.getElementById('volverArriba');

if (volverArriba) {

    window.addEventListener('scroll', () => {

        if (window.scrollY > 300) {
            volverArriba.style.display = 'block';
        } else {
            volverArriba.style.display = 'none';
        }

    });

    volverArriba.addEventListener('click', () => {

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    });

}


// ========================================
// 24. LIGHTBOX / ZOOM DE IMÁGENES
// ========================================

const lightbox =
    document.getElementById('lightbox');

const lightboxImagen =
    document.getElementById('lightboxImagen');

const cerrarLightbox =
    document.getElementById('cerrarLightbox');


document
    .querySelectorAll('#productos article img')
    .forEach((imagen) => {

        imagen.style.cursor = 'zoom-in';

        imagen.addEventListener('click', () => {

            if (lightbox && lightboxImagen) {

                lightboxImagen.src = imagen.src;
                lightboxImagen.alt = imagen.alt;

                lightbox.classList.add('esta-abierto');

            }

        });

    });


if (cerrarLightbox) {

    cerrarLightbox.addEventListener('click', () => {

        if (lightbox) {
            lightbox.classList.remove('esta-abierto');
        }

    });

}


if (lightbox) {

    lightbox.addEventListener('click', (evento) => {

        if (evento.target === lightbox) {
            lightbox.classList.remove('esta-abierto');
        }

    });

}


// ========================================
// 25. BUSCADOR Y FILTROS DE PRODUCTOS
// ========================================

const inputBuscador =
    document.getElementById('inputBuscador');

const botonesCategoria =
    document.querySelectorAll('.btn-categoria');

const productosCategoria =
    document.querySelectorAll('#productos .producto-card');

let categoriaSeleccionada = 'todos';


function filtrarProductos() {

    const texto = inputBuscador
        ? inputBuscador.value.toLowerCase().trim()
        : '';

    productosCategoria.forEach((producto) => {

        const nombre =
            producto.querySelector('h3')
                ?.textContent.toLowerCase() || '';

        const descripcion =
            producto.querySelector('p')
                ?.textContent.toLowerCase() || '';

        const personalizacion =
            producto.querySelector('.personalizacion')
                ?.textContent.toLowerCase() || '';

        const categorias =
            producto.dataset.categoria || '';

        const coincideTexto =
            nombre.includes(texto) ||
            descripcion.includes(texto) ||
            personalizacion.includes(texto);

        const coincideCategoria =
            categoriaSeleccionada === 'todos' ||
            categorias.includes(categoriaSeleccionada);

        producto.style.display =
            coincideTexto && coincideCategoria ? '' : 'none';

    });

}


if (inputBuscador) {
    inputBuscador.addEventListener('input', filtrarProductos);
}


botonesCategoria.forEach((boton) => {

    boton.addEventListener('click', () => {

        botonesCategoria.forEach((btn) => {
            btn.classList.remove('activo');
        });

        boton.classList.add('activo');

        categoriaSeleccionada =
            boton.dataset.categoria || 'todos';

        filtrarProductos();

    });

});


// ========================================
// 26. FORMULARIO DE CONSULTAS
// ========================================

const formularioConsulta =
    document.getElementById('formularioConsulta');

if (formularioConsulta) {

    formularioConsulta.addEventListener('submit', async (evento) => {

        // Evitar que la página se recargue.
        evento.preventDefault();

        // Obtener los datos del formulario.
        const nombre =
            document.getElementById('nombreConsulta')?.value.trim();

        const correo =
            document.getElementById('correoConsulta')?.value.trim();

        const temaConsulta = document.getElementById('productoConsulta');

        const mensaje =
            document.getElementById('mensajeConsulta')?.value.trim();

        // Validar los campos obligatorios.
        if (!nombre || !correo || !mensaje) {

            mostrarToast(
                'Completa los campos obligatorios.',
                '⚠️'
            );

            return;
        }

        // Obtener el botón de envío.
        const btnEnviar =
            document.getElementById('btnEnviarConsulta');

        // Evitar varios envíos al mismo tiempo.
        if (btnEnviar) {
            btnEnviar.disabled = true;
            btnEnviar.textContent = 'Enviando...';
        }

        try {

            // Enviar los datos al backend.
            const respuesta = await fetch(
                `${URL_BACKEND}/api/consultas`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        nombre,
                        correo,
                        producto,
                        mensaje
                    })
                }
            );

            // Convertir la respuesta del servidor a JSON.
            const resultado = await respuesta.json();

            // Comprobar si el servidor respondió correctamente.
            if (!respuesta.ok) {

                throw new Error(
                    resultado.mensaje ||
                    'No se pudo guardar la consulta.'
                );

            }

            // Mostrar confirmación únicamente si se guardó.
            mostrarToast(
                '¡Tu consulta se guardó correctamente!',
                '💌'
            );

            // Limpiar el formulario.
            formularioConsulta.reset();

        } catch (error) {

            console.error(
                'Error al enviar la consulta:',
                error
            );

            mostrarToast(
                'No pudimos guardar tu consulta. Inténtalo nuevamente.',
                '⚠️'
            );

        } finally {

            // Reactivar el botón.
            if (btnEnviar) {
                btnEnviar.disabled = false;
                btnEnviar.textContent = 'Enviar consulta 💌';
            }

        }

    });

}


// ========================================
// 27. MODO CLARO / MODO OSCURO
// ========================================

const btnTema =
    document.getElementById('btnTema');

if (btnTema) {

    const temaGuardado =
        localStorage.getItem('temaTejebonito');

    if (temaGuardado === 'oscuro') {

        document.body.classList.add('modo-oscuro');
        btnTema.textContent = '☀️';

    } else {

        document.body.classList.remove('modo-oscuro');
        btnTema.textContent = '🌙';

    }

    btnTema.addEventListener('click', () => {

        document.body.classList.toggle('modo-oscuro');

        if (document.body.classList.contains('modo-oscuro')) {

            btnTema.textContent = '☀️';

            localStorage.setItem(
                'temaTejebonito',
                'oscuro'
            );

        } else {

            btnTema.textContent = '🌙';

            localStorage.setItem(
                'temaTejebonito',
                'claro'
            );

        }

    });

}



// ========================================
// 28. ABRIR Y CERRAR TEJEBOT
// ========================================

const tejebotAbrir =
    document.getElementById('tejebot-abrir');

const tejebotCerrar =
    document.getElementById('tejebot-cerrar');

const tejebotVentana =
    document.getElementById('tejebot-ventana');

if (tejebotAbrir && tejebotCerrar && tejebotVentana) {

    tejebotAbrir.addEventListener('click', () => {

        tejebotVentana.classList.add('abierto');
        tejebotVentana.setAttribute('aria-hidden', 'false');

        tejebotAbrir.style.display = 'none';

    });

    tejebotCerrar.addEventListener('click', () => {

        tejebotVentana.classList.remove('abierto');
        tejebotVentana.setAttribute('aria-hidden', 'true');

        tejebotAbrir.style.display = 'block';

    });

}
// ========================================
// 28. CARGA INICIAL
// ========================================

// Actualizar carrito y favoritos al cargar la página.
actualizarCarrito();
actualizarFavoritos();

// ========================================
// 30. ELEMENTOS DE TEJEBOT
// ========================================

const formularioTejeBot =
    document.getElementById('tejebot-formulario');

const inputTejeBot =
    document.getElementById('tejebot-input');

const mensajesTejeBot =
    document.getElementById('tejebot-mensajes');

const botonEnviarTejeBot =
    document.getElementById('tejebot-enviar');

// Agregar mensajes a la conversación
function agregarMensajeTejeBot(texto, tipo) {

    const mensaje = document.createElement('div');

    mensaje.className = `tejebot-mensaje ${tipo}`;
    mensaje.textContent = texto;

    mensajesTejeBot.appendChild(mensaje);

    mensajesTejeBot.scrollTop =
        mensajesTejeBot.scrollHeight;
}

// ========================================
// 31. CONECTAR TEJEBOT CON EL BACKEND
// ========================================

if (formularioTejeBot) {

    formularioTejeBot.addEventListener('submit', async (evento) => {

        evento.preventDefault();

        const pregunta = inputTejeBot.value.trim();

        if (!pregunta) return;

        // Mostrar la pregunta del usuario
        agregarMensajeTejeBot(pregunta, 'usuario');

        inputTejeBot.value = '';
        inputTejeBot.disabled = true;
        botonEnviarTejeBot.disabled = true;

        // Mostrar mensaje de espera
        agregarMensajeTejeBot(
            'TejeBot está pensando... 🧶',
            'bot'
        );

        const mensajeEspera =
            mensajesTejeBot.lastElementChild;

        try {

            const respuesta = await fetch(
                'https://tejebonito-backend.onrender.com/api/tejebot',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        mensaje: pregunta
                    })
                }
            );

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    resultado.mensaje || 'No se pudo obtener una respuesta.'
                );
            }

            mensajeEspera.textContent =
                resultado.respuesta || 'No recibí una respuesta.';

        } catch (error) {

            console.error('Error de TejeBot:', error);

            mensajeEspera.textContent =
                '¡Ups! No pude conectarme. Inténtalo nuevamente. 💗';

        } finally {

            inputTejeBot.disabled = false;
            botonEnviarTejeBot.disabled = false;
            inputTejeBot.focus();

        }

    });

}


// ========================================
// 32. PANEL ADMINISTRATIVO DE TEJEBONITO
// ========================================

// Referencias a los elementos HTML.
const panelAdmin = document.getElementById('panelAdmin');
const btnAbrirAdmin = document.getElementById('btnAbrirAdmin');
const btnCerrarAdmin = document.getElementById('btnCerrarAdmin');

const formAdminLogin = document.getElementById('formAdminLogin');
const adminUsuario = document.getElementById('adminUsuario');
const adminContrasena = document.getElementById('adminContrasena');
const adminErrorMsg = document.getElementById('adminErrorMsg');

const adminDashboard = document.getElementById('adminDashboard');
const adminBienvenida = document.getElementById('adminBienvenida');
const btnAdminSalir = document.getElementById('btnAdminSalir');

const adminColoresLista = document.getElementById('adminColoresLista');
const adminConsultasLista = document.getElementById('adminConsultasLista');

// Sesión administrativa.
let tokenAdmin = null;

// Control de actualización automática.
let intervaloActualizacionAdmin = null;
let cargandoDashboardAdmin = false;


// ========================================
// 32.1 MOSTRAR MENSAJES DE ERROR
// ========================================

function mostrarErrorAdmin(mensaje) {
    if (adminErrorMsg) {
        adminErrorMsg.textContent = mensaje;
    }
}


// ========================================
// 32.2 ABRIR EL PANEL
// ========================================

if (btnAbrirAdmin && panelAdmin) {
    btnAbrirAdmin.addEventListener('click', () => {
        panelAdmin.classList.remove('oculto');

        if (tokenAdmin) {
            cargarDashboardAdmin();
        }
    });
}


// ========================================
// 32.3 CERRAR EL PANEL
// ========================================

// Cerrar el panel NO cierra la sesión.
// Así puede seguir actualizándose en segundo plano.

if (btnCerrarAdmin && panelAdmin) {
    btnCerrarAdmin.addEventListener('click', () => {
        panelAdmin.classList.add('oculto');
    });
}


// ========================================
// 32.4 INICIAR SESIÓN
// ========================================

if (formAdminLogin) {
    formAdminLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const usuario = adminUsuario.value.trim();
        const contrasena = adminContrasena.value;

        if (!usuario || !contrasena) {
            mostrarErrorAdmin('Completa todos los campos.');
            return;
        }

        const botonEntrar = formAdminLogin.querySelector(
            'button[type="submit"]'
        );

        if (botonEntrar) {
            botonEntrar.disabled = true;
            botonEntrar.textContent = 'Ingresando...';
        }

        mostrarErrorAdmin('');

        try {
            const respuesta = await fetch(
                `${URL_BACKEND}/api/admin/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        usuario,
                        contrasena
                    })
                }
            );

            const resultado = await respuesta.json().catch(() => ({}));

            if (!respuesta.ok) {
                throw new Error(
                    resultado.mensaje || 'No se pudo iniciar sesión.'
                );
            }

            if (!resultado.token) {
                throw new Error('El servidor no devolvió un token válido.');
            }

            // Guardar el token solo mientras la página esté abierta.
            tokenAdmin = resultado.token;

            adminContrasena.value = '';

            formAdminLogin.classList.add('oculto');
            adminDashboard.classList.remove('oculto');

            adminBienvenida.textContent = `¡Bienvenida, ${usuario}!`;

            mostrarErrorAdmin('');

            mostrarToast('Sesión administrativa iniciada.', '🔐');

            await cargarDashboardAdmin();

            iniciarActualizacionAutomaticaAdmin();

        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            mostrarErrorAdmin(error.message);
        } finally {
            if (botonEntrar) {
                botonEntrar.disabled = false;
                botonEntrar.textContent = 'Entrar';
            }
        }
    });
}


// ========================================
// 32.5 CARGAR INFORMACIÓN DEL DASHBOARD
// ========================================

async function cargarDashboardAdmin() {

    if (!tokenAdmin || cargandoDashboardAdmin) {
        return;
    }

    cargandoDashboardAdmin = true;

    try {
        const respuesta = await fetch(
            `${URL_BACKEND}/api/admin/dashboard`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${tokenAdmin}`
                }
            }
        );

        const resultado = await respuesta.json().catch(() => ({}));

        if (respuesta.status === 401) {
            cerrarSesionAdmin('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
        }

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje || 'No se pudo cargar el panel.'
            );
        }

        // Mostrar colores y consultas.
        renderizarColoresAdmin(resultado.colores || []);
        renderizarConsultasAdmin(resultado.consultas || []);

    } catch (error) {
        console.error('Error al cargar el panel:', error);

        if (adminConsultasLista) {
            adminConsultasLista.textContent =
                'No se pudo actualizar la información. Se intentará nuevamente.';
        }

    } finally {
        cargandoDashboardAdmin = false;
    }
}


// ========================================
// 32.6 MOSTRAR LOS COLORES
// ========================================

function renderizarColoresAdmin(colores) {

    if (!adminColoresLista) return;

    adminColoresLista.replaceChildren();

    if (!Array.isArray(colores) || colores.length === 0) {
        adminColoresLista.textContent = 'No hay colores registrados.';
        return;
    }

    colores.forEach((color) => {

        const tarjeta = document.createElement('div');
        tarjeta.className = 'admin-color-item';

        const nombre = document.createElement('span');
        nombre.textContent = color.nombre || 'Color sin nombre';

        const muestra = document.createElement('span');
        muestra.className = 'admin-color-muestra';

        if (color.hex) {
            muestra.style.backgroundColor = color.hex;
        }

        const etiqueta = document.createElement('label');
        etiqueta.className = 'admin-color-control';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = color.disponible === true;

        const textoEstado = document.createElement('span');
        textoEstado.textContent = checkbox.checked
            ? 'Disponible'
            : 'No disponible';

        checkbox.addEventListener('change', async () => {

            const estadoAnterior = !checkbox.checked;

            checkbox.disabled = true;
            textoEstado.textContent = 'Actualizando...';

            try {
                const respuesta = await fetch(
                    `${URL_BACKEND}/api/admin/colores/${encodeURIComponent(color.id)}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${tokenAdmin}`
                        },
                        body: JSON.stringify({
                            disponible: checkbox.checked
                        })
                    }
                );

                const resultado = await respuesta.json().catch(() => ({}));

                if (respuesta.status === 401) {
                    cerrarSesionAdmin(
                        'Tu sesión expiró. Inicia sesión nuevamente.'
                    );
                    return;
                }

                if (!respuesta.ok) {
                    throw new Error(
                        resultado.mensaje || 'No se pudo actualizar el color.'
                    );
                }

                textoEstado.textContent = checkbox.checked
                    ? 'Disponible'
                    : 'No disponible';

                mostrarToast('Disponibilidad actualizada.', '🎨');

            } catch (error) {
                console.error('Error al actualizar color:', error);

                checkbox.checked = estadoAnterior;

                textoEstado.textContent = checkbox.checked
                    ? 'Disponible'
                    : 'No disponible';

                mostrarToast(error.message, '⚠️');

            } finally {
                checkbox.disabled = false;
            }
        });

        etiqueta.appendChild(checkbox);
        etiqueta.appendChild(textoEstado);

        tarjeta.appendChild(muestra);
        tarjeta.appendChild(nombre);
        tarjeta.appendChild(etiqueta);

        adminColoresLista.appendChild(tarjeta);
    });
}


// ========================================
// 32.7 MOSTRAR LAS CONSULTAS
// ========================================

function renderizarConsultasAdmin(consultas) {

    if (!adminConsultasLista) return;

    adminConsultasLista.replaceChildren();

    if (!Array.isArray(consultas) || consultas.length === 0) {
        adminConsultasLista.textContent = 'Todavía no hay consultas recibidas.';
        return;
    }

    // Ordenar de la más reciente a la más antigua.
    const consultasOrdenadas = [...consultas].sort((a, b) => {
        const fechaA = new Date(a.fecha).getTime() || 0;
        const fechaB = new Date(b.fecha).getTime() || 0;

        return fechaB - fechaA;
    });

    consultasOrdenadas.forEach((consulta) => {

        const tarjeta = document.createElement('article');
        tarjeta.className = 'admin-consulta-item';

        const nombre = document.createElement('h5');
        nombre.textContent = consulta.nombre || 'Sin nombre';

        const correo = document.createElement('p');
        correo.textContent = `Correo: ${consulta.correo || 'No indicado'}`;

        const producto = document.createElement('p');
        producto.textContent = `Producto: ${consulta.producto || 'No especificado'}`;

        const mensaje = document.createElement('p');
        mensaje.textContent = `Mensaje: ${consulta.mensaje || ''}`;

        const fecha = document.createElement('small');

        const fechaConsulta = new Date(consulta.fecha);

        fecha.textContent = Number.isNaN(fechaConsulta.getTime())
            ? 'Fecha no disponible'
            : `Recibida: ${fechaConsulta.toLocaleString('es-CO')}`;

        tarjeta.appendChild(nombre);
        tarjeta.appendChild(correo);
        tarjeta.appendChild(producto);
        tarjeta.appendChild(mensaje);
        tarjeta.appendChild(fecha);

        adminConsultasLista.appendChild(tarjeta);
    });
}


// ========================================
// 32.8 ACTUALIZACIÓN AUTOMÁTICA
// ========================================

function iniciarActualizacionAutomaticaAdmin() {

    // Evitar crear varios intervalos.
    detenerActualizacionAutomaticaAdmin();

    // Consultar el backend cada 15 segundos.
    intervaloActualizacionAdmin = setInterval(() => {

        if (tokenAdmin) {
            cargarDashboardAdmin();
        }

    }, 15000);
}


function detenerActualizacionAutomaticaAdmin() {

    if (intervaloActualizacionAdmin !== null) {
        clearInterval(intervaloActualizacionAdmin);
        intervaloActualizacionAdmin = null;
    }
}


// ========================================
// 32.9 CERRAR SESIÓN
// ========================================

function cerrarSesionAdmin(mensaje = 'Sesión cerrada.') {

    tokenAdmin = null;

    detenerActualizacionAutomaticaAdmin();

    if (adminDashboard) {
        adminDashboard.classList.add('oculto');
    }

    if (formAdminLogin) {
        formAdminLogin.classList.remove('oculto');
        formAdminLogin.reset();
    }

    if (adminBienvenida) {
        adminBienvenida.textContent = '';
    }

    if (adminColoresLista) {
        adminColoresLista.replaceChildren();
    }

    if (adminConsultasLista) {
        adminConsultasLista.replaceChildren();
    }

    mostrarErrorAdmin('');

    mostrarToast(mensaje, '🔒');
}


// Botón para cerrar sesión.
if (btnAdminSalir) {
    btnAdminSalir.addEventListener('click', () => {
        cerrarSesionAdmin('Has cerrado tu sesión administrativa.');
    });
}
