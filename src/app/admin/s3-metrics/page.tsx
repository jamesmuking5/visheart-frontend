'use client';

import React from 'react';
import S3MetricsDashboard from '@/components/S3MetricsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function S3MetricsPage() {
  return (
    <div className="container mx-auto">
      <S3MetricsDashboard />
    </div>
  );
}