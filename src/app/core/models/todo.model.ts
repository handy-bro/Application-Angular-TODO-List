import { Label } from "../enums/label.enum";
import { Priority } from "../enums/priority.enum";
import { Person } from "./person.model";

export interface Todo {
  id: number;
  title: string;
  person: Person;
  startDate: Date;
  endDate?: Date;
  priority: Priority;
  labels: Label[];
  description: string;
}