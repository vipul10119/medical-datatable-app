import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { mockMedicalData } from '../data/mockMedicalData';
import './DataTable.css';

const MedicalDataTable = () => {
  const [data] = useState(mockMedicalData);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getDepartmentClass = (department) => {
    const dept = department.toLowerCase();
    if (dept.includes('cardiology')) return 'department-cardiology';
    if (dept.includes('surgery')) return 'department-surgery';
    if (dept.includes('neurology')) return 'department-neurology';
    if (dept.includes('oncology')) return 'department-oncology';
    if (dept.includes('orthopedics')) return 'department-orthopedics';
    return '';
  };

  const getStatusClass = (status) => {
    const stat = status.toLowerCase();
    if (stat.includes('critical')) return 'status-critical';
    if (stat.includes('treatment')) return 'status-treatment';
    if (stat.includes('stable')) return 'status-stable';
    return 'status-default';
  };

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
        size: 48,
      },
      {
        accessorKey: 'patientId',
        header: 'ID',
        cell: info => <span className="patient-id">{info.getValue()}</span>,
        size: 80,
      },
      {
        accessorKey: 'firstName',
        header: 'FIRST NAME',
        cell: info => info.getValue(),
        size: 120,
      },
      {
        accessorKey: 'lastName',
        header: 'LAST NAME',
        cell: info => info.getValue(),
        size: 120,
      },
      {
        accessorKey: 'age',
        header: 'AGE',
        cell: info => info.getValue(),
        size: 80,
      },
      {
        accessorKey: 'diagnosis',
        header: 'DIAGNOSIS',
        cell: info => info.getValue(),
        size: 180,
      },
      {
        accessorKey: 'doctor',
        header: 'DOCTOR',
        cell: info => info.getValue(),
        size: 160,
      },
      {
        accessorKey: 'status',
        header: 'STATUS',
        cell: info => {
          const status = info.getValue();
          const statusClass = getStatusClass(status);
          return <span className={`status-badge ${statusClass}`}>{status}</span>;
        },
        size: 140,
      },
      {
        accessorKey: 'department',
        header: 'DEPARTMENT',
        cell: info => {
          const department = info.getValue();
          const deptClass = getDepartmentClass(department);
          return <span className={`department-badge ${deptClass}`}>{department}</span>;
        },
        size: 140,
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesDepartment = !departmentFilter || item.department === departmentFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesDepartment && matchesStatus;
    });
  }, [data, departmentFilter, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      sorting,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const uniqueDepartments = [...new Set(data.map(item => item.department))];
  const uniqueStatuses = [...new Set(data.map(item => item.status))];

  return (
    <div className="table-container">
      <div className="header-section">
        <h1 className="table-title">Medical Patient Records</h1>
        <p className="table-subtitle">Manage and view patient information, medical records, and treatment status</p>
      </div>
      
      <div className="controls-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search patients..."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <button className="columns-button">
            👁️ Columns
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    style={{ 
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      width: header.getSize()
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getCanSort() && (
                      <span className="sort-indicator">
                        {{
                          asc: '↑',
                          desc: '↓',
                        }[header.column.getIsSorted()] ?? '↕'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-title">No patients found</div>
                  <div className="empty-state-description">
                    Try adjusting your search or filter criteria
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination">
          <div className="pagination-info">
            Showing {table.getRowModel().rows.length} of {filteredData.length} results
            {Object.keys(rowSelection).length > 0 && (
              <span> • {Object.keys(rowSelection).length} selected</span>
            )}
          </div>
          
          <div className="pagination-controls">
            <button
              className="pagination-button"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              ⟪
            </button>
            <button
              className="pagination-button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ⟨
            </button>
            
            <span style={{ margin: '0 8px', fontSize: '14px', color: '#6b7280' }}>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            
            <button
              className="pagination-button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              ⟩
            </button>
            <button
              className="pagination-button"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              ⟫
            </button>
            
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="page-size-select"
            >
              {[10, 20, 30, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalDataTable;
