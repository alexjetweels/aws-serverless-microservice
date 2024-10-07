import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { SwnDatabase } from './database';
import { SwnMicroservices } from './microservices';
import { SwnApiGateway } from './apigateway';

export class AwsMicroservicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new SwnDatabase(this, 'Database');

    const microservices = new SwnMicroservices(this, 'Microservices', {
      productTable: database.productTable,
    });

    new SwnApiGateway(this, 'ApiGateway', {
      productMicroservices: microservices.productFunction,
    });
  }
}
