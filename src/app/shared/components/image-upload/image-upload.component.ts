import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService, PrimeIcons } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProductsService } from '../../../core/services/d-products/products.service';

export interface ProductImage {
  id: string | number;
  product_id: number;
  image: string;
  thumb: string;
  medium: string;
  order_view: number;
  is_main: boolean;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
  @Input() initialImages: ProductImage[] = [];
  @Input() singleImageMode = false;
  @Input() id = 'default';
  @Output() imagesChanged = new EventEmitter<{ added: File[], removed: string[] }>();
  isDeleting: { [key: string]: boolean } = {};
  images: ProductImage[] = [];
  isDragging = false;
  isLoading = false;
  InputId = '';
  private removedUrls: Set<string> = new Set();
  private addedFiles: File[] = [];

  constructor(
    private productsService: ProductsService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.InputId = `file-input-${this.id}`;
    this.images = [...this.initialImages];
    this.emitChanges();
    console.log('ngOnInit initialImages:', this.initialImages);
  }

  async removeImage(index: number) {
    const visibleImages = this.getVisibleImages();
    const imageToRemove = visibleImages[index];
    
    this.isDeleting[imageToRemove.id.toString()] = true;
    
    try {
      if (!imageToRemove.created_at) {
        // New image
        this.images = this.images.filter(img => img.id !== imageToRemove.id);
        const fileIndex = this.addedFiles.findIndex(file => file.name === imageToRemove.image);
        if (fileIndex !== -1) {
          this.addedFiles.splice(fileIndex, 1);
        }
      } else {
        // Existing image - use the API-provided ID directly
        await this.productsService.removeImage(imageToRemove.id.toString()).toPromise();
        
        // Mark as deleted locally
        const imageIndex = this.images.findIndex(img => img.id === imageToRemove.id);
        if (imageIndex !== -1) {
          this.images[imageIndex].active_status = false;
          this.removedUrls.add(imageToRemove.image);
        }
      }
      
      this.emitChanges();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete image'
      });
    } finally {
      delete this.isDeleting[imageToRemove.id.toString()];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialImages'] && changes['initialImages'].currentValue) {
      this.images = [...changes['initialImages'].currentValue];
      this.emitChanges();
      console.log('ngOnChanges initialImages:', this.initialImages);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
      input.value = '';
    }
  }

  handleFiles(fileList: FileList) {
    const files = Array.from(fileList).filter(file => file.type.startsWith('image/'));
    
    if (files.length === 0) return;

    if (this.singleImageMode) {
      this.images.forEach(img => {
        if (img.active_status && img.image) {
          img.active_status = false;
          this.removedUrls.add(img.image);
        }
      });
      
      this.images = this.images.filter(img => !img.created_at);
      this.addedFiles = [];
      
      const file = files[0];
      this.addImageFile(file);
    } else {
      files.forEach(file => this.addImageFile(file));
    }

    this.emitChanges();
  }

  addImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const newImage: ProductImage = {
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        product_id: 0,
        image: e.target?.result as string,
        thumb: e.target?.result as string,
        medium: e.target?.result as string,
        order_view: this.images.length + 1,
        is_main: this.images.length === 0,
        active_status: true,
        created_at: '',
        updated_at: ''
      };
      
      this.images.push(newImage);
      this.addedFiles.push(file);
      
      this.emitChanges();
    };
    reader.readAsDataURL(file);
  }

  emitChanges() {
    const removed = Array.from(this.removedUrls);
    
    this.imagesChanged.emit({ 
      added: [...this.addedFiles], 
      removed: removed
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getVisibleImages(): ProductImage[] {
    return this.images.filter(img => img.active_status);
  }
}