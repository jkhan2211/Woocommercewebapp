# 3-Tier Wordpress Woocommerce Website on AWS
Description: The Application Engineering team has been developing a custom WooCommerce-based product which will need to be deployed for this initiative. As a member of the DevOps Engineering team your job will be to create the cloud-based infrastructure for supporting this deployment. You will need to create a reference architecture and implement it using modern IaC techniques with documentation for 3-tier application

# Tech Stack project reference architecture
![1 _Architecture](architecture_v1_0.png)

1. **VPC** with public and private subnets in 2 availability zone

2. An **Internet Gateway** is used to allow communication between instances VPC and Internet

3. 2 **availability zone** provides high availability and fault tolerance

4. **Public Subnets** are for resources such as Nat Gateway, Bastion Host, and Application Load Balancer

5. Web server and database server are in the **Private Subnets** for enhanced security

6. The **NAT Gateway** allow the instance in the private App subnets and private Data subnets to access internet

7. **MYSQL RDS Database** used for this solution

8. **EC2 Instance** to host Wordpress Instance (with Woo-commerce plugin) 

9. **Application Load Balancer** helps distribute web traffic across Auto scaling group of EC2 instances in multiple AZs

10. Using **Auto Scaling Group** to dynamically create our EC2 instances to make our website highly available, scalable, fault-tolerant and elastic 

11. Using **Route 53** to register domain name and create a record set

12. **AWS S3** to store webfiles 

13. **IAM Roles** to give EC2 Permission to download webfiles from AWS S3

14. **AMI** for the installed website on an EC2 Instance

15. Content of **Wordpress** and **woocommerce** is displayed on website


In a 3 tier vpc reference architecture, the infrastructure is divided in 3 tiers. 

1st-tier: contains public subnet, nat gateway, bastion host and load balancer

2nd-tier: contains private subnet which hold the webservers(ec2 instance)

3rd-tier: contains private subnet, which holds the database

Added: internet gateway and route table