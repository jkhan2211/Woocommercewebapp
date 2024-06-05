import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Tags } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

export class TierOneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import the subnet ID from the VPC stack
    const publicSubnet1Id = cdk.Fn.importValue("PublicSubnet1");

    // Create an Elastic IP for the NAT Gateway
    const eip = new ec2.CfnEIP(this, "NATGatewayEIP");
    const cfnNatGateway = new ec2.CfnNatGateway(this, "MyCfnNatGateway", {
      subnetId: publicSubnet1Id,

      // the properties below are optional
      allocationId: eip.attrAllocationId,
      connectivityType: "public",
      tags: [
        {
          key: "Name",
          value: "NAT Gateway AZ1",
        },
      ],
    });
    const Vpc = cdk.Fn.importValue("Vpc");

    // Create a single route table
    const routeTable = new ec2.CfnRouteTable(this, "PrivateRouteTable", {
      vpcId: Vpc,
    });
    Tags.of(routeTable).add("Name", "Private Route Table AZ1");

    // Add private route to the route table
    const privateRoute = new ec2.CfnRoute(this, "PrivateRoute", {
      routeTableId: routeTable.ref,
      destinationCidrBlock: "0.0.0.0/0",
      natGatewayId: cfnNatGateway.ref,
    });

    const privateAppSubnet1Id = cdk.Fn.importValue("PrivateAppSubnet1");
    const privateDataSubnet1Id = cdk.Fn.importValue("PrivateDataSubnet1");
    new ec2.CfnSubnetRouteTableAssociation(
      this,
      "PrivateAppSubnetRouteTableAssociation",
      {
        subnetId: privateAppSubnet1Id,
        routeTableId: routeTable.ref,
      }
    );

    new ec2.CfnSubnetRouteTableAssociation(
      this,
      "PrivateDataSubnetRouteTableAssociation",
      {
        subnetId: privateDataSubnet1Id,
        routeTableId: routeTable.ref,
      }
    );
    // Import the subnet ID from the VPC stack
    const publicSubnet2Id = cdk.Fn.importValue("PublicSubnet2");

    // Create an Elastic IP for the NAT Gateway
    const eip_2 = new ec2.CfnEIP(this, "NATGatewayEIP_2");
    const cfnNatGateway_2 = new ec2.CfnNatGateway(this, "MyCfnNatGateway_2", {
      subnetId: publicSubnet2Id,

      // the properties below are optional
      allocationId: eip_2.attrAllocationId,
      connectivityType: "public",
      tags: [
        {
          key: "Name",
          value: "NAT Gateway AZ2",
        },
      ],
    });

    //  Create a single route table
    const routeTable_2 = new ec2.CfnRouteTable(this, "PrivateRouteTable_2", {
      vpcId: Vpc,
    });
    Tags.of(routeTable_2).add("Name", "Private Route Table AZ2");

    // Add private route to the route table
    const privateRoute_2 = new ec2.CfnRoute(this, "PrivateRoute_2", {
      routeTableId: routeTable_2.ref,
      destinationCidrBlock: "0.0.0.0/0",
      natGatewayId: cfnNatGateway_2.ref,
    });

    // Subnet Association
    const privateAppSubnet2Id = cdk.Fn.importValue("PrivateAppSubnet2");
    const privateDataSubnet2Id = cdk.Fn.importValue("PrivateDataSubnet2");
    new ec2.CfnSubnetRouteTableAssociation(
      this,
      "PrivateAppSubnetRouteTableAssociation2",
      {
        subnetId: privateAppSubnet2Id,
        routeTableId: routeTable_2.ref,
      }
    );

    new ec2.CfnSubnetRouteTableAssociation(
      this,
      "PrivateDataSubnetRouteTableAssociation2",
      {
        subnetId: privateDataSubnet2Id,
        routeTableId: routeTable_2.ref,
      }
    );


    // Todo: Bastion Host

    // Todo: Load Balancer
  }
}
