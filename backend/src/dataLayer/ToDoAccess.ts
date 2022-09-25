import * as AWS from "aws-sdk";

import { TodoItem } from "../models/TodoItem";
import { Types } from "aws-sdk/clients/s3";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { TodoUpdate } from "../models/TodoUpdate";

const AWSXRay = require("aws-xray-sdk");
const XAWS = AWSXRay.captureAWS(AWS);

export class todoAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly s3: Types = new AWS.S3({ signatureVersion: "v4" }),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.S3_BUCKET_NAME
  ) {}

  async getTodos(userId: string): Promise<TodoItem[]> {
    console.log("Querying existing todos");

    const result = await this.docClient
      .query({
        TableName: this.todoTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
        ExpressionAttributeNames: {
          "#userId": "userId",
        },
      })
      .promise();
    console.log(result);
    const items = result.Items;

    return items as TodoItem[];
  }

  async createToDo(todoItem: TodoItem): Promise<TodoItem> {
    console.log("Creating a todo");

    const result = await this.docClient
      .put({
        TableName: this.todoTable,
        Item: todoItem,
      })
      .promise();
    console.log(result);

    return todoItem as TodoItem;
  }

  async updateToDo(
    todoUpdate: TodoUpdate,
    todoId: string,
    userId: string
  ): Promise<TodoUpdate> {
    console.log("Updating a todo item");

    const result = await this.docClient
      .update({
        TableName: this.todoTable,
        Key: {
          userId: userId,
          todoId: todoId,
        },
        UpdateExpression:
          "set #username = :username, #due = :due, #todoDone = :todoDone",
        ExpressionAttributeNames: {
          "#username": "name",
          "#due": "dueDate",
          "#todoDone": "done",
        },
        ExpressionAttributeValues: {
          ":username": todoUpdate["name"],
          ":due": todoUpdate["dueDate"],
          ":todoDone": todoUpdate["done"],
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();
    console.log(result);
    const updatedItems = result.Attributes;

    return updatedItems as TodoUpdate;
  }

  async deleteToDo(todoId: string, userId: string): Promise<string> {
    console.log("Deleting a todo item");

    const result = await this.docClient
      .delete({
        TableName: this.todoTable,
        Key: {
          userId: userId,
          todoId: todoId,
        },
      })
      .promise();
    console.log(result);

    return "" as string;
  }

  async getUploadUrl(todoId: string): Promise<string> {
    console.log("Generating URL");

    const url = this.s3.getSignedUrl("putObject", {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: 1000,
    });
    console.log(url);

    return url as string;
  }
}
