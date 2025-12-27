import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
        <table
          className={cn('w-full border-collapse', className)}
          {...props}
        />
      </div>
    </div>
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn('bg-church-blue text-white', className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn('bg-white divide-y divide-gray-200', className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  // Se a linha já tem hover definido ou cor de fundo específica, não adicionar o padrão
  const hasCustomHover = className?.includes('hover:');
  const hasBgColor = className?.includes('bg-') && !className?.includes('bg-white');
  return (
    <tr
      className={cn(
        !hasCustomHover && !hasBgColor && 'hover:bg-gray-50', 
        'transition-colors', 
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  // Não aplicar hover se já tiver uma cor de fundo definida
  const hasBgColor = className?.includes('bg-');
  return (
    <th
      className={cn(
        'px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap',
        !hasBgColor && 'hover:bg-church-blue', // Apenas aplicar hover se não tiver cor de fundo
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement> & { colSpan?: number }) {
  // Não aplicar hover se a célula estiver em uma linha com cor de fundo específica
  const hasBgColor = className?.includes('bg-');
  return (
    <td
      className={cn(
        'px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700',
        !hasBgColor && 'hover:bg-transparent', // Prevenir hover indesejado
        className
      )}
      {...props}
    />
  );
}

