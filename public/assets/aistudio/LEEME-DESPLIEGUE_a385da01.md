# COFFEA
Código fuente de la carta, pedidos, cotización, inventario y comandas.

Para un dominio propio, configura Cloudflare Workers y una base D1 con binding DB. Aplica los SQL de drizzle/ a D1 y revisa vite.config.ts y worker/index.ts para adaptar la configuración de despliegue. El proyecto actual usa Vinext. Instala dependencias con npm ci.

La autenticación del panel actual depende del proveedor de Sites. Antes de exponer el panel en otro dominio, reemplaza el inicio y cierre de sesión y la función role() de lib/operations.ts por una integración que valide la identidad en el servidor. No confíes en cabeceras enviadas directamente por el navegador. Configura la cuenta de administración y los roles de caja y cocina.

El ZIP contiene el esquema y el catálogo, no los datos de la base de producción. La pasarela de pago sigue pendiente.
