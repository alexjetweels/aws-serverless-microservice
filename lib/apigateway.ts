import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface SwnApiGatewayProps {
  productMicroservices: IFunction;
}
export class SwnApiGateway extends Construct {
  public readonly productTable: ITable;

  constructor(scope: Construct, id: string, props: SwnApiGatewayProps) {
    super(scope, id);

    const apgw = new LambdaRestApi(this, 'productApi', {
      restApiName: 'Product Service',
      handler: props.productMicroservices,
      proxy: false,
    });

    // CRUD - /product
    const product = apgw.root.addResource('product');
    product.addMethod('GET');
    product.addMethod('POST');

    const singleProduct = product.addResource('{id}');
    singleProduct.addMethod('GET');
    singleProduct.addMethod('PUT');
    singleProduct.addMethod('DELETE');
  }
}
