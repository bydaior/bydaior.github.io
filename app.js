// VARIABLE PARA NOMBRE DINÁMICO DEL COMERCIO
const nombreTienda = "Daior";

// Productos con ofertas especiales
const productos = [
    { 
        id: 1, 
        nombre: "Vocal Mixing", 
        precio: 44.99, 
        precioOriginal: 99.99,
        categoria: "Servicios", 
        img: "https://i.pinimg.com/736x/72/07/df/7207dfcfb37e7d3483f5df35712d903d.jpg",
        descripcion: "Mezcla solo de voces + instrumental, llevaré tu canción al siguiente nivel.",
        oferta: true
    },
    { 
        id: 2, 
        nombre: "Mixing Silver", 
        precio: 80.00, 
        precioOriginal: 125.00,
        categoria: "Servicios", 
        img: "https://i.pinimg.com/1200x/a3/a3/a4/a3a3a48c1fc37118081f5f0e50a83fc9.jpg",
        descripcion: "Mezcla de hasta 25 tracks, llevaré tu canción al siguiente nivel.",
        oferta: true
    },
    { 
        id: 3, 
        nombre: "Mixing Platinum", 
        precio: 134.00,
        precioOriginal: 224.99,
        categoria: "Servicios", 
        img: "https://i.pinimg.com/736x/f7/c6/f1/f7c6f103d8b793839417a6c23bcba1c3.jpg",
        descripcion: "Mezcla de hasta 45 tracks, llevaré tu canción al siguiente nivel.",
        oferta: true
    },
    { 
        id: 4, 
        nombre: "Exclusive Beat", 
        precio: 150.00, 
        categoria: "Servicios", 
        img: "https://i.pinimg.com/1200x/ce/a5/7b/cea57bd488a637633c57bf61aad4e2ff.jpg",
        descripcion: "Beat exclusivo para tu proyecto musical, sin regalías adicionales.",
        oferta: false
    },
    { 
        id: 5, 
        nombre: "Masterización", 
        precio: 35.00, 
        precioOriginal: 45.00,
        categoria: "Servicios", 
        img: "https://i.pinimg.com/1200x/ec/38/c3/ec38c3b5e3fdbd592f0ee45ea581e265.jpg",
        descripcion: "El último paso que necesita tu canción para que tenga una fiel representación final",
        oferta: true
    },
    { 
        id: 6, 
        nombre: "Catarsis Drumkit (Reggaeton)", 
        precio: 19.99, 
        precioOriginal: 35.00,
        categoria: "Drumkits", 
        img: "https://i.pinimg.com/1200x/4a/61/76/4a6176b37eb70835473089f4cb21e243.jpg",
        descripcion: "La librería de sonidos que necesitas para que tus beats destaquen con unos drums potentes irresistibles para los artistas.",
        oferta: true
    },
];

// Variables globales
let carrito = JSON.parse(localStorage.getItem('mi_carrito_web')) || [];
let numeroOrden = localStorage.getItem('numero_orden') || generarNumeroOrden();
let productoSeleccionadoId = null;
let bannerMostrado = localStorage.getItem('banner_oferta_mostrado') !== 'true';

// Función para actualizar el nombre de la tienda en toda la página
function actualizarNombreTienda() {
    document.getElementById('titulo-pagina').textContent = nombreTienda;
    document.getElementById('header-titulo').textContent = `🍃 ${nombreTienda}`;
    document.getElementById('footer-titulo').textContent = `🍃 ${nombreTienda}`;
    
    // Actualizar en el resumen de pedido (se actualiza en tiempo real cuando se genera)
    const summaryElements = document.querySelectorAll('.summary-box strong');
    summaryElements.forEach(el => {
        if (el.textContent.includes('Daior')) {
            el.textContent = nombreTienda;
        }
    });
}

// Generar número de orden único
function generarNumeroOrden() {
    const nuevoNumero = `PED-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    localStorage.setItem('numero_orden', nuevoNumero);
    return nuevoNumero;
}

// NUEVO: Mostrar banner de oferta
function mostrarBannerOferta() {
    if (bannerMostrado) {
        const banner = document.getElementById('offer-banner');
        setTimeout(() => {
            banner.classList.add('show');
            // Mostrar solo por 30 segundos
            setTimeout(() => {
                cerrarBannerOferta();
            }, 30000);
        }, 2000); // Aparece después de 2 segundos
    }
}

// NUEVO: Cerrar banner de oferta
function cerrarBannerOferta() {
    const banner = document.getElementById('offer-banner');
    banner.classList.remove('show');
    localStorage.setItem('banner_oferta_mostrado', 'true');
    bannerMostrado = false;
}

// Sistema de notificaciones personalizadas
function mostrarNotificacion(titulo, mensaje, tipo = 'exito', duracion = 3000) {
    // No mostrar notificaciones en dispositivos móviles
    if (window.innerWidth <= 768) {
        return;
    }
    
    const container = document.getElementById('notificacion-container');
    const id = 'notificacion-' + Date.now();
    
    // Icono según el tipo
    let icono = '';
    switch(tipo) {
        case 'exito':
            icono = '<i class="bi bi-check-circle-fill"></i>';
            break;
        case 'error':
            icono = '<i class="bi bi-x-circle-fill"></i>';
            break;
        case 'info':
            icono = '<i class="bi bi-info-circle-fill"></i>';
            break;
        case 'advertencia':
            icono = '<i class="bi bi-exclamation-triangle-fill"></i>';
            break;
    }
    
    const notificacionHTML = `
        <div class="notificacion ${tipo}" id="${id}">
            <div class="notificacion-icono">${icono}</div>
            <div class="notificacion-contenido">
                <div class="notificacion-titulo">${titulo}</div>
                <div class="notificacion-mensaje">${mensaje}</div>
            </div>
            <button class="notificacion-close" onclick="cerrarNotificacion('${id}')">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', notificacionHTML);
    
    // Eliminar automáticamente después de la duración
    if (duracion > 0) {
        setTimeout(() => {
            cerrarNotificacion(id);
        }, duracion);
    }
    
    return id;
}

function cerrarNotificacion(id) {
    const notificacion = document.getElementById(id);
    if (notificacion) {
        notificacion.classList.add('hide');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }
}

// Cargar categorías automáticamente
function cargarCategorias() {
    const selectCategoria = document.getElementById('filtro-categoria');
    
    // Obtener categorías únicas de los productos
    const categorias = [...new Set(productos.map(p => p.categoria))];
    
    // Limpiar opciones existentes (excepto "Todos")
    selectCategoria.innerHTML = '<option value="todos">Todos los productos</option>';
    
    // Agregar cada categoría como opción
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        selectCategoria.appendChild(option);
    });
}

// Renderizar productos con ofertas
function renderizar(lista) {
    const cat = document.getElementById('catalogo');
    cat.innerHTML = '';
    
    if (lista.length === 0) {
        cat.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px;">
                <div style="font-size: 4rem; color: #ddd; margin-bottom: 20px;">
                    <i class="bi bi-search"></i>
                </div>
                <h3 style="color: #666; margin-bottom: 10px;">No se encontraron productos</h3>
                <p style="color: #999;">Intenta con otros términos de búsqueda o ajusta los filtros.</p>
            </div>
        `;
        return;
    }
    
    lista.forEach(p => {
        const tieneOferta = p.oferta && p.precioOriginal;
        const descuento = tieneOferta ? Math.round(((p.precioOriginal - p.precio) / p.precioOriginal) * 100) : 0;
        
        cat.innerHTML += `
            <div class="product-card">
                ${tieneOferta ? `<div class="offer-badge">-${descuento}%</div>` : ''}
                <img src="${p.img}" class="product-image" onclick="abrirModalProducto(${p.id})" alt="${p.nombre}">
                <div class="product-info">
                    <span style="font-size:0.7rem; color:#888; text-transform: uppercase; font-weight: bold;">${p.categoria}</span>
                    <h3 style="margin: 5px 0;">${p.nombre}</h3>
                    <div class="product-price">
                        $${p.precio.toFixed(2)}
                        ${tieneOferta ? `
                            <span class="old-price">$${p.precioOriginal.toFixed(2)}</span>
                            <span class="discount-percent">-${descuento}%</span>
                        ` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-buy-now" onclick="comprarAhora(${p.id})">
                            <i class="bi bi-bag-check"></i> Comprar
                        </button>
                        <button class="btn-add" onclick="agregarAlCarrito(${p.id})">
                            <i class="bi bi-cart-plus"></i> Agregar
                        </button>
                    </div>
                </div>
            </div>`;
    });
}

// Función Comprar Ahora
function comprarAhora(id) {
    const prod = productos.find(p => p.id === id);
    const existe = carrito.find(p => p.id === id);
    
    // Limpiar carrito y añadir solo este producto
    carrito = [];
    carrito.push({ ...prod, cantidad: 1 });
    
    guardar();
    
    // Animación del icono del carrito
    const icon = document.getElementById('cart-icon');
    icon.classList.remove('anim-bounce');
    void icon.offsetWidth;
    icon.classList.add('anim-bounce');
    
    // Remover animación después de completarse
    setTimeout(() => {
        icon.classList.remove('anim-bounce');
    }, 400);
    
    // Notificación personalizada
    mostrarNotificacion(
        '¡Compra rápida!',
        `${prod.nombre} añadido.`,
        'exito',
        1500
    );
    
    // Cerrar modal de producto si está abierto
    if (document.getElementById('modal-producto').classList.contains('active')) {
        cerrarModalProducto();
    }
    
    // Abrir resumen automáticamente después de un breve delay
    setTimeout(() => {
        abrirResumen();
    }, 800);
}

// Abrir modal de detalle del producto
function abrirModalProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    productoSeleccionadoId = id;
    
    document.getElementById('modal-img').src = producto.img;
    document.getElementById('modal-categoria').textContent = producto.categoria;
    document.getElementById('modal-nombre').textContent = producto.nombre;
    document.getElementById('modal-descripcion').textContent = producto.descripcion;
    
    // Mostrar precio con oferta si aplica
    const tieneOferta = producto.oferta && producto.precioOriginal;
    const descuento = tieneOferta ? Math.round(((producto.precioOriginal - producto.precio) / producto.precioOriginal) * 100) : 0;
    
    if (tieneOferta) {
        document.getElementById('modal-precio').innerHTML = `
            <span style="font-size: 1.8rem; color: #95a5a6; text-decoration: line-through; margin-right: 10px;">
                $${producto.precioOriginal.toFixed(2)}
            </span>
            <span style="font-size: 2rem; color: var(--color-primary);">
                $${producto.precio.toFixed(2)}
            </span>
            <span style="background: var(--color-success); color: white; padding: 5px 10px; border-radius: 10px; font-size: 1rem; margin-left: 10px;">
                -${descuento}% OFF
            </span>
        `;
    } else {
        document.getElementById('modal-precio').textContent = `$${producto.precio.toFixed(2)}`;
    }
    
    // Configurar botón de agregar
    const btnAgregar = document.getElementById('modal-btn-agregar');
    btnAgregar.onclick = function() {
        agregarAlCarrito(id);
        cerrarModalProducto();
    };
    
    // Configurar botón Comprar Ahora en modal
    const btnComprar = document.getElementById('modal-btn-comprar');
    btnComprar.onclick = function() {
        comprarAhora(id);
    };
    
    document.getElementById('modal-producto').classList.add('active');
}

// Cerrar modal de detalle del producto
function cerrarModalProducto() {
    document.getElementById('modal-producto').classList.remove('active');
    productoSeleccionadoId = null;
}

function agregarAlCarrito(id) {
    const prod = productos.find(p => p.id === id);
    const existe = carrito.find(p => p.id === id);
    
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ ...prod, cantidad: 1 });
    }
    
    // Animación del icono del carrito
    const icon = document.getElementById('cart-icon');
    icon.classList.remove('anim-bounce');
    void icon.offsetWidth;
    icon.classList.add('anim-bounce');
    
    // Remover animación después de completarse
    setTimeout(() => {
        icon.classList.remove('anim-bounce');
    }, 400);
    
    // Notificación personalizada
    mostrarNotificacion(
        'Producto agregado',
        `${prod.nombre} se agregó al carrito`,
        'exito',
        2000
    );
    
    guardar();
}

function cambiarCantidad(id, cambio) {
    const item = carrito.find(p => p.id === id);
    if (item) {
        item.cantidad += cambio;
        if (item.cantidad <= 0) {
            // Eliminar sin preguntar
            carrito = carrito.filter(p => p.id !== id);
            mostrarNotificacion(
                'Producto eliminado',
                'El producto fue eliminado del carrito',
                'error',
                1500
            );
        }
        guardar();
    }
}

// Eliminar producto sin confirmación
function eliminar(id) {
    carrito = carrito.filter(p => p.id !== id);
    guardar();
    
    mostrarNotificacion(
        'Producto eliminado',
        'El producto fue eliminado del carrito',
        'error',
        1500
    );
}

function vaciarCarrito() {
    if (carrito.length === 0) {
        // Usar SweetAlert2 para mensajes más elegantes
        Swal.fire({
            icon: 'info',
            title: 'Carrito vacío',
            text: 'El carrito ya está vacío',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });
        return;
    }
    
    // Usar SweetAlert2 para confirmación más elegante
    Swal.fire({
        title: '¿Vaciar carrito?',
        text: "¿Está seguro de vaciar todo el carrito?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#95a5a6',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar',
        customClass: {
            container: 'swal2-container',
            popup: 'swal2-popup'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            guardar();
            
            mostrarNotificacion(
                'Carrito vaciado',
                'Todos los productos fueron eliminados',
                'advertencia',
                1500
            );
        }
    });
}

function guardar() {
    localStorage.setItem('mi_carrito_web', JSON.stringify(carrito));
    actualizarUI();
}

function actualizarUI() {
    const listaUI = document.getElementById('cart-items');
    listaUI.innerHTML = '';
    
    if (carrito.length === 0) {
        listaUI.innerHTML = '<p style="text-align: center; color: #888; margin-top: 20px;">El carrito está vacío</p>';
        document.getElementById('total-price').textContent = '0.00';
        document.getElementById('cart-count').textContent = '0';
        return;
    }
    
    let total = 0, count = 0;
    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        count += item.cantidad;
        listaUI.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.nombre}</strong><br>
                    <small>$${item.precio.toFixed(2)} c/u</small>
                    <div class="qty-controls">
                        <button class="btn-qty" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                        <span style="font-weight: bold;">${item.cantidad}</span>
                        <button class="btn-qty" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <strong>$${(item.precio * item.cantidad).toFixed(2)}</strong><br>
                    <button onclick="eliminar(${item.id})" style="border:none; color:var(--color-accent); cursor:pointer; background:none; font-weight:bold; margin-top: 5px; display: flex; align-items: center; gap: 3px;">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            </div>`;
    });
    
    document.getElementById('total-price').textContent = total.toFixed(2);
    document.getElementById('cart-count').textContent = count;
}

// Orden de compra formal bien alineado
function abrirResumen() {
    if (carrito.length === 0) {
        // Usar SweetAlert2 para mensaje más elegante
        Swal.fire({
            icon: 'warning',
            title: 'Carrito vacío',
            text: 'Agrega productos antes de finalizar el pedido',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
        return;
    }
    
    const resumenBox = document.getElementById('resumen-lista');
    let total = 0;
    let subtotal = 0;
    
    const fecha = new Date().toLocaleDateString('es-VE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let html = `
        <div class="receipt-header">
            <div>
                <strong>Fecha:</strong><br>
                ${fecha}
            </div>
            <div style="text-align: right;">
                <strong>Orden #:</strong><br>
                ${numeroOrden}
            </div>
        </div>
        <div class="receipt-items">
            <div class="receipt-item" style="font-weight: bold; border-bottom: 2px solid #333;">
                <div class="item-name">PRODUCTO</div>
                <div class="item-qty">CANT</div>
                <div class="item-price">P.U.</div>
                <div class="item-total">SUBTOTAL</div>
            </div>
    `;
    
    carrito.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        subtotal += itemTotal;
        
        html += `
            <div class="receipt-item">
                <div class="item-name">${item.nombre}</div>
                <div class="item-qty">${item.cantidad}</div>
                <div class="item-price">$${item.precio.toFixed(2)}</div>
                <div class="item-total">$${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    total = subtotal;
    
    html += `
        </div>
        <div class="receipt-totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row final">
                <span>TOTAL:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 0.8rem; color: #666; border-top: 1px dashed #ccc; padding-top: 10px;">
            <strong>${nombreTienda}</strong><br>
            Caracas, Venezuela<br>
            Teléfono: +58 412-XXXXXXX<br>
            Gracias por su compra!
        </div>
    `;
    
    resumenBox.innerHTML = html;
    document.getElementById('modal-resumen').classList.add('active');
}

function cerrarResumen() { 
    document.getElementById('modal-resumen').classList.remove('active'); 
}

function toggleCart() { 
    document.getElementById('cart-sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

// FUNCIÓN RESTAURADA: Descargar orden como PNG
function descargarResumenPNG() {
    const node = document.getElementById('resumen-lista');
    
    if (!node) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo generar la orden. Inténtalo de nuevo.',
            confirmButtonColor: '#e74c3c'
        });
        return;
    }

    // Mostrar mensaje de carga
    Swal.fire({
        title: 'Generando orden...',
        text: 'Por favor espera un momento.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Opciones optimizadas para imagen PNG fiel al diseño
    const options = {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: node.offsetWidth,
        height: node.offsetHeight + 20,
        style: {
            margin: '0',
            padding: '0',
            borderRadius: '8px'
        }
    };

    // Usar la librería html-to-image para convertir a PNG
    htmlToImage.toPng(node, options)
        .then(function (dataUrl) {
            // Cerrar mensaje de carga
            Swal.close();
            
            // Crear un enlace y activar la descarga
            const link = document.createElement('a');
            link.download = `${nombreTienda.toLowerCase()}_Orden_${numeroOrden}.png`;
            link.href = dataUrl;
            link.click();
            
            // CORRECCIÓN: Notificación de éxito debe aparecer delante del modal
            // Cerrar temporalmente el modal para que SweetAlert2 aparezca encima
            document.getElementById('modal-resumen').classList.remove('active');
            
            // Mostrar notificación
            Swal.fire({
                icon: 'success',
                title: 'Orden descargada',
                text: `La imagen "${nombreTienda.toLowerCase()}_Orden_${numeroOrden}.png" se ha guardado en tu dispositivo.`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'swal2-container',
                    popup: 'swal2-popup'
                }
            }).then(() => {
                // Volver a abrir el modal después de que se cierre la notificación
                document.getElementById('modal-resumen').classList.add('active');
            });
        })
        .catch(function (error) {
            console.error('Error al generar la imagen:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar la orden. Inténtalo de nuevo.',
                confirmButtonColor: '#e74c3c'
            });
        });
}

// Función mejorada para procesar el envío a Telegram
function procesarEnvioTelegram() {
    // Cerrar primero el modal de resumen temporalmente para que SweetAlert2 aparezca encima
    document.getElementById('modal-resumen').classList.remove('active');
    
    // Usar SweetAlert2 para confirmación
    Swal.fire({
        title: '¿Ya descargaste el recibo?',
        html: `
            <div style="text-align: left; padding: 10px;">
                <p><strong>⚠️ IMPORTANTE:</strong></p>
                <p>Si ya tienes el recibo, sigue adelante.</p>
                <p>Si no, vuelve al resumen de pedido.</p>
                <p>Sin recibo no se procesará el pedido.</p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0088cc',
        cancelButtonColor: '#95a5a6',
        confirmButtonText: 'Sí, lo tengo',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        allowOutsideClick: false,
        customClass: {
            container: 'swal2-container',
            popup: 'swal2-popup'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar carrito
            carrito = [];
            // Generar nuevo número de orden para el próximo pedido
            numeroOrden = generarNumeroOrden();
            
            guardar();
            
            // Cerrar también el carrito si está abierto
            if(document.getElementById('cart-sidebar').classList.contains('active')) {
                toggleCart();
            }
            
            // Mostrar SweetAlert2 de pedido completado EN EL CENTRO
            Swal.fire({
                title: '¡Pedido Completado!',
                html: `
                    <div style="text-align: center; padding: 15px;">
                        <div style="font-size: 4rem; color: #27ae60; margin-bottom: 15px;">
                            <i class="bi bi-check-circle-fill"></i>
                        </div>
                        <h3 style="color: #2c3e50; margin-bottom: 10px;">¡Gracias por tu compra!</h3>
                        <p style="color: #666; margin-bottom: 20px;">
                            Tu pedido ha sido procesado exitosamente.<br>
                            Recuerda enviar la captura o la orden descargada a nuestro Telegram.
                        </p>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0;">
                            <p style="margin: 0; color: #2c3e50;">
                                <strong>Número de orden:</strong><br>
                                <span style="font-family: monospace; font-size: 1.2rem;">${numeroOrden}</span>
                            </p>
                        </div>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Volver a la tienda',
                confirmButtonColor: '#2c3e50',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                showCancelButton: false,
                focusConfirm: true,
                customClass: {
                    container: 'swal2-container',
                    popup: 'swal2-popup'
                }
            }).then((result) => {
                // Cuando el usuario haga clic en "Volver a la tienda"
                // Redirigir a Telegram en nueva pestaña
                window.open('https://t.me/joshgtz', '_blank');
                // La alerta se cierra automáticamente al hacer clic
            });
        } else {
            // Si el usuario cancela, mostrar recordatorio y volver a abrir el resumen
            Swal.fire({
                title: 'Recordatorio',
                html: `
                    <div style="text-align: center; padding: 10px;">
                        <div style="font-size: 3rem; color: #f39c12; margin-bottom: 10px;">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                        </div>
                        <p style="color: #666;">
                            Recuerda tomar la captura de pantalla<br>
                            o descargar la orden como imagen PNG<br>
                            <strong>antes de continuar</strong>.
                        </p>
                        <p style="color: #999; font-size: 0.9rem; margin-top: 15px;">
                            La orden desaparecerá cuando envíes el pedido.
                        </p>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#95a5a6',
                timer: 8000,
                timerProgressBar: true,
                customClass: {
                    container: 'swal2-container',
                    popup: 'swal2-popup'
                }
            }).then(() => {
                // Volver a abrir el modal de resumen
                document.getElementById('modal-resumen').classList.add('active');
            });
        }
    });
}

// FUNCIÓN MEJORADA PARA APLICAR TODOS LOS FILTROS
function aplicarFiltros() {
    const cat = document.getElementById('filtro-categoria').value;
    const precio = parseFloat(document.getElementById('filtro-precio').value);
    const busqueda = document.getElementById('filtro-busqueda').value.toLowerCase().trim();
    
    const filtrados = productos.filter(p => {
        // Filtro por categoría
        if (cat !== 'todos' && p.categoria !== cat) return false;
        
        // Filtro por precio
        if (p.precio > precio) return false;
        
        // Filtro por búsqueda (si hay texto)
        if (busqueda !== '' && !p.nombre.toLowerCase().includes(busqueda)) return false;
        
        return true;
    });
    
    renderizar(filtrados);
}

function actualizarLabelPrecio() { 
    document.getElementById('precio-valor').textContent = document.getElementById('filtro-precio').value; 
}

// Inicializar la página
function inicializarPagina() {
    // Actualizar nombre de la tienda
    actualizarNombreTienda();
    
    cargarCategorias();
    renderizar(productos);
    actualizarUI();
    
    // Mostrar banner de oferta después de cargar
    mostrarBannerOferta();
}

// Event Listeners
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (document.getElementById('modal-producto').classList.contains('active')) {
            cerrarModalProducto();
        }
        document.getElementById('cart-sidebar').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        document.getElementById('modal-resumen').classList.remove('active');
    }
});

// Cerrar modal de producto al hacer clic fuera
document.getElementById('modal-producto').addEventListener('click', function(event) {
    if (event.target === this) {
        cerrarModalProducto();
    }
});

// Inicializar la página cuando se carga el DOM
document.addEventListener('DOMContentLoaded', inicializarPagina);