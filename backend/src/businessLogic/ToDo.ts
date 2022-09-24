import { TodoItem } from "../models/TodoItem";
import { parseUserId } from "../auth/utils";
import { todoAccess } from "../dataLayer/ToDoAccess";
import { TodoUpdate } from "../models/TodoUpdate";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

const uuidv4 = require("uuid/v4");
const TodoAccess = new todoAccess();

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return await TodoAccess.getTodos(userId);
}

export async function createToDo(
  todoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const todoId = uuidv4();
  const userId = parseUserId(jwtToken);
  const bucketName = process.env.S3_BUCKET_NAME;

  const todo: TodoItem = {
    ...todoRequest,
    todoId,
    userId,
    done: false,
    createdAt: new Date().toISOString(),
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
  };

  return await TodoAccess.createToDo(todo);
}

export function updateToDo(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  jwtToken: string
): Promise<TodoUpdate> {
  const userId = parseUserId(jwtToken);
  return TodoAccess.updateToDo(updateTodoRequest, todoId, userId);
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<string> {
  return await TodoAccess.deleteToDo(todoId, userId);
}

export function generateUploadUrl(todoId: string): Promise<string> {
  return TodoAccess.getUploadUrl(todoId);
}
