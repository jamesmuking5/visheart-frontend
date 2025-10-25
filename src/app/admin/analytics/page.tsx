'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Cloud,
  Database,
  HardDrive,
  Network,
  TrendingUp,
  DollarSign,
  Activity,
  Server,
  Container,
  Shield
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const pathname = usePathname();

  const navItems = [
    { name: 'EC2', path: '/admin/analytics/ec2', active: pathname === '/admin/analytics/ec2', icon: Server, color: 'text-orange-400' },
    { name: 'ECR', path: '/admin/analytics/ecr', active: pathname === '/admin/analytics/ecr', icon: Container, color: 'text-blue-400' },
    { name: 'S3', path: '/admin/analytics/s3', active: pathname === '/admin/analytics/s3', icon: HardDrive, color: 'text-green-400' },
    { name: 'ALB', path: '/admin/analytics/alb', active: pathname === '/admin/analytics/alb', icon: Network, color: 'text-purple-400' },
    { name: 'ASG', path: '/admin/analytics/asg', active: pathname === '/admin/analytics/asg', icon: Activity, color: 'text-red-400' },
    { name: 'Cost Metrics', path: '/admin/analytics/cost', active: pathname === '/admin/analytics/cost', icon: DollarSign, color: 'text-yellow-400' },
  ];

  const serviceCards = [
    {
      title: 'EC2 Instances',
      description: 'Monitor CPU utilization, network traffic, and disk I/O for your EC2 instances',
      path: '/admin/analytics/ec2',
      icon: Server,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      metrics: ['CPU Utilization', 'Network In/Out', 'Disk Read/Write']
    },
    {
      title: 'ECR Repositories',
      description: 'Track repository pull counts and image deployment metrics',
      path: '/admin/analytics/ecr',
      icon: Container,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      metrics: ['Pull Count', 'Repository Activity', 'Image Deployments']
    },
    {
      title: 'S3 Storage',
      description: 'Analyze bucket size, object counts, and data transfer patterns',
      path: '/admin/analytics/s3',
      icon: HardDrive,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      metrics: ['Bucket Size', 'Object Count', 'Data Transfer']
    },
    {
      title: 'Load Balancers',
      description: 'Monitor ALB performance, request counts, and response times',
      path: '/admin/analytics/alb',
      icon: Network,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      metrics: ['Request Count', 'Response Time', 'Error Rates']
    },
    {
      title: 'Auto Scaling',
      description: 'Track ASG scaling activities and instance lifecycle metrics',
      path: '/admin/analytics/asg',
      icon: Activity,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      metrics: ['Group Size', 'Scaling Events', 'Instance Health']
    },
    {
      title: 'Cost Analytics',
      description: 'Monitor AWS spending patterns and cost optimization opportunities',
      path: '/admin/analytics/cost',
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      metrics: ['Service Costs', 'Usage Trends', 'Budget Alerts']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* AWS-style Header */}
      <div className="bg-[#232F3E] text-white shadow-lg -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Cloud className="h-8 w-8 text-[#FF9900]" />
              <div>
                <h1 className="text-xl font-semibold">AWS Analytics Dashboard</h1>
                <p className="text-sm text-gray-300">Monitor your cloud infrastructure</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-sm text-green-400">Secure</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* AWS-style Sidebar */}
        <div className="w-56 bg-[#1A202C] text-white min-h-screen shadow-xl">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="h-5 w-5 text-[#FF9900]" />
              <h2 className="text-lg font-semibold">Services</h2>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      item.active
                        ? 'bg-[#FF9900] text-[#232F3E] shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${item.active ? 'text-[#232F3E]' : item.color}`} />
                    {item.name}
                    {item.active && (
                      <div className="ml-auto w-2 h-2 bg-[#232F3E] rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* AWS Status Indicator */}
            <div className="mt-8 p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300">All services operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 pl-6 pr-6">
          <div className="w-full">
            {/* Breadcrumb */}
            <nav className="flex mb-6 mt-6" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/admin" className="text-[#FF9900] hover:text-[#FF9900]/80 transition-colors">
                    Admin
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Analytics Dashboard</span>
                </li>
              </ol>
            </nav>

            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600 text-lg">
                Monitoring and analytics for the AWS infrastructure and services
              </p>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCards.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.title}
                    href={service.path}
                    className="group block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="p-6">
                      {/* Service Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${service.color} shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-gray-500">Active</span>
                        </div>
                      </div>

                      {/* Service Content */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#FF9900] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {service.description}
                      </p>

                      {/* Metrics Preview */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Key Metrics</p>
                        <div className="flex flex-wrap gap-1">
                          {service.metrics.map((metric) => (
                            <span
                              key={metric}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Indicator */}
                      <div className="mt-4 flex items-center text-[#FF9900] group-hover:text-[#FF9900]/80 transition-colors">
                        <span className="text-sm font-medium">View Details</span>
                        <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* AWS-style Footer Info */}
            <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-[#FF9900]" />
                    <span className="text-sm font-medium text-gray-900">Real-time Monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">CloudWatch Integration</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}