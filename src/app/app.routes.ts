import { Routes } from '@angular/router';
import { ListarConvocatoriasComponent } from './pages/listar-convocatorias/listar-convocatorias.component';

export const routes: Routes = [
    { path: '', redirectTo: 'convocatorias', pathMatch: 'full' },
    { path: 'convocatorias', component: ListarConvocatoriasComponent },
    { path: '**', redirectTo: 'convocatorias' }
];
