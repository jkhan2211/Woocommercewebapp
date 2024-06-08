import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Tags } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

export class Ec2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define IAM role for the instance
    const role = new iam.Role(this, 'SimpleInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    // Import the existing VPC
    const vpcId = cdk.Fn.importValue("Vpc");
    const availabilityZones = ['us-east-1a', 'us-east-1b'];

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ImportedVpc', {
      vpcId,
      availabilityZones: availabilityZones,
      publicSubnetIds: [
        cdk.Fn.importValue("PublicSubnetAZ1"),
        cdk.Fn.importValue("PublicSubnetAZ2"),
      ],
    });

    // Import the SSH security group
    const sshSecurityGroupId = cdk.Fn.importValue("SSHSecurityGroup");
    const sshSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'SSHSecurityGroup', sshSecurityGroupId);

     // Import the ALB security group
     const albSecurityGroupId = cdk.Fn.importValue("ALBSecurityGroup");
     const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'ALBSecurityGroup', albSecurityGroupId);

     // Import the Webserver security group
     const webSecurityGroupId = cdk.Fn.importValue("WebServerSecurityGroup");
     const webSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'WebServerSecurityGroup', webSecurityGroupId);

    // Specify the subnet with availability zone
    const publicSubnet1Id = cdk.Fn.importValue("PublicSubnetAZ1");
    const publicSubnet1Az = 'us-east-1a';  // Ensure this matches the actual AZ of your subnet
    const publicSubnet1 = ec2.Subnet.fromSubnetAttributes(this, 'PublicSubnetAZ1', {
      subnetId: publicSubnet1Id,
      availabilityZone: publicSubnet1Az,
    });

    // Finally, provision the EC2 instance
    const instance = new ec2.Instance(this, 'WebServer', {
      vpc: vpc,
      role: role,
      vpcSubnets: {
        subnets: [publicSubnet1],
      },
      instanceName: 'WebServer',
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: 'testKeypair', // use the key pair created in console
    });
    instance.addSecurityGroup(sshSecurityGroup);
    instance.addSecurityGroup(albSecurityGroup);
    instance.addSecurityGroup(webSecurityGroup);

  }
}
