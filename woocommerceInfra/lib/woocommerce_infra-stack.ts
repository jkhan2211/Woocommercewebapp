import * as cdk from 'aws-cdk-lib';
import { DevVpcStack } from '../lib/vpc-stack';
import { RdsStack } from '../lib/rds-stack';
import { EfsStack } from './efs-stack';
import { Ec2Stack } from './ec2-stack';
// import { TierOneStack } from './tier-one-stack';
// import { TierThreeStack } from './tier-three-stack';
// import { TierTwoStack } from './tier-two-stack';



export class WoocommerceInfraStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const app = new cdk.App();
    //-- 1. Deploy vpc stack --
    const vpcStack = new DevVpcStack(app, 'DevVpcStack');

    //-- 2. Deploy rds stack --
    const rdsStack = new RdsStack(app, 'RdsStack');

    //-- 3. Deploy efs stack --
    const efsStack = new EfsStack(app, 'EfsStack')

    //-- 4. Deploy ec2 stack --
    const ec2Stack = new Ec2Stack(app, 'Ec2Stack')



  }
}
