'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AnalyticsDashboard() {
  const pathname = usePathname();

  const navItems = [
    { name: 'EC2', path: '/admin/analytics/ec2', active: pathname === '/admin/analytics/ec2' },
    { name: 'ECR', path: '/admin/analytics/ecr', active: pathname === '/admin/analytics/ecr' },
    { name: 'S3', path: '/admin/analytics/s3', active: pathname === '/admin/analytics/s3' },
    { name: 'ALB', path: '/admin/analytics/alb', active: pathname === '/admin/analytics/alb' },
    { name: 'ASG', path: '/admin/analytics/asg', active: pathname === '/admin/analytics/asg' },
    { name: 'Cost Metrics', path: '/admin/analytics/cost', active: pathname === '/admin/analytics/cost' },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white h-screen fixed left-0 top-0 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Analytics</h2>
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`block px-4 py-2 rounded ${
                      item.active ? 'bg-gray-700' : 'hover:bg-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6 space-y-8 flex-1">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Welcome to the Analytics Dashboard. Use the sidebar to navigate to specific metric categories.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/analytics/ec2" className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <h3 className="text-lg font-semibold text-blue-800">EC2 Metrics</h3>
              <p className="text-sm text-blue-600">CPU, Network, and Disk metrics for EC2 instances</p>
            </Link>
            
            <Link href="/admin/analytics/ecr" className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              <h3 className="text-lg font-semibold text-green-800">ECR Metrics</h3>
              <p className="text-sm text-green-600">Repository size and image count metrics</p>
            </Link>
            
            <Link href="/admin/analytics/s3" className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
              <h3 className="text-lg font-semibold text-purple-800">S3 Metrics</h3>
              <p className="text-sm text-purple-600">Storage and access metrics for S3 buckets</p>
            </Link>
            
            <Link href="/admin/analytics/alb" className="block p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
              <h3 className="text-lg font-semibold text-orange-800">ALB Metrics</h3>
              <p className="text-sm text-orange-600">Load balancer performance and traffic metrics</p>
            </Link>
            
            <Link href="/admin/analytics/asg" className="block p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
              <h3 className="text-lg font-semibold text-red-800">ASG Metrics</h3>
              <p className="text-sm text-red-600">Auto Scaling Group scaling and instance metrics</p>
            </Link>
            
            <Link href="/admin/analytics/cost" className="block p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
              <h3 className="text-lg font-semibold text-yellow-800">Cost Metrics</h3>
              <p className="text-sm text-yellow-600">AWS cost and billing analytics</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}