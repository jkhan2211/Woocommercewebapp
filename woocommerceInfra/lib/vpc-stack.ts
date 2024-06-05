import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { Tags } from "aws-cdk-lib";

export class DevVpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the VPC
    const vpc = new ec2.Vpc(this, "DevVPC", {
      cidr: "10.0.0.0/16",
      subnetConfiguration: [], // Do not create any subnets automatically
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    new cdk.CfnOutput(this, "VPCOutput", {
      value: vpc.vpcId,
      exportName: "Vpc",
    });
    // Create the Internet Gateway
    const internetGateway = new ec2.CfnInternetGateway(this, "InternetGateway");

    // Attach the internet gateway

    const cfnVPCGatewayAttachment = new ec2.CfnVPCGatewayAttachment(
      this,
      "MyCfnVPCGatewayAttachment",
      {
        vpcId: vpc.vpcId,
        internetGatewayId: internetGateway.ref,
      }
    );

    // Create public subnets
    const publicSubnet1 = new ec2.CfnSubnet(this, "PublicSubnet1", {
      vpcId: vpc.vpcId,
      cidrBlock: "10.0.0.0/24",
      availabilityZone: cdk.Stack.of(this).availabilityZones[0],
      mapPublicIpOnLaunch: true,
    });
    Tags.of(publicSubnet1).add("Name", "PublicSubnet1");

    // output for tier one usage
    new cdk.CfnOutput(this, "PublicSubnet1Output", {
      value: publicSubnet1.ref,
      exportName: "PublicSubnet1",
    });

    const publicSubnet2 = new ec2.CfnSubnet(this, "PublicSubnet2", {
      vpcId: vpc.vpcId,
      cidrBlock: "10.0.1.0/24",
      availabilityZone: cdk.Stack.of(this).availabilityZones[1],
      mapPublicIpOnLaunch: true,
    });
    Tags.of(publicSubnet2).add("Name", "PublicSubnet2");
    new cdk.CfnOutput(this, "PublicSubnet2Output", {
      value: publicSubnet2.ref,
      exportName: "PublicSubnet2",
    });
    // Create a single route table
    const routeTable = new ec2.CfnRouteTable(this, "PublicRouteTable", {
      vpcId: vpc.vpcId,
    });
    Tags.of(routeTable).add("Name", "Public Route Table");

    // Add public route to the route table
    const publicRoute = new ec2.CfnRoute(this, "PublicRoute", {
      routeTableId: routeTable.ref,
      destinationCidrBlock: "0.0.0.0/0",
      gatewayId: internetGateway.ref,
    });

    // Associate the subnets with the route table
    new ec2.CfnSubnetRouteTableAssociation(
      this,
      "PublicSubnet1RouteTableAssociation",
      {
        subnetId: publicSubnet1.ref,
        routeTableId: routeTable.ref,
      }
    );

    new ec2.CfnSubnetRouteTableAssociation(
      this,
      "PublicSubnet2RouteTableAssociation",
      {
        subnetId: publicSubnet2.ref,
        routeTableId: routeTable.ref,
      }
    );

    // to deal with CDK creating a route table for public subnet 2
    publicSubnet2.node.tryRemoveChild("PublicSubnet2RouteTableAssociation");
    publicSubnet2.node.tryRemoveChild("PublicRouteTable");

    // Create 4 Private subnets
    const privateAppSubnet1 = new ec2.CfnSubnet(this, "Private App Subnet 1", {
      vpcId: vpc.vpcId,
      cidrBlock: "10.0.2.0/24",
      availabilityZone: cdk.Stack.of(this).availabilityZones[0],
      mapPublicIpOnLaunch: true,
    });
    Tags.of(privateAppSubnet1).add("Name", "Private App Subnet 1");

    new cdk.CfnOutput(this, "PrivateAppSubnet1Output", {
      value: privateAppSubnet1.ref,
      exportName: "PrivateAppSubnet1",
    });

    const privateAppSubnet2 = new ec2.CfnSubnet(this, "Private App Subnet 2", {
      vpcId: vpc.vpcId,
      cidrBlock: "10.0.3.0/24",
      availabilityZone: cdk.Stack.of(this).availabilityZones[0],
      mapPublicIpOnLaunch: true,
    });
    Tags.of(privateAppSubnet2).add("Name", "Private App Subnet 2");

    new cdk.CfnOutput(this, "PrivateAppSubnet2Output", {
      value: privateAppSubnet2.ref,
      exportName: "PrivateAppSubnet2",
    });

    const privateDataSubnet1 = new ec2.CfnSubnet(
      this,
      "Private Data Subnet 1",
      {
        vpcId: vpc.vpcId,
        cidrBlock: "10.0.4.0/24",
        availabilityZone: cdk.Stack.of(this).availabilityZones[0],
        mapPublicIpOnLaunch: true,
      }
    );
    Tags.of(privateDataSubnet1).add("Name", "Private Data Subnet 1");
    new cdk.CfnOutput(this, "PrivateDataSubnet1Output", {
      value: privateDataSubnet1.ref,
      exportName: "PrivateDataSubnet1",
    });

    const privateDataSubnet2 = new ec2.CfnSubnet(
      this,
      "Private Data Subnet 2",
      {
        vpcId: vpc.vpcId,
        cidrBlock: "10.0.5.0/24",
        availabilityZone: cdk.Stack.of(this).availabilityZones[0],
        mapPublicIpOnLaunch: true,
      }
    );
    Tags.of(privateDataSubnet2).add("Name", "Private Data Subnet 2");

    new cdk.CfnOutput(this, "PrivateDataSubnet2Output", {
      value: privateDataSubnet2.ref,
      exportName: "PrivateDataSubnet2",
    });
  }
}
