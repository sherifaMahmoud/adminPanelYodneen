import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { CategoryService } from '../../services/category.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

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
    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('Name', this.newProduct.name);
    formData.append('Description', this.newProduct.description || '');
    formData.append('Price', this.newProduct.price.toString());
    formData.append('CategoryId', this.newProduct.categoryId.toString());
    const selectedCategory = this.categories.find(
      (cat) => cat.id === this.newProduct.categoryId
    );
    formData.append(
      'CategoryName',
      selectedCategory ? selectedCategory.name : ''
    );
    formData.append('Color', this.newProduct.color || '');
    formData.append('Fabric', this.newProduct.fabric || '');
    formData.append('Size', this.newProduct.size || '');
    formData.append('StockQuantity', this.newProduct.stockQuantity.toString());
    formData.append('IsActive', this.newProduct.isActive.toString());
    formData.append('ImageUrl', this.newProduct.imageUrl);
    formData.append(
      'Offers',
      JSON.stringify(
        this.newProduct.offers.map((offer) => ({
          offerId: offer.offerId,
          productId: offer.productId,
          discount: offer.discount,
          startDate: new Date(offer.startDate).toISOString(),
          endDate: new Date(offer.endDate).toISOString(),
          isGeneralOffer: offer.isGeneralOffer,
        }))
      )
    );

    this.isLoading = true;

    const token = localStorage.getItem('token');
    console.log('JWT Token being sent:', token);
    if (!token) {
      this.errorMessage =
        'لم يتم العثور على توكن تسجيل الدخول. برجاء تسجيل الدخول مرة أخرى.';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.productService.addProduct(formData, headers).subscribe({
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
      },
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
    if (this.productToDelete) {
      this.isLoading = true;
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        this.errorMessage =
          'لم يتم العثور على توكن تسجيل الدخول. برجاء تسجيل الدخول مرة أخرى.';
        this.isLoading = false;
        return;
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      this.productService
        .deleteProduct(this.productToDelete, headers)
        .subscribe({
          next: () => {
            this.loadProducts();
            this.closeDeleteModal();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Failed to delete product:', err);
            this.errorMessage = 'حدث خطأ أثناء حذف المنتج';
            this.closeDeleteModal();
            this.isLoading = false;
          },
        });
    }
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
