'use client';

import { formatDate } from '@/lib/utils';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-church-dark">{title}</h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs sm:text-sm text-gray-500">{formatDate(new Date())}</p>
        </div>
      </div>
    </div>
  );
}

