import { Routes } from '@angular/router';
import { TodoListComponent } from './features/todos/pages/todo-list/todo-list.component';
import { PersonListComponent } from './features/persons/pages/person-list/person-list.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'todo',
        pathMatch: 'full'
    },
    {
        path: 'todo',
        component: TodoListComponent
    },
    {
        path: 'person',
        component: PersonListComponent
    },
    {
        path: '**',
        redirectTo: 'todo'
    }
];
