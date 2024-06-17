import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Tags } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { readFileSync } from "fs";
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
declare const asg: AutoScalingGroup;
import { aws_ec2 as ec2, aws_elasticloadbalancingv2 as elbv2, aws_route53 as route53, aws_route53_targets as targets } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';




export class Route53Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
       // Import the ALB security group
       const albSecurityGroupId = cdk.Fn.importValue("ALBSecurityGroup");
       const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
         this,
         "ALBSecurityGroup",
         albSecurityGroupId
       );

        // Import existing ALB
        const albCanonicalHostedZoneId = cdk.Fn.importValue('AlbCanonicalHosted');
        const albDnsName = cdk.Fn.importValue("AlbDnsName");

        const albArn = cdk.Fn.importValue('AlbArn');
        const alb = elbv2.ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(this, 'ImportedALB', {
            securityGroupId: albSecurityGroup.securityGroupId,
            loadBalancerDnsName: albDnsName,
            loadBalancerArn: albArn,
            loadBalancerCanonicalHostedZoneId: albCanonicalHostedZoneId,
          });
    const zoneName = "junaid.xyz";
    const hostedZone = new route53.HostedZone(this, "HostedZone", {
    zoneName: zoneName,
});

        // Create a new ACM certificate
        const certificate = new acm.Certificate(this, 'MyCertificate', {
            domainName: 'junaid.xyz',
            validation: acm.CertificateValidation.fromDns(hostedZone),
          });

          new cdk.CfnOutput(this, "Certificate", {
            value: certificate.certificateArn,
            exportName: "Certificate"
          })


    // Create the Route53 alias record
    new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        recordName: 'www',
        target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(alb)),
      });

  }
}