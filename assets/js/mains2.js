        // Filtrado de productos
        document.addEventListener('DOMContentLoaded', function() {
            const filtroBtns = document.querySelectorAll('.filtro-btn');
            const productoCards = document.querySelectorAll('.producto-card');
            
            filtroBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Remover clase active de todos los botones
                    filtroBtns.forEach(b => b.classList.remove('active'));
                    // Añadir clase active al botón clickeado
                    this.classList.add('active');
                    
                    const categoria = this.dataset.categoria;
                    
                    // Filtrar productos
                    productoCards.forEach(card => {
                        if (categoria === 'todo' || card.dataset.categoria === categoria) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });
            
            // Animación de scroll suave
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 100,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });




// Función para mostrar notificación (versión corregida)
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    // Resetear todas las clases
    notification.className = 'notification';
    
    // Añadir clase según el tipo
    notification.classList.add(type);
    notificationMessage.textContent = message;
    
    // Mostrar notificación
    notification.classList.add('show');
    
    // Ocultar después de 2 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
    }, 2000);
}

// Modifica tu función addToCart o el event listener del botón:
document.querySelectorAll('.producto-btn').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.producto-card');
        const product = {
            name: card.querySelector('.producto-nombre').textContent,
            price: parseFloat(card.querySelector('.producto-precio').textContent.replace('$', '')),
            quantity: 1
        };
        
        // Verificar si el producto ya está en el carrito
        const existingItem = cart.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity += 1;
            showNotification(`${product.name} - Cantidad actualizada: ${existingItem.quantity}`);
        } else {
            cart.push(product);
            showNotification(`${product.name} agregado al pedido`);
        }
        
        // Actualizar carrito
        updateWhatsappOrderSummary();
        localStorage.setItem('taqueriaCart', JSON.stringify(cart));
        
        // Efecto visual en la tarjeta del producto
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 0 30px rgba(37, 211, 102, 0.8)';
        setTimeout(() => {
            card.style.transform = '';
            card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }, 300);
    });
});



 // Variables globales
let cart = [];
const whatsappButton = document.getElementById('whatsappButton');
const whatsappModal = document.getElementById('whatsappModal');
const closeWhatsapp = document.getElementById('closeWhatsapp');
const whatsappForm = document.getElementById('whatsappForm');
const deliveryMethod = document.getElementById('whatsapp-method');
const tableField = document.getElementById('tableField');
const orderItemsContainer = document.getElementById('whatsapp-order-items');

// Sanitizar inputs
const sanitizeInput = (str) => {
    return str.replace(/[^\w\sáéíóúñÁÉÍÓÚÑ@.,-]/gi, '').substring(0, 50);
};

 // Inicializar carrito desde localStorage
 function initCart() {
     const savedCart = localStorage.getItem('taqueriaCart');
     if (savedCart) {
         cart = JSON.parse(savedCart);
         updateWhatsappOrderSummary();
     }
 }

// Mostrar/ocultar campo de mesa
deliveryMethod.addEventListener('change', function() {
    tableField.style.display = this.value === 'Mesa' ? 'block' : 'none';
    if (this.value === 'Mesa') document.getElementById('whatsapp-table').focus();
});

// Abrir modal
whatsappButton.addEventListener('click', function() {
    if (cart.length === 0) {
        showNotification('Agrega productos al pedido primero', 'error');
        return;
    }
    whatsappModal.style.display = 'flex';
    setTimeout(() => whatsappModal.classList.add('show'), 10);
});

// Cerrar modal
closeWhatsapp.addEventListener('click', closeModal);
whatsappModal.addEventListener('click', (e) => e.target === whatsappModal && closeModal());

function closeModal() {
    whatsappModal.classList.remove('show');
    setTimeout(() => whatsappModal.style.display = 'none', 300);
}


 // Cerrar al hacer clic fuera del modal
 whatsappModal.addEventListener('click', function(e) {
     if (e.target === whatsappModal) {
         whatsappModal.classList.remove('show');
         setTimeout(() => {
             whatsappModal.style.display = 'none';
         }, 300);
     }
 });

 // Actualizar resumen del pedido en el modal
 function updateWhatsappOrderSummary() {
    orderItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p>No hay productos en tu pedido</p>';
        document.getElementById('whatsapp-order-total').textContent = '$0.00';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'whatsapp-item';
        itemElement.innerHTML = `
            <div class="item-info">
                <span>${item.name} x${item.quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
            <div class="item-actions">
                <button type="button" class="quantity-btn decrease" data-product="${item.name}">-</button>
                <button type="button" class="quantity-btn increase" data-product="${item.name}">+</button>
                <button type="button" class="delete-btn" data-product="${item.name}">×</button>
            </div>
        `;
        orderItemsContainer.appendChild(itemElement);
    });
    
    document.getElementById('whatsapp-order-total').textContent = `$${total.toFixed(2)}`;
    
    // Agregar event listeners a los nuevos botones (CORRECCIÓN CLAVE)
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            removeFromCart(this.dataset.product);
        });
    });
    
    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            decreaseQuantity(this.dataset.product);
        });
    });
    
    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const product = cart.find(item => item.name === this.dataset.product);
            if (product) {
                product.quantity += 1;
                updateWhatsappOrderSummary();
                localStorage.setItem('taqueriaCart', JSON.stringify(cart));
                showNotification(`${product.name} - Cantidad: ${product.quantity}`);
            }
        });
    });
}

// Función para disminuir cantidad (actualizada)
function decreaseQuantity(productName) {
    const product = cart.find(item => item.name === productName);
    if (!product) return;

    if (product.quantity > 1) {
        product.quantity -= 1;
        showNotification(`${productName} - Cantidad: ${product.quantity}`);
    } else {
        removeFromCart(productName);
    }
    updateWhatsappOrderSummary();
    localStorage.setItem('taqueriaCart', JSON.stringify(cart));
}

// Función para eliminar producto (actualizada)
function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    showNotification(`${productName} eliminado`, 'error');
    updateWhatsappOrderSummary();
    localStorage.setItem('taqueriaCart', JSON.stringify(cart));
}

 // Enviar pedido por WhatsApp
 whatsappForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = sanitizeInput(document.getElementById('whatsapp-name').value);
    const method = document.getElementById('whatsapp-method').value;
    const table = method === 'Mesa' ? document.getElementById('whatsapp-table').value : 'N/A';
    const notes = sanitizeInput(document.getElementById('whatsapp-notes').value);

    // Validaciones
    if (!name || !method) {
        showNotification("Completa los campos requeridos", "error");
        return;
    }
    if (method === 'Mesa' && !table) {
        showNotification("Ingresa el número de mesa", "error");
        return;
    }

    // Construir mensaje
    const itemsText = cart.map(item => 
        `➡ ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('%0A');

    const message = `*PEDIDO - EL BOTUDO*%0A%0A` +
                   `*👤 Cliente:* ${encodeURIComponent(name)}%0A` +
                   `${method === 'Mesa' ? `🪑 *Mesa:* ${table}` : '🥡 *Para llevar*'}%0A%0A` +
                   `*🍽️ Pedido:*%0A${itemsText}%0A%0A` +
                   `*💰 Total:* $${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}%0A` +
                   `*📝 Notas:* ${encodeURIComponent(notes || 'Ninguna')}`;

     
     // Abrir WhatsApp con el mensaje
  window.open(`https://wa.me/527774174021?text=${message}`, '_blank');
     
     // Cerrar el modal
     whatsappModal.classList.remove('show');
     setTimeout(() => {
         whatsappModal.style.display = 'none';
     }, 300);
     
    // Resetear
    closeModal();
    cart = [];
    localStorage.removeItem('taqueriaCart');
    updateWhatsappOrderSummary();
    showNotification("Pedido enviado con éxito", "success");
});

 // Inicializar
 initCart();