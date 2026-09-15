// ========================================
// LÓGICA DE LA CALCULADORA PRIVADA
// ========================================

function realizarCalculo(event) {
    event.preventDefault();

    // Obtener valores de los campos
    const costoMateriales = parseFloat(document.getElementById('materiales').value) || 0;
    const horasTrabajo = parseFloat(document.getElementById('horas').value) || 0;
    const valorHora = parseFloat(document.getElementById('valorHora').value) || 0;
    const porcentajeGanancia = parseFloat(document.getElementById('ganancia').value) || 0;

    // 1. Costo de la mano de obra
    const manoDeObra = horasTrabajo * valorHora;

    // 2. Costo base total (materiales + tu tiempo)
    const costoBase = costoMateriales + manoDeObra;

    // 3. Ganancia neta para reinvertir en el emprendimiento
    const ganancia = costoBase * (porcentajeGanancia / 100);

    // 4. Precio final redondeado a miles cercanos (para dar devueltos sencillos)
    const precioSugerido = Math.ceil((costoBase + ganancia) / 1000) * 1000;

    // Mostrar los resultados en la caja visual
    document.getElementById('resManoObra').textContent = `$${manoDeObra.toLocaleString('es-CO')} COP`;
    document.getElementById('resCostoBase').textContent = `$${costoBase.toLocaleString('es-CO')} COP`;
    document.getElementById('resGanancia').textContent = `$${ganancia.toLocaleString('es-CO')} COP`;
    document.getElementById('resPrecioFinal').textContent = `$${precioSugerido.toLocaleString('es-CO')} COP`;

    // Desplegar la caja de resultados
    const cajaResultado = document.getElementById('cajaResultado');
    cajaResultado.style.display = 'block';
}