import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import { SwnDatabase } from './database';
import { SwnMicroservices } from './microservices';

export class AwsMicroservicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new SwnDatabase(this, 'Database');
    const productTable = database.productTable;
    const microservices = new SwnMicroservices(this, 'Microservices', {
      productTable,
    });

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
      handler: microservices.productFunction,
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
