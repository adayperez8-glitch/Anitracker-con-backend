- AniTracker
Mi app para trackear los animes que veo. Puedo buscar series, ver sus detalles y llevar el control de en qué capítulo voy con cada una.
Stack
React 18 + Vite · React Router v6 · Context API · CSS Modules · Jikan API

Necesitas crear un .env en la raíz del proyecto (ver .env.example como referencia):
VITE_LOGIN_USERNAME=tu_nombre (aquí van mis credenciales)
VITE_LOGIN_PASSWORD=tu_password
VITE_LOGIN_USERNAME_2=segundo_usuario (aquí van las credenciales de Jarko)
VITE_LOGIN_PASSWORD_2=segunda_password

Lo que he ido haciendo cada día
Día 1 — Setup, routing y navbar
El primer día me centré en montar la estructura base. Configuré el proyecto con Vite, instalé React Router y monté todas las rutas. También hice el login con ruta protegida — si no estás autenticado te redirige a /login. Las credenciales las guardé en variables de entorno para que no se suban a GitHub. La navbar tiene un efecto cristal que se va degradando hacia abajo, con menú hamburguesa para móvil. El tema visual es blanco con lavanda y azul (Inspirado en Frieren).
Día 2 — API, HomePage y componentes
Conecté la API de Jikan (MyAnimeList) usando un Context para centralizar todas las llamadas. La HomePage carga los animes más populares con filtros y paginación. Mientras cargan los datos se muestran skeleton cards animadas en vez de un spinner. Las cards tienen efecto hover y muestran el score, los episodios y el año.
Día 3 — SearchPage with pagination, AnimeDetailPage, WatchlistContext, MyListPage, tracking de capítulos, tests y custom hooks.
-Implementé el buscador con formulario controlado, resultados paginados y mensajes de error cuando no hay resultados. Al hacer clic en cualquier card se navega al detalle del anime, que carga por el ID de la URL con useParams. La página de detalle muestra el póster, título, géneros, sinopsis, estudio, rating, duración y clasificación. Ambas páginas tienen estado de carga y manejo de errores.

-Creé el WatchlistContext para gestionar la lista personal de animes con persistencia en localStorage — la lista sobrevive al recargar la página. Desde el detalle de cada anime puedo añadirlo a mi lista, controlar en qué capítulo voy con botones + / − y cambiar el estado (Viendo, Completado, Pausado, Pendiente). En MyListPage hay filtros por estado y una barra de progreso visual por cada anime. El badge de la navbar muestra cuántos animes tengo en la lista en tiempo real. También añadí un selector de wallpapers en la navbar con fondos de Naruto, Attack on Titan, Demon Slayer, One Piece, Jujutsu Kaisen y Berserk — tuve que buscar y verificar los enlaces manualmente porque los que me dió la IA no cargaban.

-Añadí los tests unitarios con Vitest y Testing Library — 7 tests que cubren el WatchlistContext (vacío, añadir/eliminar, sin duplicados), el AnimeContext (búsqueda exitosa y manejo de error) y el componente AnimeCard (renderiza título, score y episodios). También extraje la lógica de la API en un custom hook useAnimeSearch para reutilización. Tuve que ajustar la configuración de Vitest porque la carpeta de tests tenía un nombre distinto al que esperaba el setup.

Día 4 — Implementé también el calendario de emisión semanal — muestra los animes que emiten cada día, resalta el día actual y cachea los resultados. Tuve que añadir un filtro de duplicados porque la API devuelve a veces el mismo anime varias veces.

Día 5 — próximo

⏱️ Tiempo que me ha llevado cada parte
Diseño — decidir tema, colores, estructura y poderes del login -30 min
Setup del proyecto y estructura de carpetas -1h 20 min
Login page — formulario, validación y estilos -2h 45 min
AuthContext — dos usuarios, sessionStorage y variables de entorno -1h 20 min
Navbar — efecto cristal, degradado y menú hamburguesa -1 h45 min
CSS global — variables de color y tema blanco/lavanda -1 h30 min
AnimeContext — integración con la API de Jikan -1h 25 min
HomePage — filtros, grid y paginación -1h 20 min
AnimeCard, SkeletonCard y Grid -50 min
SearchPage — formulario, resultados y paginación -20 min
AnimeDetailPage — detalle por ID, stats y sinopsis -50 min
WatchlistContext, MyListPage, wallpapers y badge -45 min
Tests, custom hook y configuración de Vitest -50 min
Resolución de errores e iteraciones -50 min
CalendarPage y ajustes visuales finales — 1h
Total: ~16h 30min

Seguridad
Las credenciales del login están en .env que está en .gitignore — nunca se sube a GitHub. La API de Jikan es pública y no necesita clave, así que no hay nada sensible en las llamadas a la API. Solo subo .env.example como referencia para que se sepa qué variables hay que configurar.

Uso de IA
Usé la IA de Claude durante los 5 días de desarrollo como apoyo técnico. Aquí detallo exactamente qué hice con ella y qué no:
Lo que generó la IA:

La estructura base de AuthContext, AnimeContext y WatchlistContext
Los componentes AnimeCard, SkeletonCard, Grid, ProtectedRoute y ErrorBoundary
Las páginas LoginPage, HomePage, SearchPage, AnimeDetailPage y MyListPage
Los tests unitarios con Vitest y Testing Library
El custom hook useAnimeSearch

Lo que tuve que hacer yo aunque la IA generase el código:

Copiar cada archivo manualmente en VS Code, entender su estructura y pegarlo en el sitio correcto
Detectar que el global.css no se había aplicado porque seguía el original de Vite
Identificar que el menú hamburguesa desaparecía por el mask-image del header y describírselo a la IA para que lo resolviera
Buscar y verificar manualmente los wallpapers de anime porque los enlaces que me dio la IA estaban bloqueados o caídos
Darme cuenta de que el array de wallpapers tenía duplicados por tener los imports y las URLs al mismo tiempo
Detectar que la carpeta de tests se llamaba tests en vez de __test__ y que por eso el setup no encontraba los archivos
Decidir la temática, los colores, el efecto cristal de la navbar, los poderes del login y la feature de progreso por capítulos
Identificar que el calendario mostraba los mismos animes todos los días y describir el problema para buscar una solución
Hacer todos los commits diarios y gestionar el repositorio en GitHub

Lo que aprendí en el proceso:
Trabajar con IA no significa que el código funcione solo. Cada error que apareció lo tuve que identificar yo, describir con precisión y entender la solución para poder aplicarla. Si no hubiese entendido lo que estaba haciendo no habría podido avanzar.

Link del deploy: https://anitracker-xi.vercel.app/login

