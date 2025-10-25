'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ASGAnalytics() {
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
        <h1 className="text-2xl font-bold">ASG Analytics</h1>
        <div className="text-gray-500">
          ASG metrics will be available soon.
        </div>
      </div>
    </div>
  );
}