import { ChangeDetectionStrategy, Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, first, map, Observable, of, switchMap } from 'rxjs';
import { PersonService } from '../../../../core/services/person.service';
import { Person } from '../../../../core/models/person.model';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuModule } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    MatDivider,
    MatMenuItem,
    MatMenu,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslocoModule
  ],
  templateUrl: './person-list.component.html',
  styleUrl: './person-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonListComponent implements OnInit {
  @ViewChild('addPersonModal') addPersonModal!: TemplateRef<any>;
  
  personForm: FormGroup;
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private readonly personService = inject(PersonService);
  private translocoService = inject(TranslocoService);
  persons$: Observable<Person[]> = this.personService.persons$;
  
  displayedColumns: string[] = ['id', 'name', 'email', 'actions'];
  searchText: string = '';

  dataSource!: MatTableDataSource<Person>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  isEditing: boolean = false;
  currentPersonId?: number;

  private nameExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Si on est en mode édition et que le nom n'a pas changé, on ignore la validation
      if (this.isEditing && control.value === this.personForm?.get('name')?.value) {
        return of(null);
      }
      return of(control.value).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(name => 
          this.personService.checkNameExists(name)
        ),
        map(exists => exists ? { nameExists: true } : null),
        first()
      );
    };
  }

  constructor() {
    this.personForm = this.fb.group({
      name: ['',
        {
          validators: [Validators.required, Validators.minLength(3)],
          asyncValidators: [this.nameExistsValidator()],
          updateOn: 'blur'
        }
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadPersons();
    this.persons$.subscribe(persons => {
      this.dataSource = new MatTableDataSource(persons);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  private loadPersons(): void {
    this.personService.getPersons();
  }

  onDelete(id: number): void {
    this.personService.deletePerson(id).subscribe();
  }

  onUpdate(person: Person): void {
    this.personService.updatePerson(person).subscribe({
      next: () => {
        // Optionnel : Ajoutez ici une notification de succès
        console.log('Personne mise à jour avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        // Optionnel : Ajoutez ici une gestion d'erreur
      }
    });
  }

  onAdd(person: Omit<Person, 'id'>): void {
    this.personService.addPerson(person as Person).subscribe();
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      console.log(`Sorted ${sortState.direction}ending`);
    } else {
      console.log('Sorting cleared');
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddModal(person?: Person): void {
    this.isEditing = !!person;

    if (person) {
      this.currentPersonId = person.id;
      this.personForm.patchValue({
        name: person.name,
        email: person.email,
        phone: person.phone
      });
    } else {
      this.currentPersonId = undefined;
      this.personForm.reset();
    }

    this.dialog.open(this.addPersonModal, {
      width: '600px',
      disableClose: true,
      autoFocus: true,
      panelClass: ['custom-modal', 'mat-elevation-z8']
  });
}

  closeModal(): void {
    this.dialog.closeAll();
    this.personForm.reset();
    this.isEditing = false;
    this.currentPersonId = undefined;
  }

  submitPerson(): void {
    if (this.personForm.valid) {
      const personData = this.personForm.value;
      
      if (this.isEditing && this.currentPersonId) {
        const updatedPerson: Person = {
          ...personData,
          id: this.currentPersonId
        };
        this.onUpdate(updatedPerson);
      } else {
        this.onAdd(personData);
      }
      
      this.closeModal();
    }
  }
}
