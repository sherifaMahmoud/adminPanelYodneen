import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = 'http://localhost:5095/api/Offers'; // URL الخاص بـ API العروض

  constructor(private http: HttpClient) {}

  // جلب العروض
  getOffers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // إضافة عرض جديد
  addOffer(offer: any): Observable<any> {
    return this.http.post(this.apiUrl, offer);
  }

  // حذف عرض
  deleteOffer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
