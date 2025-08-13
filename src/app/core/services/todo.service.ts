import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Todo } from '../models/todo.model';
import { environment } from '../../../env/env';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private apiUrl = `${environment.apiBaseUrl}/todos`;

  private todosSubject = new BehaviorSubject<Todo[]>([]);
  todos$ = this.todosSubject.asObservable(); 
  
  constructor(private http: HttpClient) {}

  getTodos(): void {
    this.http.get<Todo[]>(this.apiUrl).subscribe(todos => {
      this.todosSubject.next(todos);
    });
  }

  getTodoById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`);
  }

  addTodo(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, todo).pipe(
      tap(newTodo => {
        const current = this.todosSubject.value;
        this.todosSubject.next([...current, newTodo]);
      })
    );
  }

  updateTodo(todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${todo.id}`, todo).pipe(
      tap(updatedTodo => {
        const current = this.todosSubject.value.map(t =>
          t.id === updatedTodo.id ? updatedTodo : t
        );
        this.todosSubject.next(current);
      })
    );
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.todosSubject.value.filter(t => t.id !== id);
        this.todosSubject.next(current);
      })
    );
  }
}
