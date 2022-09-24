import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from "aws-lambda";
import { getTodos } from "../../businessLogic/toDo";

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log("Processing Event ", event);
  const authorize = event.headers.Authorization;
  const split = authorize.split(" ");
  const jwtToken = split[1];

  const toDo = await getTodos(jwtToken);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      items: toDo,
    }),
  };
};
