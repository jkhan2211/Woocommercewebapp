import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_rds as rds } from "aws-cdk-lib";
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Tags } from "aws-cdk-lib";



export class RdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //--------------Create Test RDS-------------------
    const vpcId = cdk.Fn.importValue("Vpc");
    const availabilityZones = ['us-east-1a', 'us-east-1b'];

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ImportedVPC', {
      vpcId,
      availabilityZones: availabilityZones,
      publicSubnetIds: [
        cdk.Fn.importValue("PublicSubnetAZ1"),
        cdk.Fn.importValue("PublicSubnetAZ2"),
      ],
    });

    const privateDataSubnet1Id = cdk.Fn.importValue("PrivateDataSubnet1");
    const privateDataSubnet1 = ec2.Subnet.fromSubnetId(this, 'PrivateDataSubnet1', privateDataSubnet1Id);

    const privateDataSubnet2Id = cdk.Fn.importValue("PrivateDataSubnet2");
    const privateDataSubnet2 = ec2.Subnet.fromSubnetId(this, 'PrivateDataSubnet2', privateDataSubnet2Id);

    const subnetGroup = new rds.SubnetGroup(this, 'rdsSubnetGroup', {
      description: 'rdsSubnetGroup',
      vpc: vpc,
      subnetGroupName: 'db-subnetgroup',
      vpcSubnets: {
        subnets: [privateDataSubnet1, privateDataSubnet2],
      },
    });

    // const templatedSecret = new secretsmanager.Secret(this, 'TemplatedSecret', {
    //   description: 'Templated secret used for RDS password',
    //   generateSecretString: {
    //     excludePunctuation: true,
    //     includeSpace: false,
    //     generateStringKey: 'password',
    //     passwordLength: 12,
    //     secretStringTemplate: JSON.stringify({ username: 'admin' }),
    //   },
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    // });



     // --------Tier Three: RDS creation--------------

    const dbPassword = 'test_2024'; 

    const DbSecurityGroupId = cdk.Fn.importValue("DbServerSecurityGroup");
    const DbSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'DbServerSecurityGroup', DbSecurityGroupId);
    const cluster = new rds.DatabaseCluster(this, 'Database', {
      instanceIdentifierBase: 'rdsDevDb',
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_05_2,
      }),
      instanceProps: {
        vpc: vpc,
        securityGroups: [DbSecurityGroup],
        publiclyAccessible: false,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
        vpcSubnets: {
          subnets: [privateDataSubnet1, privateDataSubnet2],
        },
      },
      credentials: rds.Credentials.fromPassword('admin', cdk.SecretValue.plainText(dbPassword)),
      defaultDatabaseName: 'devrdsdb',
      instances: 1,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    Tags.of(cluster).add("DB identifier", "RDSDevDB");


  }
}