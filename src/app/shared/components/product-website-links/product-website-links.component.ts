import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, inject } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-product-website-links',
  standalone: true,
  imports: [CommonModule, QRCodeModule],
  templateUrl: './product-website-links.component.html',
  styleUrl: './product-website-links.component.scss',
})
export class ProductWebsiteLinksComponent {
  private elementRef = inject(ElementRef);

  @Input() enUrl: string = '';
  @Input() arUrl: string = '';
  @Input() isSpecial: boolean = false;
  @Input() itemType: string = 'Product'; // 'Product' | 'Category' | 'Sub Category'
  @Input() filePrefix: string = '';
  @Input() title?: string;
  @Input() badgeText?: string;

  copiedLang: 'en' | 'ar' | null = null;

  get displayTitle(): string {
    return this.title || `Website ${this.itemType} URLs & QR Codes`;
  }

  get displayBadge(): string {
    return this.badgeText || `Special ${this.itemType}`;
  }

  copyToClipboard(url: string, lang: 'en' | 'ar'): void {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.copiedLang = lang;
      setTimeout(() => {
        if (this.copiedLang === lang) {
          this.copiedLang = null;
        }
      }, 2000);
    });
  }

  downloadQRCode(lang: 'en' | 'ar'): void {
    const selector = lang === 'en' ? '.qr-preview-en' : '.qr-preview-ar';
    const container = this.elementRef.nativeElement.querySelector(selector);
    if (!container) return;
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      const baseName = this.filePrefix || `${this.itemType.toLowerCase().replace(/\s+/g, '-')}`;
      link.download = `${baseName}-${lang}-qrcode.png`;
      link.click();
    }
  }
}
