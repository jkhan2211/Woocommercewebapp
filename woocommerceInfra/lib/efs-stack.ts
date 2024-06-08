//------ Tier 3----------
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_rds as rds } from "aws-cdk-lib";
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Tags } from "aws-cdk-lib";
import * as efs from 'aws-cdk-lib/aws-efs';




export class EfsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcId = cdk.Fn.importValue("Vpc");
    const availabilityZones = ['us-east-1a', 'us-east-1b'];

    // Import the Webserver security group
    const webSecurityGroupId = cdk.Fn.importValue("WebServerSecurityGroup");
    const webSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'WebServerSecurityGroup', webSecurityGroupId);

    // Import the SSH security group
    const sshSecurityGroupId = cdk.Fn.importValue("SSHSecurityGroup");
    const sshSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'SSHSecurityGroup', sshSecurityGroupId);



    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ImportedVPC', {
        vpcId,
        availabilityZones: availabilityZones,
        publicSubnetIds: [
          cdk.Fn.importValue("PublicSubnetAZ1"),
          cdk.Fn.importValue("PublicSubnetAZ2"),
        ],
      });
    const efsSecurityGroup = new ec2.SecurityGroup(this, "SecurityGroup_EFS", {
        vpc,
        securityGroupName: "efsSecurityGroup",
      });
      Tags.of(efsSecurityGroup).add("Name", "EFS Security Group");
  
      efsSecurityGroup.addIngressRule(
        efsSecurityGroup,
        ec2.Port.tcp(2049),
        "Allow NFS traffic within EFS security group"
      );
      efsSecurityGroup.addIngressRule(
        webSecurityGroup,
        ec2.Port.tcp(2049),
        "Allow Web server traffic within EFS security group"
      );
      efsSecurityGroup.addIngressRule(
        sshSecurityGroup,
        ec2.Port.tcp(22),
        "Allow ssh traffic within EFS security group"
      );


    // Adding EFS security group to both region
    const fileSystem = new efs.FileSystem(this, 'MyEfsFileSystem', {
        vpc: vpc,
        encrypted: false,
        enableAutomaticBackups: true,
        securityGroup: efsSecurityGroup, // Primary security group for EFS
      });

  
      // Attach security group to the EFS file system to second region
      fileSystem.connections.addSecurityGroup(efsSecurityGroup);

      new cdk.CfnOutput(this, "EFSId", {
        value: fileSystem.fileSystemId,
        exportName: "EFSId",
      });
  }
}

