import './shared/estilos/tokens.css';
import './shared/estilos/base.css';
import { iniciarEscena } from './features/escena';
import { iniciarEscena3d } from './features/escena3d';
import { iniciarFicha } from './features/ficha';
import { iniciarMusica } from './features/musica';
import { iniciarVinilo } from './features/vinilo';
import { obtenerElemento } from './shared/utils';

const app = obtenerElemento('#app');
iniciarEscena(app);
iniciarVinilo(app);
iniciarFicha(app);
iniciarMusica();
iniciarEscena3d(app);
