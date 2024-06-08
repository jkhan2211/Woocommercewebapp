import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { Tags } from "aws-cdk-lib";

export class DevVpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // -------------Create the VPC-------------
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
    Tags.of(internetGateway).add("Name", "Dev Internet Gateway");

    // Attach the internet gateway
    new ec2.CfnVPCGatewayAttachment(this, "MyCfnVPCGatewayAttachment", {
      vpcId: vpc.vpcId,
      internetGatewayId: internetGateway.ref,
    });

    // Create public subnets
    const publicSubnet1 = new ec2.CfnSubnet(this, "PublicSubnet1", {
      vpcId: vpc.vpcId,
      cidrBlock: "10.0.0.0/24",
      availabilityZone: cdk.Stack.of(this).availabilityZones[0],
      mapPublicIpOnLaunch: true,
    });
    Tags.of(publicSubnet1).add("Name", "PublicSubnet AZ1");

    new cdk.CfnOutput(this, "PublicSubnetAZ1Output", {
      value: publicSubnet1.ref,
      exportName: "PublicSubnetAZ1",
    });

    const publicSubnet2 = new ec2.CfnSubnet(this, "PublicSubnet AZ2", {
      vpcId: vpc.vpcId,
      cidrBlock: "10.0.1.0/24",
      availabilityZone: cdk.Stack.of(this).availabilityZones[1],
      mapPublicIpOnLaunch: true,
    });
    Tags.of(publicSubnet2).add("Name", "PublicSubnet AZ2");
    new cdk.CfnOutput(this, "PublicSubnetAZ2Output", {
      value: publicSubnet2.ref,
      exportName: "PublicSubnetAZ2",
    });

    // Create a single route table
    const routeTable = new ec2.CfnRouteTable(this, "PublicRouteTable", {
      vpcId: vpc.vpcId,
    });
    Tags.of(routeTable).add("Name", "Public Route Table");

    // Add public route to the route table
    new ec2.CfnRoute(this, "PublicRoute", {
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

    // -----------Create Private subnets-------------
    const privateAppSubnet1 = new ec2.CfnSubnet(this, "PrivateAppSubnet1", {
      vpcId: vpc.vpcId,
      cidrBlock: "10.0.2.0/24",
      availabilityZone: cdk.Stack.of(this).availabilityZones[0],
      mapPublicIpOnLaunch: false,
    });
    Tags.of(privateAppSubnet1).add("Name", "Private App Subnet AZ1");

    new cdk.CfnOutput(this, "PrivateAppSubnet1Output", {
      value: privateAppSubnet1.ref,
      exportName: "PrivateAppSubnet1",
    });

    const privateAppSubnet2 = new ec2.CfnSubnet(this, "PrivateAppSubnet2", {
      vpcId: vpc.vpcId,
      cidrBlock: "10.0.3.0/24",
      availabilityZone: cdk.Stack.of(this).availabilityZones[1],
      mapPublicIpOnLaunch: false,
    });
    Tags.of(privateAppSubnet2).add("Name", "Private App Subnet AZ2");

    new cdk.CfnOutput(this, "PrivateAppSubnet2Output", {
      value: privateAppSubnet2.ref,
      exportName: "PrivateAppSubnet2",
    });

    const privateDataSubnet1 = new ec2.CfnSubnet(this, "PrivateDataSubnet1", {
      vpcId: vpc.vpcId,
      cidrBlock: "10.0.4.0/24",
      availabilityZone: cdk.Stack.of(this).availabilityZones[0],
      mapPublicIpOnLaunch: false,
    });
    Tags.of(privateDataSubnet1).add("Name", "Private Data Subnet AZ1");
    new cdk.CfnOutput(this, "PrivateDataSubnet1Output", {
      value: privateDataSubnet1.ref,
      exportName: "PrivateDataSubnet1",
    });

    const privateDataSubnet2 = new ec2.CfnSubnet(this, "PrivateDataSubnet2", {
      vpcId: vpc.vpcId,
      cidrBlock: "10.0.5.0/24",
      availabilityZone: cdk.Stack.of(this).availabilityZones[1],
      mapPublicIpOnLaunch: false,
    });
    Tags.of(privateDataSubnet2).add("Name", "Private Data Subnet AZ2");

    new cdk.CfnOutput(this, "PrivateDataSubnet2Output", {
      value: privateDataSubnet2.ref,
      exportName: "PrivateDataSubnet2",
    });

    // Create Elastic IPs for the NAT Gateways
    const eip1 = new ec2.CfnEIP(this, "NATGatewayEIP1");
    // const eip2 = new ec2.CfnEIP(this, "NATGatewayEIP2");

    // -- Tier One -- 
    //---------Create NAT Gateways (1)--------------
    const natGateway1 = new ec2.CfnNatGateway(this, "NATGateway1", {
      subnetId: publicSubnet1.ref,
      allocationId: eip1.attrAllocationId,
      connectivityType: "public",
      tags: [{ key: "Name", value: "NAT Gateway AZ1" }],
    });

    //---------Create Private Route Table (1)--------------
    const routeTable1 = new ec2.CfnRouteTable(this, "PrivateRouteTableAZ1", {
      vpcId: vpc.vpcId,
      tags: [{ key: "Name", value: "Private Route Table AZ1" }],
    });
    // Add routes to Route Tables
    new ec2.CfnRoute(this, "PrivateRouteAZ1", {
      routeTableId: routeTable1.ref,
      destinationCidrBlock: "0.0.0.0/0",
      natGatewayId: natGateway1.ref,
    });

    // Associate Route Tables with Subnets
    new ec2.CfnSubnetRouteTableAssociation(
      this,
      "PrivateAppSubnet1Association",
      {
        subnetId: privateAppSubnet1.ref,
        routeTableId: routeTable1.ref,
      }
    );

    new ec2.CfnSubnetRouteTableAssociation(
      this,
      "PrivateDataSubnet1Association",
      {
        subnetId: privateDataSubnet1.ref,
        routeTableId: routeTable1.ref,
      }
    );

    const eip2 = new ec2.CfnEIP(this, "NATGatewayEIP2");

    //---------Create NAT Gateways (2)--------------
    const natGateway2 = new ec2.CfnNatGateway(this, "NATGateway2", {
      subnetId: publicSubnet2.ref,
      allocationId: eip2.attrAllocationId,
      connectivityType: "public",
      tags: [{ key: "Name", value: "NAT Gateway AZ2" }],
    });

    //---------Create Private Route Table (2)--------------
    const routeTable2 = new ec2.CfnRouteTable(this, "PrivateRouteTableAZ2", {
      vpcId: vpc.vpcId,
      tags: [{ key: "Name", value: "Private Route Table AZ2" }],
    });

    new ec2.CfnRoute(this, "PrivateRouteAZ2", {
      routeTableId: routeTable2.ref,
      destinationCidrBlock: "0.0.0.0/0",
      natGatewayId: natGateway2.ref,
    });

    new ec2.CfnSubnetRouteTableAssociation(
      this,
      "PrivateAppSubnet2Association",
      {
        subnetId: privateAppSubnet2.ref,
        routeTableId: routeTable2.ref,
      }
    );

    new ec2.CfnSubnetRouteTableAssociation(
      this,
      "PrivateDataSubnet2Association",
      {
        subnetId: privateDataSubnet2.ref,
        routeTableId: routeTable2.ref,
      }
    );

    // ---------Security Groups-----------
    const albSecurityGroup = new ec2.SecurityGroup(this, "ALBSecurityGroup", {
      vpc,
    });
    Tags.of(albSecurityGroup).add("Name", "ALB Security Group");

    new cdk.CfnOutput(this, "albSecurityGroup", {
      value: albSecurityGroup.securityGroupId,
      exportName: "ALBSecurityGroup",
    });

    albSecurityGroup.addIngressRule(
      ec2.Peer.ipv4("0.0.0.0/0"),
      ec2.Port.tcp(80),
      "Allow HTTP traffic from anywhere"
    );
    albSecurityGroup.addIngressRule(
      ec2.Peer.ipv4("0.0.0.0/0"),
      ec2.Port.tcp(443),
      "Allow HTTPS traffic from anywhere"
    );

    const sshSecurityGroup = new ec2.SecurityGroup(this, "SecurityGroup_SSH", {
      vpc,
    });
    Tags.of(sshSecurityGroup).add("Name", "SSH Security Group");

    new cdk.CfnOutput(this, "SSHSecurityGroup", {
      value: sshSecurityGroup.securityGroupId,
      exportName: "SSHSecurityGroup",
    });

    const webserverSecurityGroup = new ec2.SecurityGroup(
      this,
      "SecurityGroup_WebServer",
      {
        vpc,
        allowAllOutbound: true,
        securityGroupName: "webserverSecurityGroup",
      }
    );
    Tags.of(webserverSecurityGroup).add("Name", "Web Server Security Group");
    webserverSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.tcp(80),
      "Allow HTTP traffic from ALB security group"
    );
    webserverSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.tcp(443),
      "Allow HTTPS traffic from ALB security group"
    );
    webserverSecurityGroup.addIngressRule(
      sshSecurityGroup,
      ec2.Port.tcp(22),
      "Allow SSH traffic from SSH security group"
    );

    new cdk.CfnOutput(this, "WebServerSecurityGroup", {
      value: webserverSecurityGroup.securityGroupId,
      exportName: "WebServerSecurityGroup",
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, "SecurityGroup_DB", {
      vpc,
      securityGroupName: "dbSecurityGroup",
    });
    Tags.of(dbSecurityGroup).add("Name", "Database Server Security Group");

    dbSecurityGroup.addIngressRule(
      sshSecurityGroup,
      ec2.Port.tcp(3306),
      "Allow MySQL traffic from SSH security group"
    );

    new cdk.CfnOutput(this, "DbServerSecurityGroup", {
      value: dbSecurityGroup.securityGroupId,
      exportName: "DbServerSecurityGroup",
    });


  }
}
