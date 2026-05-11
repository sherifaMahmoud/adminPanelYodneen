import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
declare var bootstrap: any;

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  newCategory = { name: '' };
  categoryToDelete: number | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('فشل في جلب الأصناف:', err);
        this.errorMessage = 'حدث خطأ أثناء تحميل الأصناف';
        this.isLoading = false;
      },
    });
  }

  addCategory(): void {
    if (!this.newCategory.name.trim()) {
      alert('يجب إدخال اسم الصنف');
      return;
    }

    this.isLoading = true;
    this.categoryService.addCategory(this.newCategory.name).subscribe({
      next: () => {
        this.loadCategories();
        this.newCategory.name = '';
        this.isLoading = false;
      },
      error: (err) => {
        console.error('فشل في إضافة الصنف:', err);
        this.errorMessage = 'حدث خطأ أثناء إضافة الصنف';
        this.isLoading = false;
      },
    });
  }

  editCategory(category: any): void {
    const newName = prompt('تعديل اسم الصنف', category.name);
    if (newName && newName.trim()) {
      this.isLoading = true;
      this.categoryService.updateCategory(category.categoryId, newName).subscribe({ // ✅
        next: () => {
          this.loadCategories();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('فشل في تعديل الصنف:', err);
          this.errorMessage = 'حدث خطأ أثناء تعديل الصنف';
          this.isLoading = false;
        },
      });
    }
  }

  confirmDelete(id: number): void {
    this.categoryToDelete = id;
    const modalEl = document.getElementById('confirmDeleteModal');
    if (modalEl) {
      new bootstrap.Modal(modalEl).show();
    }
  }

  deleteCategory(): void {
    if (this.categoryToDelete) {
      this.isLoading = true;
      this.categoryService.deleteCategory(this.categoryToDelete).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('فشل في حذف الصنف:', err);
          // التحقق إذا كان الخطأ بسبب وجود منتجات مرتبطة
          if (err.error?.message) {
            alert(err.error.message);
          } else {
            this.errorMessage = 'حدث خطأ أثناء حذف الصنف';
          }
          this.closeModal();
          this.isLoading = false;
        },
      });
    }
  }

  closeModal(): void {
    this.categoryToDelete = null;
    const modalEl = document.getElementById('confirmDeleteModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }
  }
}
