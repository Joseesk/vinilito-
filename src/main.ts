import './shared/estilos/tokens.css';
import './shared/estilos/base.css';
import { iniciarEscena } from './features/escena';
import { iniciarFicha } from './features/ficha';
import { iniciarVinilo } from './features/vinilo';
import { obtenerElemento } from './shared/utils';

const app = obtenerElemento('#app');
iniciarEscena(app);
iniciarVinilo(app);
iniciarFicha(app);
