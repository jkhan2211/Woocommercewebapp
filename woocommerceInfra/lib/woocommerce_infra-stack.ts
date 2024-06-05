import * as cdk from 'aws-cdk-lib';
import { DevVpcStack } from '../lib/vpc-stack';
import { TierOneStack } from './tier-one-stack';


export class WoocommerceInfraStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const app = new cdk.App();
    const vpcStack = new DevVpcStack(app, 'DevVpcStack');
    const tieroneStack = new TierOneStack(app, 'TierOneStack');
  }
}