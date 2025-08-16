import { ChangeDetectionStrategy, Component, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable, startWith } from 'rxjs';
import { TodoService } from '../../../../core/services/todo.service';
import { Todo } from '../../../../core/models/todo.model';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatInputModule, MatLabel } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuModule } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Priority } from '../../../../core/enums/priority.enum';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Label } from '../../../../core/enums/label.enum';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PersonService } from '../../../../core/services/person.service';
import { Person } from '../../../../core/models/person.model';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatDivider,
    MatMenuItem,
    MatMenu,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatLabel,
    MatAutocompleteModule,
    TranslocoModule
  ],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent implements OnInit {
  @ViewChild('addModal') addModal!: TemplateRef<any>;
  @ViewChild('detailModal') detailModal!: TemplateRef<any>;
  
  private readonly todoService = inject(TodoService);
  todos$: Observable<Todo[]> = this.todoService.todos$;
  
  displayedColumns: string[] = ['id', 'title','labels', 'completed', 'actions',];
  searchText: string = '';

  dataSource!: MatTableDataSource<Todo>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  todoForm: FormGroup;
  priorities = Object.values(Priority);
  labels = Object.values(Label);

  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private readonly personService = inject(PersonService);

  filteredPersons$!: Observable<Person[]>;
  persons: Person[] = [];

  assignedPersons$!: Observable<Person[]>;
  selectedPersonIds: number[] = [];

  isEditing = false;
  currentTodoId?: number;

  selectedPriorities: Priority[] = [];
  selectedLabels: Label[] = [];
  private originalData: Todo[] = [];

  constructor() {
    this.todoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      priority: [Priority.MEDIUM, Validators.required],
      labels: [[]],
      completed: [false],
      person: [{ id: 1, name: 'John Doe' }] 
    });

    //Ecouteur pour l'autocompletion
    this.filteredPersons$ = this.todoForm.get('person')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterPersons(name) : this.persons.slice();
      })
    );

    // Récupérer les personnes assignées uniques
    this.assignedPersons$ = this.todos$.pipe(
      map(todos => {
        const uniquePersons = new Map();
        todos.forEach(todo => {
          if (todo.person) {
            uniquePersons.set(todo.person.id, todo.person);
          }
        });
        return Array.from(uniquePersons.values());
      })
    );
  }

  ngOnInit(): void {
    this.loadTodos();
    this.todos$.subscribe(todos => {
      this.originalData = todos;
      this.dataSource = new MatTableDataSource(todos);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.setupCustomFilter();
    });

    // Charger la liste des personnes
    this.personService.persons$.subscribe(persons => {
      this.persons = persons;
    });
    this.personService.getPersons();
  }

  private loadTodos(): void {
    this.todoService.getTodos();
  }

  private _filterPersons(name: string): Person[] {
    const filterValue = name.toLowerCase();
    return this.persons.filter(person => 
      person.name.toLowerCase().includes(filterValue));
  }

  displayPersonFn(person: Person): string {
    return person && person.name ? person.name : '';
  }

  onDelete(id: number): void {
    this.todoService.deleteTodo(id).subscribe();
  }

  onUpdate(todo: Todo): void {
    this.todoService.updateTodo(todo).subscribe();
  }

  onAdd(todo: Omit<Todo, 'id'>): void {
    this.todoService.addTodo(todo as Todo).subscribe();
  }

  onComplete(todo: Todo): void {
    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
      endDate: !todo.completed ? new Date() : null
    };
    this.todoService.updateTodo(updatedTodo).subscribe();
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      console.log(`Sorted ${sortState.direction}ending`);
    } else {
      console.log('Sorting cleared');
    }
  }

  filterByPerson(personIds: number[]): void {
    this.selectedPersonIds = personIds;
    this.applyFilters();
  }

  private setupCustomFilter() {
    this.dataSource.filterPredicate = (data: Todo, filter: string) => {
      const searchStr = filter.toLowerCase();
      const matchesSearch = data.title.toLowerCase().includes(searchStr) ||
                          data.description?.toLowerCase().includes(searchStr) ||
                          data.person?.name.toLowerCase().includes(searchStr);

      const matchesPriority = this.selectedPriorities.length === 0 ||
                             this.selectedPriorities.includes(data.priority);

      const matchesLabels = this.selectedLabels.length === 0 ||
                           this.selectedLabels.some(label => data.labels.includes(label));

      const matchesPerson = this.selectedPersonIds.length === 0 ||
                           (data.person && this.selectedPersonIds.includes(data.person.id));

      return matchesSearch && matchesPriority && matchesLabels && matchesPerson;
    };
  }

  filterByPriority(priorities: Priority[]): void {
    this.selectedPriorities = priorities;
    this.applyFilters();
  }

  filterByLabels(labels: Label[]): void {
    this.selectedLabels = labels;
    this.applyFilters();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private applyFilters(): void {
    // Déclenche le filterPredicate avec la valeur de filtre actuelle
    this.dataSource.filter = this.dataSource.filter || ' ';
  }

  openAddModal(todo?: Todo): void {
    this.isEditing = !!todo;
    if (todo) {
      this.currentTodoId = todo.id;
      this.todoForm.patchValue({
        title: todo.title,
        description: todo.description,
        startDate: todo.startDate,
        endDate: todo.endDate,
        priority: todo.priority,
        labels: todo.labels,
        completed: todo.completed,
        person: todo.person
      });
    } else {
      this.currentTodoId = undefined;
      this.todoForm.reset({
        priority: Priority.MEDIUM,
        completed: false,
        startDate: new Date(),
        labels: [],
        person: null
      });
    }

    this.dialog.open(this.addModal, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: true,
      panelClass: ['custom-modal', 'mat-elevation-z8']
    });
  }

  submitTodo(): void {
    if (this.todoForm.valid) {
      const todoData = this.todoForm.value;
      
      if (this.isEditing && this.currentTodoId) {
        const updatedTodo: Todo = {
          ...todoData,
          id: this.currentTodoId
        };
        this.onUpdate(updatedTodo);
      } else {
        this.onAdd(todoData);
      }
      this.closeModal();
    }
  }

  closeModal(): void {
    this.dialog.closeAll();
    this.isEditing = false;
    this.currentTodoId = undefined;
    this.todoForm.reset({
      priority: Priority.MEDIUM,
      completed: false,
      startDate: new Date(),
      labels: [],
      person: null
    });
  }
  openDetailModal(id: number): void {
    this.todoService.getTodoById(id).subscribe({
      next: (todo) => {
        this.dialog.open(this.detailModal, {
          width: '600px',
          data: todo,
          panelClass: ['custom-modal', 'mat-elevation-z8']
        });
      },
      error: (error) => {
        console.error('Error fetching todo details:', error);
      }
    });
  }

  exportToExcel(): void {
    const dataToExport = this.dataSource.filteredData.map(todo => ({
      'ID': todo.id,
      'Titre': todo.title,
      'Description': todo.description,
      'Statut': todo.completed ? 'Terminée' : 'En cours',
      'Date de début': new Date(todo.startDate).toLocaleDateString(),
      'Date de fin': todo.endDate ? new Date(todo.endDate).toLocaleDateString() : '',
      'Priorité': todo.priority,
      'Labels': todo.labels.join(', '),
      'Assigné à': todo.person?.name
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tâches');
    
    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `liste-des-tâches-${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    
    // Titre du document
    doc.setFontSize(16);
    doc.text('Liste des tâches', 14, 15);
    
    // Date d'export
    doc.setFontSize(10);
    doc.text(`Exporté le ${new Date().toLocaleDateString()}`, 14, 22);

    const tableData = this.dataSource.filteredData.map(todo => [
      todo.id.toString(),
      todo.title,
      todo.completed ? 'Terminée' : 'En cours',
      new Date(todo.startDate).toLocaleDateString(),
      todo.priority,
      todo.labels.join(', '),
      todo.person?.name || ''
    ]);

    autoTable(doc, {
      head: [['ID', 'Titre', 'Statut', 'Date début', 'Priorité', 'Labels', 'Assigné à']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { 
        fillColor: [63, 81, 181],
        textColor: 255 
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245] 
      }
    });

    const fileName = `liste-des-tâches-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}

