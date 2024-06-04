#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WoocommerceInfraStack } from '../lib/woocommerce_infra-stack';

const app = new cdk.App();
new WoocommerceInfraStack(app, 'WoocommerceInfraStack');
