import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import path = require('path');

interface SwnMicroservicesProps {
  productTable: ITable;
}
export class SwnMicroservices extends Construct {
  public readonly productFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: SwnMicroservicesProps) {
    super(scope, id);

    const nodeJSFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'id',
        DYNAMODB_TABLE_NAME: props.productTable.tableName,
      },
      runtime: Runtime.NODEJS_20_X,
    };

    const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
      entry: path.join(__dirname, `/../src/product/index.js`),
      ...nodeJSFunctionProps,
    });

    // Grant permission read and write to our NodeJSFunction => We can interact with dynamoDB from our handle function.
    // Other wise we will got permission error when access the dynamoDB.
    props.productTable.grantReadWriteData(productFunction);

    this.productFunction = productFunction;
  }
}
