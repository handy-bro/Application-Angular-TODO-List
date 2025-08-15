import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Person } from '../models/person.model';
import { environment } from '../../../env/env';

@Injectable({ providedIn: 'root' })
export class PersonService {
  private apiUrl = `${environment.apiBaseUrl}/persons`;

  private personsSubject = new BehaviorSubject<Person[]>([]);
  persons$ = this.personsSubject.asObservable();
  private readonly http = inject(HttpClient);

  getPersons(): void {
    this.http.get<Person[]>(this.apiUrl).subscribe(persons => {
      this.personsSubject.next(persons);
    });
  }

  getPersonById(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.apiUrl}/${id}`);
  }

  addPerson(person: Person): Observable<Person> {
    return this.http.post<Person>(this.apiUrl, person).pipe(
      tap(newPerson => {
        const current = this.personsSubject.value;
        this.personsSubject.next([...current, newPerson]);
      })
    );
  }

  updatePerson(person: Person): Observable<Person> {
    return this.http.put<Person>(`${this.apiUrl}/${person.id}`, person).pipe(
      tap(updatedPerson => {
        const current = this.personsSubject.value.map(p =>
          p.id === updatedPerson.id ? updatedPerson : p
        );
        this.personsSubject.next(current);
      })
    );
  }

  deletePerson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.personsSubject.value.filter(p => p.id !== id);
        this.personsSubject.next(current);
      })
    );
  }

  checkNameExists(name: string): Observable<boolean> {
    return this.persons$.pipe(
      map(persons => persons.some(person => 
        person.name.toLowerCase() === name.toLowerCase()
      ))
    );
  }
}
