import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path = require('path');

export class AwsMicroservicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productTable = new Table(this, 'product', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'product',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const nodeJSFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'id',
        DYNAMODB_TABLE_NAME: productTable.tableName,
      },
      runtime: Runtime.NODEJS_20_X,
    };

    const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
      entry: path.join(__dirname, `/../src/product/index.js`),
      ...nodeJSFunctionProps,
    });

    // Grant permission read and write to our NodeJSFunction => We can interact with dynamoDB from our handle function.
    // Other wise we will got permission error when access the dynamoDB.
    productTable.grantReadWriteData(productFunction);

    // Product microservices API gateway
    // root name = products

    // Get /product
    // Post /product

    // Single product with id parameter
    // Get /product/{id}
    // Put /product/{id}
    // Delete /product/{id}

    const apgw = new LambdaRestApi(this, 'productApi', {
      restApiName: 'Product Service',
      handler: productFunction,
      proxy: false,
    });

    const product = apgw.root.addResource('product');
    product.addMethod('GET');
    product.addMethod('POST');

    const singleProduct = product.addResource('{id}');
    singleProduct.addMethod('GET');
    singleProduct.addMethod('PUT');
    singleProduct.addMethod('DELETE');
  }
}
