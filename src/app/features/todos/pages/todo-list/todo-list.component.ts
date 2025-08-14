import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { TodoService } from '../../../../core/services/todo.service';
import { Todo } from '../../../../core/models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent implements OnInit {
  private readonly todoService = inject(TodoService);
  todos$: Observable<Todo[]> = this.todoService.todos$;

  ngOnInit(): void {
    this.loadTodos();
  }

  private loadTodos(): void {
    this.todoService.getTodos();
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
}
