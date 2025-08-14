import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PersonService } from '../../../../core/services/person.service';
import { Person } from '../../../../core/models/person.model';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './person-list.component.html',
  styleUrl: './person-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonListComponent implements OnInit {
  private readonly personService = inject(PersonService);
  persons$: Observable<Person[]> = this.personService.persons$;

  ngOnInit(): void {
    this.loadPersons();
  }

  private loadPersons(): void {
    this.personService.getPersons();
  }

  onDelete(id: number): void {
    this.personService.deletePerson(id).subscribe();
  }

  onUpdate(person: Person): void {
    this.personService.updatePerson(person).subscribe();
  }

  onAdd(person: Omit<Person, 'id'>): void {
    this.personService.addPerson(person as Person).subscribe();
  }
}
