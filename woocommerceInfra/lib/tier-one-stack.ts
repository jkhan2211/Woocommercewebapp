import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';


export class TierOneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cfnNatGateway = new ec2.CfnNatGateway(this, 'MyCfnNatGateway', {
        subnetId: 'subnetId', // replace with subnet (Public Subnet 1)
      
        // the properties below are optional
        allocationId: 'allocationId',
        connectivityType: 'connectivityType',
        maxDrainDurationSeconds: 123,
        privateIpAddress: 'privateIpAddress',
        secondaryAllocationIds: ['secondaryAllocationIds'],
        secondaryPrivateIpAddressCount: 123,
        secondaryPrivateIpAddresses: ['secondaryPrivateIpAddresses'],
        tags: [{
          key: 'Name',
          value: 'NAT Gateway AZ1',
        }],
      });

    }
}