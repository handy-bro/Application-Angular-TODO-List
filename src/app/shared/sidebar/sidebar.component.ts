import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private router = inject(Router);

  onAddClick() {
    const currentPath = this.router.url;
    if (currentPath.includes('todo')) {
      console.log('Ajouter une tache');

    } else if (currentPath.includes('person')) {
      console.log('Ajouter une personne');
    }
  }
}