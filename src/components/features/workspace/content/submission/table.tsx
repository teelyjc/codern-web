import { Button } from '@/components/common/button';
import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filer';
import { DataTablePagination } from '@/components/common/data-table-pagination';
import { Image } from '@/components/common/image';
import { SearchInput } from '@/components/common/search-input';
import { Skeleton } from '@/components/common/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/table';
import { SubmissionCodeView } from '@/components/features/assignment/submission-code-view';
import { useWorkspaceParams } from '@/hooks/router-hook';
import { useGetAssignmentQuery, useListSubmission } from '@/hooks/workspace-hook';
import { formatDate } from '@/libs/utils';
import { Submission } from '@/types/workspace-type';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CircleIcon, Loader2Icon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

const statuses = [
  {
    value: 'TODO',
    label: 'Todo',
    icon: <CircleIcon className="h-2 w-2 fill-yellow-400 stroke-none" />,
  },
  {
    value: 'GRADING',
    label: 'Grading',
    icon: <CircleIcon className="h-2 w-2 fill-muted-foreground stroke-none" />,
  },
  {
    value: 'INCOMPLETED',
    label: 'Failed',
    icon: <CircleIcon className="h-2 w-2 fill-danger stroke-none" />,
  },
  {
    value: 'COMPLETED',
    label: 'Passed',
    icon: <CircleIcon className="h-2 w-2 fill-green-400 stroke-none" />,
  },
];

const getColumns: (maxScore: number) => ColumnDef<Submission>[] = (maxScore: number) => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => row.original.id.toString(),
  },
  {
    accessorKey: 'submitterName',
    header: 'Submitter name',
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <Image
          src={row.original.submitterProfileUrl}
          alt=""
          className="h-7 w-7 rounded-full"
        />
        <span className="font-medium">{row.original.submitterName}</span>
      </div>
    ),
  },
  {
    accessorKey: 'language',
    header: 'Language',
    cell: ({ row }) => row.original.language,
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => row.original.score + '/' + maxScore,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = statuses.find((status) => status.value === row.original.status);
      if (!status) return null;
      return (
        <div className="flex items-center space-x-2">
          {status.icon}
          <span className="capitalize">{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'submittedAt',
    header: 'Submitted at',
    cell: ({ row }) => formatDate(row.original.submittedAt, 'd MMM yy pp'),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return <SubmissionCodeView submission={row.original} />;
    },
  },
];

export const SubmissionTable = () => {
  const { workspaceId, assignmentId } = useWorkspaceParams();
  const { data: submissions, isLoading } = useListSubmission(workspaceId, assignmentId, true);
  const { data: assignment } = useGetAssignmentQuery(workspaceId, assignmentId);

  const columns = useMemo(() => (assignment ? getColumns(assignment.maxScore) : []), [assignment]);
  const data = useMemo(
    () => submissions?.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()) || [],
    [submissions],
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="container space-y-4 py-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <h3 className="mb-4 text-lg font-medium md:mb-0">Submission</h3>
        <div className="flex flex-row-reverse space-x-2 space-x-reverse md:flex-row md:space-x-2">
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetColumnFilters()}
            >
              Reset
              <XIcon className="ml-2 h-4 w-4" />
            </Button>
          )}

          {columns.length !== 0 ? (
            <>
              <DataTableFacetedFilter
                column={table.getColumn('status')}
                title="Status"
                options={statuses}
                align="end"
              />

              <SearchInput
                type="search"
                className="h-9 w-64 py-0"
                placeholder="Search by submitter name"
                value={(table.getColumn('submitterName')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('submitterName')?.setFilterValue(event.target.value)
                }
              />

              <SearchInput
                type="search"
                className="h-9 py-0"
                placeholder="Search by id"
                value={(table.getColumn('id')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('id')?.setFilterValue(event.target.value)}
              />
            </>
          ) : (
            <Skeleton className="h-9 w-64" />
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => {}}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center text-sm text-muted-foreground">
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> Loading
                      </div>
                    ) : (
                      'No results'
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
};
