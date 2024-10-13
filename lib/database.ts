import { RemovalPolicy } from 'aws-cdk-lib';
import {
  AttributeType,
  Table,
  BillingMode,
  ITable,
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class SwnDatabase extends Construct {
  public readonly productTable: ITable;
  public readonly basketTable: ITable;
  public readonly orderTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.productTable = this.createProductTable();
    this.basketTable = this.createBasketTable();
    this.orderTable = this.createOrderTable();
  }

  // Product Table
  // product:  PK: id -- name - description - imageFile - price - category
  private createProductTable(): ITable {
    const productTable = new Table(this, 'product', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'product',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    return productTable;
  }

  // basket table
  // basket: PK: username -- items (SET-MAP object)
  // Item { quantity - color - price - productId - productName }
  private createBasketTable(): ITable {
    const basketTable = new Table(this, 'basket', {
      partitionKey: {
        name: 'userName',
        type: AttributeType.STRING,
      },
      tableName: 'basket',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    return basketTable;
  }

  // Order table
  // basket: PK: username, SK: orderDate -- totalPrice - firstName - lastName - email - address - paymentMethod - card info
  private createOrderTable(): ITable {
    const orderTable = new Table(this, 'order', {
      partitionKey: {
        name: 'userName',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'orderDate',
        type: AttributeType.STRING,
      },
      tableName: 'order',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    return orderTable;
  }
}
