
// ========================================
// 1. VARIABLES GLOBALES Y CÓDIGO INICIAL
// ========================================
let carrito = JSON.parse(localStorage.getItem('carritoTejebonito')) || [];
let favoritos = JSON.parse(localStorage.getItem('favoritosTejebonito')) || [];

// Elementos del Carrito
const contadorCarrito = document.getElementById('contadorCarrito');
const listaCarrito = document.getElementById('listaCarrito');
const carritoVacioMsg = document.getElementById('carritoVacioMsg');
const btnEnviarPedido = document.getElementById('btnEnviarPedido');
const btnVaciarCarrito = document.getElementById('btnVaciarCarrito');
const btnCarrito = document.getElementById('btnCarrito');
const panelCarrito = document.getElementById('panelCarrito');

// Elementos de Favoritos
const btnFavoritos = document.getElementById('btnFavoritos');
const panelFavoritos = document.getElementById('panelFavoritos');
const listaFavoritos = document.getElementById('listaFavoritos');
const favoritosVacioMsg = document.getElementById('favoritosVacioMsg');
const contadorFavoritos = document.getElementById('contadorFavoritos');
const botonesFavorito = document.querySelectorAll('.btn-favorito');

// Elementos de Menú y Notificaciones
const botonMenuTeje = document.getElementById('botonMenuTeje');
const navTeje = document.getElementById('navTeje');
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');

// ========================================
// 2. SISTEMA DE NOTIFICACIONES (TOAST)
// ========================================
function mostrarToast(mensaje, icono = '✨') {
    if (toastNotification && toastMessage) {
        toastMessage.textContent = mensaje;
        if (toastIcon) toastIcon.textContent = icono;
        
        toastNotification.classList.add('mostrar');
        
        // Estilos de respaldo por si el CSS no los define
        toastNotification.style.position = 'fixed';
        toastNotification.style.bottom = '80px';
        toastNotification.style.right = '20px';
        toastNotification.style.backgroundColor = '#fff0f5';
        toastNotification.style.color = '#4a4a4a';
        toastNotification.style.border = '1px solid #ffdeeb';
        toastNotification.style.padding = '12px 20px';
        toastNotification.style.borderRadius = '25px';
        toastNotification.style.boxShadow = '0 4px 15px rgba(255, 133, 162, 0.25)';
        toastNotification.style.zIndex = '3000';
        toastNotification.style.display = 'flex';
        toastNotification.style.alignItems = 'center';
        toastNotification.style.gap = '8px';
        toastNotification.style.opacity = '1';
        toastNotification.style.transition = 'opacity 0.3s ease';

        setTimeout(() => {
            toastNotification.style.opacity = '0';
            setTimeout(() => {
                toastNotification.style.display = 'none';
            }, 300);
        }, 3000);
    } else {
        console.log(`${icono} ${mensaje}`);
    }
}

// ========================================
// 3. MENÚ NAVEGACIÓN HAMBURGUESA
// ========================================
if (botonMenuTeje && navTeje) {
    botonMenuTeje.addEventListener('click', () => {
        navTeje.classList.toggle('abierto');
        if (navTeje.style.display === 'flex') {
            navTeje.style.display = 'none';
        } else {
            navTeje.style.display = 'flex';
            navTeje.style.flexDirection = 'column';
        }
    });
}

// ========================================
// 4. AGREGAR PRODUCTOS AL CARRITO
// ========================================
document.querySelectorAll('.btn-agregar-pedido').forEach((boton) => {
    boton.addEventListener('click', () => {
        const tarjeta = boton.closest('article');
        const nombreProducto = boton.getAttribute('data-nombre');
        const precioProducto = parseFloat(boton.getAttribute('data-precio')) || 0;
        
        const detalleInput = tarjeta?.querySelector('.input-tamano, .input-color');
        const detalle = detalleInput ? detalleInput.value.trim() : '';
        const cantidadVal = parseInt(tarjeta?.querySelector('.input-cantidad')?.value) || 1;

        carrito.push({
            nombre: nombreProducto,
            precio: precioProducto,
            detalle: detalle || 'Sin especificación',
            cantidad: cantidadVal
        });

        actualizarCarrito();
        mostrarToast(`¡${nombreProducto} agregado al pedido!`, '🛍️');

        if (detalleInput) detalleInput.value = '';
        const inputCantidad = tarjeta?.querySelector('.input-cantidad');
        if (inputCantidad) inputCantidad.value = '1';
    });
});

// ========================================
// 5. ACTUALIZAR Y RENDERIZAR CARRITO
// ========================================
function actualizarCarrito() {
    localStorage.setItem('carritoTejebonito', JSON.stringify(carrito));

    if (contadorCarrito) contadorCarrito.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    if (listaCarrito) listaCarrito.innerHTML = '';

    let totalAcumulado = 0;

    if (carrito.length === 0) {
        if (carritoVacioMsg) carritoVacioMsg.style.display = 'block';
    } else {
        if (carritoVacioMsg) carritoVacioMsg.style.display = 'none';
        carrito.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad;
            totalAcumulado += subtotal;

            if (listaCarrito) {
                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';
                li.style.marginBottom = '10px';
                li.style.paddingBottom = '5px';
                li.style.borderBottom = '1px solid #ffdeeb';

                li.innerHTML = `
                    <div>
                        <strong>${item.cantidad}x ${item.nombre}</strong> - $${subtotal.toLocaleString('es-CO')}<br>
                        <small style="color: #888;">Detalle: ${item.detalle}</small>
                    </div>
                    <button onclick="eliminarDelCarrito(${index})" style="background:none; border:none; color:#ff6584; cursor:pointer; font-size:1.1rem;" title="Eliminar">❌</button>
                `;
                listaCarrito.appendChild(li);
            }
        });
    }

    const totalElemento = document.getElementById('totalCarrito');
    if (totalElemento) {
        totalElemento.innerHTML = `Total: <strong>$${totalAcumulado.toLocaleString('es-CO')} COP</strong>`;
    }

    // Formatear mensaje para WhatsApp
    const lineas = carrito.map((item) => {
        return `• ${item.cantidad}x ${item.nombre} ($${(item.precio * item.cantidad).toLocaleString('es-CO')}) - Detalle: ${item.detalle}`;
    });

    let mensaje = 'Hola TEJEBONITO 🧶, quiero hacer el siguiente pedido:\n\n' + lineas.join('\n');
    if (totalAcumulado > 0) {
        mensaje += `\n\n*Total estimado: $${totalAcumulado.toLocaleString('es-CO')} COP*`;
    }

    if (btnEnviarPedido) {
        btnEnviarPedido.href = 'https://wa.me/57TU_NUMERO?text=' + encodeURIComponent(mensaje);
    }
}

// ========================================
// 6. ELIMINAR Y VACIAR CARRITO
// ========================================
window.eliminarDelCarrito = function(posicion) {
    const itemEliminado = carrito[posicion];
    carrito.splice(posicion, 1);
    actualizarCarrito();
    if (itemEliminado) {
        mostrarToast(`Eliminado: ${itemEliminado.nombre}`, '🗑️');
    }
};

if (btnVaciarCarrito) {
    btnVaciarCarrito.addEventListener('click', () => {
        if (carrito.length === 0) {
            mostrarToast('El carrito ya está vacío', 'ℹ️');
            return;
        }

        if (confirm('¿Estás segura de que deseas vaciar tu carrito?')) {
            carrito = [];
            actualizarCarrito();
            mostrarToast('Carrito vaciado con éxito', '🗑️');
        }
    });
}

if (btnCarrito && panelCarrito) {
    btnCarrito.addEventListener('click', () => {
        panelCarrito.classList.toggle('esta-abierto');
        if (panelFavoritos) panelFavoritos.classList.remove('esta-abierto');
    });
}

// ========================================
// 7. FAVORITOS (CON LOCALSTORAGE)
// ========================================
botonesFavorito.forEach((boton) => {
    boton.addEventListener('click', (evento) => {
        evento.stopPropagation();

        const nombreProducto = boton.getAttribute('data-nombre');
        const posicion = favoritos.indexOf(nombreProducto);

        if (posicion !== -1) {
            favoritos.splice(posicion, 1);
            mostrarToast(`Eliminado de favoritos: ${nombreProducto}`, '🤍');
        } else {
            favoritos.push(nombreProducto);
            mostrarToast(`¡${nombreProducto} agregado a favoritos!`, '💖');
        }

        actualizarFavoritos();
    });
});

function actualizarFavoritos() {
    localStorage.setItem('favoritosTejebonito', JSON.stringify(favoritos));

    if (contadorFavoritos) contadorFavoritos.textContent = favoritos.length;

    botonesFavorito.forEach((boton) => {
        const nombreProducto = boton.getAttribute('data-nombre');
        if (favoritos.includes(nombreProducto)) {
            boton.classList.add('es-favorito');
            boton.textContent = '❤️';
        } else {
            boton.classList.remove('es-favorito');
            boton.textContent = '🤍';
        }
    });

    if (!listaFavoritos) return;

    listaFavoritos.innerHTML = '';
    if (favoritos.length === 0) {
        if (favoritosVacioMsg) favoritosVacioMsg.style.display = 'block';
    } else {
        if (favoritosVacioMsg) favoritosVacioMsg.style.display = 'none';
        favoritos.forEach((nombre) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.padding = '6px 0';
            li.style.borderBottom = '1px dashed #ffdeeb';
            li.innerHTML = `<span>🧶 ${nombre}</span>`;
            listaFavoritos.appendChild(li);
        });
    }
}

if (btnFavoritos && panelFavoritos) {
    btnFavoritos.addEventListener('click', () => {
        panelFavoritos.classList.toggle('esta-abierto');
        if (panelCarrito) panelCarrito.classList.remove('esta-abierto');
    });
}

// ========================================
// 8. LÓGICA DEL ASISTENTE DE ESTILO
// ========================================
let datosAsistente = {
    destino: '',
    paleta: '',
    producto: '',
    precio: 0
};

window.seleccionarOpcion = function(clave, valor, siguientePaso) {
    datosAsistente[clave] = valor;
    
    document.querySelectorAll('.paso-asistente').forEach(p => p.classList.remove('activo'));
    const pasoSiguiente = document.getElementById(`paso${siguientePaso}`);
    if (pasoSiguiente) pasoSiguiente.classList.add('activo');
};

window.finalizarAsistente = function(nombreProducto, precioProducto) {
    datosAsistente.producto = nombreProducto;
    datosAsistente.precio = precioProducto;

    document.querySelectorAll('.paso-asistente').forEach(p => p.classList.remove('activo'));
    
    const resumen = document.getElementById('resumenRecomendacion');
    if (resumen) {
        resumen.innerHTML = `
            Te sugerimos pedir un <strong>${datosAsistente.producto}</strong>.<br>
            🎨 <strong>Paleta recomendada:</strong> ${datosAsistente.paleta}.<br>
            💡 <em>Para: ${datosAsistente.destino}.</em>
        `;
    }

    const pasoResultado = document.getElementById('pasoResultado');
    if (pasoResultado) pasoResultado.classList.add('activo');
};

window.reiniciarAsistente = function() {
    datosAsistente = { destino: '', paleta: '', producto: '', precio: 0 };
    document.querySelectorAll('.paso-asistente').forEach(p => p.classList.remove('activo'));
    const paso1 = document.getElementById('paso1');
    if (paso1) paso1.classList.add('activo');
};

const btnAgregarAsistente = document.getElementById('btnAgregarAsistente');
if (btnAgregarAsistente) {
    btnAgregarAsistente.addEventListener('click', () => {
        carrito.push({
            nombre: datosAsistente.producto,
            precio: datosAsistente.precio,
            detalle: `Paleta recomendada: ${datosAsistente.paleta}`,
            cantidad: 1
        });

        actualizarCarrito();
        mostrarToast(`¡${datosAsistente.producto} personalizado agregado!`, '✨');
        reiniciarAsistente();
    });
}

// ========================================
// 9. ETIQUETAS DINÁMICAS (MÁS VENDIDOS)
// ========================================
const productosPopulares = ['Scrunchie', 'Posavasos'];

document.querySelectorAll('#productos article').forEach((tarjeta) => {
    const botonAgregar = tarjeta.querySelector('.btn-agregar-pedido');
    if (botonAgregar) {
        const nombre = botonAgregar.getAttribute('data-nombre');
        if (productosPopulares.includes(nombre)) {
            const badge = document.createElement('span');
            badge.className = 'badge-mas-vendido';
            badge.textContent = '⭐ Más Vendido';
            tarjeta.appendChild(badge);
        }
    }
});

// ========================================
// 10. BOTÓN FLOTANTE "VOLVER ARRIBA"
// ========================================
const volverArriba = document.getElementById('volverArriba');

if (volverArriba) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            volverArriba.style.display = 'block';
        } else {
            volverArriba.style.display = 'none';
        }
    });

    volverArriba.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========================================
// 11. LIGHTBOX / ZOOM DE IMÁGENES
// ========================================
const lightbox = document.getElementById('lightbox');
const lightboxImagen = document.getElementById('lightboxImagen');
const cerrarLightbox = document.getElementById('cerrarLightbox');

document.querySelectorAll('#productos article img').forEach((imagen) => {
    imagen.style.cursor = 'zoom-in';
    imagen.addEventListener('click', () => {
        if (lightbox && lightboxImagen) {
            lightboxImagen.src = imagen.src;
            lightboxImagen.alt = imagen.alt;
            lightbox.style.display = 'flex';
        }
    });
});

if (cerrarLightbox) {
    cerrarLightbox.addEventListener('click', () => {
        if (lightbox) lightbox.style.display = 'none';
    });
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
}

// ========================================
// 12. BUSCADOR DE PRODUCTOS EN TIEMPO REAL
// ========================================
const inputBuscador = document.getElementById('inputBuscador');

if (inputBuscador) {
    inputBuscador.addEventListener('input', (e) => {
        const texto = e.target.value.toLowerCase().trim();
        
        document.querySelectorAll('#productos article').forEach((tarjeta) => {
            const nombre = tarjeta.querySelector('h3')?.textContent.toLowerCase() || '';
            const descripcion = tarjeta.querySelector('p')?.textContent.toLowerCase() || '';
            
            if (nombre.includes(texto) || descripcion.includes(texto)) {
                tarjeta.style.display = '';
            } else {
                tarjeta.style.display = 'none';
            }
        });
    });
}

// ========================================
// 13. CARGA INICIAL
// ========================================
actualizarCarrito();
actualizarFavoritos();