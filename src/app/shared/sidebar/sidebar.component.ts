import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatMenuModule, TranslocoModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly translocoService = inject(TranslocoService);
  activeLang = this.translocoService.getActiveLang();

  constructor() {
    const storedLang = localStorage.getItem('preferredLanguage');
    if (storedLang) {
      this.setLanguage(storedLang);
    }
    this.translocoService.langChanges$.subscribe(lang => {
      this.activeLang = lang;
    });
  }

  setLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
    localStorage.setItem('preferredLanguage', lang);
    this.activeLang = lang;
  }
}