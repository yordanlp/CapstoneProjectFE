import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PcaParameters, LatentEdit } from '../models/PcaParameters';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient) { }
  

  getImage( id: string ): Observable<{id: string, image: Blob}> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    const body = { id: id }
    return this.http.post('http://localhost:5000/image', body, { responseType: 'blob', headers })
    .pipe(
      map(data => {
      return {
        id: id.split('.')[0],
        image: data
      }
    }));
  }

  getPCA( id: string ) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    const body = { id: id }
    return this.http.post('http://localhost:5000/pca', body, { responseType: 'blob', headers });
  }

  runPca( params: PcaParameters ) {
    return this.http.post('http://localhost:5000/run_pca', params);
  }

  getImagesIds(): Observable<string[]>{
    return this.http.get<string[]>('http://localhost:5000/images_ids');
  }

}
