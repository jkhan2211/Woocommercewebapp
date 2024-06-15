import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Tags } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { readFileSync } from "fs";
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
declare const asg: AutoScalingGroup;
import { aws_ec2 as ec2, aws_elasticloadbalancingv2 as elbv2 } from 'aws-cdk-lib';


export class Ec2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define IAM role for the instance
    const role = new iam.Role(this, "SimpleInstanceRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    // Import the existing VPC
    const vpcId = cdk.Fn.importValue("Vpc");
    const availabilityZones = ["us-east-1a", "us-east-1b"];

    const vpc = ec2.Vpc.fromVpcAttributes(this, "ImportedVpc", {
      vpcId,
      availabilityZones: availabilityZones,
      publicSubnetIds: [
        cdk.Fn.importValue("PublicSubnetAZ1"),
        cdk.Fn.importValue("PublicSubnetAZ2"),
      ],
    });

    // Import the SSH security group
    const sshSecurityGroupId = cdk.Fn.importValue("SSHSecurityGroup");
    const sshSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "SSHSecurityGroup",
      sshSecurityGroupId
    );

    // Import the ALB security group
    const albSecurityGroupId = cdk.Fn.importValue("ALBSecurityGroup");
    const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "ALBSecurityGroup",
      albSecurityGroupId
    );

    // Import the Webserver security group
    const webSecurityGroupId = cdk.Fn.importValue("WebServerSecurityGroup");
    const webSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "WebServerSecurityGroup",
      webSecurityGroupId
    );

    // Specify the subnet with availability zone
    const publicSubnet1Id = cdk.Fn.importValue("PublicSubnetAZ1");
    const publicSubnet1Az = "us-east-1a"; // Ensure this matches the actual AZ of your subnet
    const publicSubnet1 = ec2.Subnet.fromSubnetAttributes(
      this,
      "PublicSubnetAZ1",
      {
        subnetId: publicSubnet1Id,
        availabilityZone: publicSubnet1Az,
      }
    );

    const publicSubnet2Id = cdk.Fn.importValue("PublicSubnetAZ2");
    const publicSubnet2Az = "us-east-1b"; // Ensure this matches the actual AZ of your subnet
    const publicSubnet2 = ec2.Subnet.fromSubnetAttributes(
      this,
      "PublicSubnetAZ2",
      {
        subnetId: publicSubnet2Id,
        availabilityZone: publicSubnet2Az,
      }
    );

    // Key Pair

    // Finally, provision the EC2 instance
    const instance = new ec2.Instance(this, "WebServer", {
      vpc: vpc,
      role: role,
      vpcSubnets: {
        subnets: [publicSubnet1],
      },
      instanceName: "WebServer",
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: "testKeypair", // use the key pair created in console
    });
    instance.addSecurityGroup(sshSecurityGroup);
    instance.addSecurityGroup(albSecurityGroup);
    instance.addSecurityGroup(webSecurityGroup);

    // --------- Create EC2 Private ---------

    // Specify the subnet with availability zone
    const privateSubnet1Id = cdk.Fn.importValue("PrivateAppSubnet1");
    const privateSubnet1Az = "us-east-1a"; // Ensure this matches the actual AZ of your subnet
    const privateSubnet1 = ec2.Subnet.fromSubnetAttributes(
      this,
      "PrivateAppSubnet1",
      {
        subnetId: privateSubnet1Id,
        availabilityZone: privateSubnet1Az,
      }
    );

    const instance_az1 = new ec2.Instance(this, "WebServerAZ1", {
      vpc: vpc,
      role: role,
      vpcSubnets: {
        subnets: [privateSubnet1],
      },
      instanceName: "WebServerAZ1",
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: "testKeypair", // use the key pair created in console
    });
    instance_az1.addSecurityGroup(sshSecurityGroup);
    instance_az1.addSecurityGroup(albSecurityGroup);
    instance_az1.addSecurityGroup(webSecurityGroup);
    // 👇 load user data script
    const userDataScript = readFileSync("./lib/user-data.sh", "utf8");
    // 👇 add user data to the EC2 instance
    instance_az1.addUserData(userDataScript);

    // --------- Create EC2 Private (2) ---------

    // Specify the subnet with availability zone
    const privateSubnet2Id = cdk.Fn.importValue("PrivateAppSubnet2");
    const privateSubnet2Az = "us-east-1b"; // Ensure this matches the actual AZ of your subnet
    const privateSubnet2 = ec2.Subnet.fromSubnetAttributes(
      this,
      "PrivateAppSubnet2",
      {
        subnetId: privateSubnet2Id,
        availabilityZone: privateSubnet2Az,
      }
    );

    const instance_az2 = new ec2.Instance(this, "WebServerAZ2", {
      vpc: vpc,
      role: role,
      vpcSubnets: {
        subnets: [privateSubnet2],
      },
      instanceName: "WebServerAZ2",
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: "testKeypair", // use the key pair created in console
    });
    instance_az2.addSecurityGroup(sshSecurityGroup);
    instance_az2.addSecurityGroup(albSecurityGroup);
    instance_az2.addSecurityGroup(webSecurityGroup);
    // 👇 load user data script
    const userDataScript_2 = readFileSync("./lib/user-data.sh", "utf8");
    // 👇 add user data to the EC2 instance
    instance_az2.addUserData(userDataScript_2);




    // ------ Target Group ----------
        // Create the target group
        const targetGroup = new elbv2.ApplicationTargetGroup(this, 'Dev-TG', {
          targetGroupName: 'Dev-TG',
          vpc: vpc,
          port: 80,
          protocol: elbv2.ApplicationProtocol.HTTP,
          targetType: elbv2.TargetType.INSTANCE,
          healthCheck: {
            port: 'traffic-port',
            healthyThresholdCount: 5,
            unhealthyThresholdCount: 2,
            timeout: cdk.Duration.seconds(5),
            interval: cdk.Duration.seconds(30),
            path: '/'          
          },
        });

          // Create the application load balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'Dev-ALB', {
      loadBalancerName: 'Dev-ALB',
      vpc: vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      vpcSubnets: {
        subnets: [ publicSubnet1,publicSubnet2],
      },
    });

     // Add a listener to the ALB
     const listener = alb.addListener('Listener', {
      port: 80,
      open: true,
    });

    // Attach the target group to the listener
    listener.addTargetGroups('AddTG', {
      targetGroups: [targetGroup],
    });


  }
}
