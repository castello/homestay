'use client';

import { useState, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onRowClick?: (item: T) => void;
  loading?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  searchPlaceholder = '검색...',
  onSearch,
  onRowClick,
  loading = false,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = () => {
    onSearch?.(searchQuery);
  };

  return (
    <div className="space-y-4">
      {onSearch && (
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>검색</Button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-400">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-400">
                  데이터가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, idx) => (
                <TableRow
                  key={idx}
                  className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            총 {total}건 중 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}건
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
