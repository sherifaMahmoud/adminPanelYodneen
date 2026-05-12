import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { OfferService } from '../../services/offer.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
})
export class OffersComponent implements OnInit {
  offers: any[] = [];
  products: any[] = []; // قائمة المنتجات
  newOffer = {
    offerId: 0,
    productId: 0,
    discount: 0,
    startDate: new Date(),
    endDate: new Date(),
    isGeneralOffer: true,
  };
  private modalRef?: NgbModalRef;

  constructor(
    private offerService: OfferService,
    private modalService: NgbModal,
    private productService: ProductService // خدمة المنتجات
  ) {}

  ngOnInit(): void {
    this.getOffers();
    this.getProducts(); // جلب المنتجات عند تحميل الصفحة
  }

  // فتح المودال
  openModal(content: TemplateRef<any>): void {
    this.modalRef = this.modalService.open(content);
  }

  // جلب العروض
  getOffers(): void {
    this.offerService.getOffers().subscribe({
      next: (data) => (this.offers = data),
      error: (error) => console.error('فشل في تحميل العروض', error),
    });
  }

  // جلب المنتجات
  getProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => (this.products = data),
      error: (error) => console.error('فشل في تحميل المنتجات', error),
    });
  }

  // إضافة عرض جديد
  addOffer(): void {
    console.log('دالة إضافة العرض تم استدعاؤها');
    const offer = {
      ...this.newOffer,
      offerId: 0, // سيقوم الخادم بإعطاء معرف العرض
      createdAt: new Date(), // يمكن إضافة حقل `createdAt` إذا كان جزء من السكيما
    };

    this.offerService.addOffer(offer).subscribe({
      next: (savedOffer) => {
        console.log('تم إضافة العرض بنجاح', savedOffer);
        this.offers.push(savedOffer);
        this.resetForm();
        this.modalRef?.close();
      },
      error: (error) => {
        console.error('فشل في إضافة العرض', error);
      },
    });
  }

  // حذف عرض
  deleteOffer(id: number): void {
    this.offerService.deleteOffer(id).subscribe({
      next: () => (this.offers = this.offers.filter((o) => o.offerId !== id)),
      error: (error) => console.error('فشل في حذف العرض', error),
    });
  }

  // إعادة تعيين النموذج
  private resetForm(): void {
    this.newOffer = {
      offerId: 0,
      productId: 0,
      discount: 0,
      startDate: new Date(),
      endDate: new Date(),
      isGeneralOffer: true,
    };
  }
  getProductName(productId: number): string {

    const product = this.products.find(
      p => p.productId === productId
    );

    return product ? product.name : 'منتج';
  }
}
