import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Contratacion } from '../models/contratacion';

@Injectable({
  providedIn: 'root'
})
export class ContratacionService {
  path = environment.apiUrl + '/contrataciones';
  constructor(private http: HttpClient) { }
  getContrataciones() {
    return this.http.get<Contratacion[]>(this.path + "/current");
  }
  
}
