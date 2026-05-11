import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:5095/api/Categories';
  private http = inject(HttpClient);

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addCategory(name: string): Observable<any> {
    return this.http.post(this.apiUrl, { name: name });
  }

  updateCategory(id: number, newName: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { name: newName });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
