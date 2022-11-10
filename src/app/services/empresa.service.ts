import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Empresa } from '../models/empresa';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  resourceUrl: string;
  constructor(private httpClient: HttpClient) {
    this.resourceUrl = 'https://pav2.azurewebsites.net/api/empresas';
  }

  get(Nombre: string, Activo: boolean, Pagina: number) {
    let params = new HttpParams();
    if (Nombre != null) {
      params = params.append('Nombre', Nombre);
    }
    if (Activo != null) {
      params = params.append('Activo', Activo.toString());
    }
    params = params.append('Pagina', Pagina.toString());
    return this.httpClient.get(this.resourceUrl, { params: params });
  }

  getAll() {
    return this.httpClient.get(this.resourceUrl);
  }

  getById(Id: number) {
    return this.httpClient.get(this.resourceUrl + Id);
  }

  post(obj: Empresa) {
    return this.httpClient.post(this.resourceUrl, obj);
  }

  put(Id: number, obj: Empresa) {
    return this.httpClient.put(this.resourceUrl + Id, obj);
  }

  delete(Id) {
    return this.httpClient.delete(this.resourceUrl + Id);
  }
}
