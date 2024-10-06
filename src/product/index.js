const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { ddbClient } = require('./dynamoDBClient');
const {
  GetItemCommand,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  QueryCommand,
} = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

exports.handler = async function (event) {
  console.log(event);

  // TODO - switch case event.httpMethod to perform CRUD operations
  // using ddbClient object
  let body = '';
  switch (event.httpMethod) {
    case 'GET':
      if (event.queryStringParameters != null) {
        body = await getProductsByCategory(event);
      } else if (event.pathParameters != null) {
        body = await getProduct(event.pathParameters.id);
      } else {
        body = await getAllProducts();
      }
    case 'POST':
      body = await createProduct(event);
    case 'DELETE':
      body = await removeProduct(event.pathParameters.id);
    case 'PUT':
      body = await updateProduct(event);

    // default:
    //   throw new Error(`Unsupported route: "${event.httpMethod}"`);
  }

  return {
    statusCode: 200,
    headers: { 'Content-type': 'text/plain' },
    body,
  };
};

const getProductsByCategory = async (event) => {
  console.log('getProductsByCategory', category);
  try {
    // GET product/1234?category=Phone

    const productId = event.pathParameters.id;
    const category = event.queryStringParameters.category;

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: 'id = :productId',
      FilterExpression: 'contains (category, :category)',
      ExpressionAttributeValues: {
        ':productId': { S: productId },
        ':category': { S: category },
      },
    };

    const { Items } = await ddbClient.send(new QueryCommand(params));

    return Items.map((item) => unmarshall(item));
  } catch (error) {
    console.error('Error fetching products by category', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error fetching products by category',
        error: error.message,
      }),
    };
  }
};

const getProduct = async (productId) => {
  console.log('getProduct');

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: productId }),
    };

    const { Item } = await ddbClient.send(new GetItemCommand(params));
    console.log(Item);

    return Item ? unmarshall(Item) : {};
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getAllProducts = async () => {
  console.log('get all Product');

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new ScanCommand(params));
    console.log('Items', Items);
    return Items ? Items.map((el) => unmarshall(el)) : {};
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createProduct = async (event) => {
  console.log('create product function event', event);

  try {
    const requestBody = JSON.parse(event.body);
    const productId = uuidv4();
    requestBody.id = productId;

    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing product ID in path parameters',
        }),
      };
    }

    if (!requestBody || Object.keys(requestBody).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Request body is empty' }),
      };
    }

    const objKeys = Object.keys(requestBody);
    let updateExpression = 'SET';
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    objKeys.forEach((key, index) => {
      const attributeName = `#key${index}`;
      const attributeValue = `:value${index}`;

      updateExpression += ` ${attributeName} = ${attributeValue},`;
      ExpressionAttributeNames[attributeName] = key;
      ExpressionAttributeValues[attributeValue] = marshall({
        value: requestBody[key],
      }).value;
    });

    updateExpression = updateExpression.slice(0, -1);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({
        id: productId,
      }),
      UpdateExpression: updateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    const createResult = await ddbClient.send(new PutItemCommand(params));

    return createResult;
  } catch (error) {
    console.error('Error updating product', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to update product',
        error: error.message,
      }),
    };
  }
};

const removeProduct = async (productId) => {
  console.log('delete product function event', productId);

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: productId }),
    };

    const result = await ddbClient.send(new DeleteItemCommand(params));
    console.log('deleteResult', result);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateProduct = async (event) => {
  console.log('update product function event', event);

  try {
    const requestBody = JSON.parse(event.body);
    const objKeys = Object.keys(requestBody);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const result = await ddbClient.send(new UpdateItemCommand(params));
    console.log('update result', result);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
