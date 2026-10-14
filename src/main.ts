import './shared/estilos/tokens.css';
import './shared/estilos/base.css';
import { iniciarEscena } from './features/escena';
import { obtenerElemento } from './shared/utils';

iniciarEscena(obtenerElemento('#app'));
