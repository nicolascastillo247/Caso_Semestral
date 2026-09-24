MÓDULO CLIENTE - CHIBSON INSTRUMENTS

Esta carpeta contiene solamente el módulo Cliente.

DISEÑO
- Bootstrap 5.3.3
- Poppins e Inter, igual que el código del compañero
- Mismo archivo miestilo.css como base
- Misma paleta visual
- "Catálogo" aparece en el menú solo como referencia visual

FUNCIONAMIENTO REVISADO
- Guitarra y teclado pueden agregarse al carro.
- Es posible tener ambos productos al mismo tiempo.
- Las cantidades se actualizan entre 1 y 10.
- Subtotal, despacho y total se recalculan automáticamente.
- El botón Eliminar funciona.
- El checkout mantiene todos los productos y cantidades.
- Volver desde checkout no pierde el contenido del carro.
- Al confirmar una compra se genera un pedido nuevo.
- El pedido nuevo aparece en Mis pedidos.
- Los pedidos históricos tienen estados e historiales coherentes.
- La devolución se ofrece para el pedido entregado.
- La reseña corresponde al producto entregado.
- Los tickets nuevos aparecen en Mis tickets.
- Mi Perfil permite actualizar datos y dirección.
- El RUT acepta formato con o sin puntos y guion y valida el dígito verificador.
- La contraseña exige mínimo 8 caracteres, una letra y un número, y debe coincidir con la confirmación.

NOTA
El módulo usa sessionStorage/localStorage únicamente para simular datos mientras
no exista un backend o una base de datos.
