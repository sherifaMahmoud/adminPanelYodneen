import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { CategoryService } from '../../services/category.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

declare var bootstrap: any;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  productToDelete: number | null = null;
  errorMessage: string = '';
  formErrors: any = {};

  categories: any[] = [];

  newProduct = {
    productId: 0,
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    categoryId: 0,
    categoryName: '',
    color: '',
    fabric: '',
    size: '',
    stockQuantity: 0,
    isActive: true,
    offers: [] as any[],
  };

  // كائن مؤقت لإضافة عرض جديد
  newOffer = {
    offerId: 0,
    productId: 0,
    discount: 0,
    startDate: '',
    endDate: '',
    isGeneralOffer: false,
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private http: HttpClient,
    private route: ActivatedRoute,

  ) {}

ngOnInit(): void {
  // ✅ استلام التوكن من الرابط وتخزينه
  this.route.queryParams.subscribe(params => {
    const token = params['token'];
    if (token) {
      console.log('Token from URL:', token);
      localStorage.setItem('token', token);
    }
  });

  this.loadProducts();
  this.loadCategories();
}

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...this.products];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.errorMessage = 'حدث خطأ أثناء تحميل المنتجات';
        this.isLoading = false;
      },
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.errorMessage = 'حدث خطأ أثناء تحميل الأصناف';
      },
    });
  }

  filterProducts() {
    if (!this.searchTerm) {
      this.filteredProducts = [...this.products];
      return;
    }

    const search = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(
      (product) =>
        (product.name && product.name.toLowerCase().includes(search)) ||
        (product.description &&
          product.description.toLowerCase().includes(search))
    );
  }

  openAddProductModal() {
    this.resetForm();
    const modalElement = document.getElementById('addProductModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // إضافة عرض جديد للمنتج
  addOffer() {
    if (this.newOffer.discount <= 0) {
      this.formErrors.offerDiscount = 'نسبة الخصم يجب أن تكون أكبر من الصفر';
      return;
    }
    if (!this.newOffer.startDate || !this.newOffer.endDate) {
      this.formErrors.offerDates = 'تاريخ البداية والنهاية مطلوبان';
      return;
    }

    this.newProduct.offers.push({ ...this.newOffer });
    this.resetNewOffer();
  }

  // إزالة عرض من القايمة
  removeOffer(index: number) {
    this.newProduct.offers.splice(index, 1);
  }

  // إعادة تعيين كائن العرض
  resetNewOffer() {
    this.newOffer = {
      offerId: 0,
      productId: 0,
      discount: 0,
      startDate: '',
      endDate: '',
      isGeneralOffer: false,
    };
    this.formErrors.offerDiscount = '';
    this.formErrors.offerDates = '';
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.newProduct.name || this.newProduct.name.trim() === '') {
      this.formErrors.name = 'اسم المنتج مطلوب';
      isValid = false;
    }

    if (this.newProduct.price <= 0) {
      this.formErrors.price = 'السعر يجب أن يكون أكبر من الصفر';
      isValid = false;
    }

    if (this.newProduct.stockQuantity < 0) {
      this.formErrors.stockQuantity = 'الكمية يجب أن تكون عدد صحيح موجب';
      isValid = false;
    }

    if (!this.newProduct.categoryId || this.newProduct.categoryId <= 0) {
      this.formErrors.categoryId = 'الفئة مطلوبة';
      isValid = false;
    }

    if (!this.newProduct.imageUrl || this.newProduct.imageUrl.trim() === '') {
      this.formErrors.imageUrl = 'رابط الصورة مطلوب';
      isValid = false;
    }

    return isValid;
  }

  addProduct() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'لم يتم العثور على توكن تسجيل الدخول.';
      this.isLoading = false;
      return;
    }

    const selectedCategory = this.categories.find(
      (cat) => cat.categoryId === this.newProduct.categoryId
    );

    const productData = {
      name: this.newProduct.name,
      description: this.newProduct.description || '',
      price: this.newProduct.price,
      categoryId: this.newProduct.categoryId,
      categoryName: selectedCategory ? selectedCategory.name : '',
      color: this.newProduct.color || '',
      fabric: this.newProduct.fabric || '',
      size: this.newProduct.size || '',
      stockQuantity: this.newProduct.stockQuantity,
      isActive: this.newProduct.isActive,
      imageUrl: this.newProduct.imageUrl,
      offers: this.newProduct.offers
    };

    this.http.post(`${environment.apiUrl}/api/Products`, productData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    }).subscribe({
      next: () => {
        this.loadProducts();
        this.closeModal();
        this.resetForm();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('فشل إضافة المنتج:', err);
        this.errorMessage = err.error?.message || 'حدث خطأ أثناء إضافة المنتج';
        this.isLoading = false;
      }
    });
  }

  openDeleteConfirmModal(productId: number) {
    this.productToDelete = productId;
    const modalElement = document.getElementById('confirmDeleteModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete() {

    if (!this.productToDelete) return;

    this.isLoading = true;

    this.http.delete(
      `${environment.apiUrl}/api/Products/${this.productToDelete}`,
      {
        responseType: 'text'
      }
    ).subscribe({

      next: () => {

        this.isLoading = false;

        this.errorMessage = '';

        this.products = this.products.filter(
          p => p.productId !== this.productToDelete
        );

        this.filteredProducts = this.filteredProducts.filter(
          p => p.productId !== this.productToDelete
        );

        this.closeDeleteModal();
      },

      error: (err) => {

        this.isLoading = false;

        console.log(err);

        // الرسالة اللي جاية من الـ backend
        const message = err?.error || '';

        if (
          message.includes('related orders') ||
          message.includes('related carts') ||
          message.includes('related offers')
        ) {

          this.errorMessage =
            'لا يمكن حذف المنتج لأنه مرتبط بطلبات أو عروض حالية';

        } else {

          this.errorMessage =
            'حدث خطأ أثناء حذف المنتج';
        }

        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.productToDelete = null;
    const modalElement = document.getElementById('confirmDeleteModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  resetForm() {
    this.newProduct = {
      productId: 0,
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      categoryId: 0,
      categoryName: '',
      color: '',
      fabric: '',
      size: '',
      stockQuantity: 0,
      isActive: true,
      offers: [],
    };
    this.resetNewOffer();
    this.formErrors = {};
  }

  closeModal() {
    const modalElement = document.getElementById('addProductModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }
}
