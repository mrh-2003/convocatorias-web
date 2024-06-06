import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Convocado } from '../models/convocado';

@Injectable({
  providedIn: 'root'
})
export class ConvocadoService {
  path = environment.apiUrl + '/convocados';
  constructor(private http: HttpClient) { }
  createConvocado(convocado: Convocado) {
    return this.http.post<Convocado>(this.path, convocado);
  }
  addConvocadoDocument(documento: FormData) {
    return this.http.post(this.path + '/upload', documento);
  }
}
