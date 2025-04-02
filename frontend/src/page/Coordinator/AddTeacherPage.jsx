import { useState } from 'react';
import { useBatches, useAddTeacherToBatch } from '@/hooks/useBatch.js';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useGetTeachers } from '@/hooks/useAuth.js';
import toast from 'react-hot-toast';
import { UserPlus, ArrowLeft, School, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const teacherColumns = (handleAddTeacher, selectedBatchId) => [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'section',
        header: 'Section',
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <button 
                onClick={() => handleAddTeacher(row.original._id)} 
                disabled={!selectedBatchId}
                className={`flex items-center gap-1 ${
                    !selectedBatchId 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                } px-2 sm:px-3 py-1.5 rounded-full border transition-colors`}
            >
                <UserPlus size={14} />
                <span className="text-xs font-medium hidden sm:inline">Add to Batch</span>
                <span className="text-xs font-medium sm:hidden">Add</span>
            </button>
        ),
    },
];

const DataTable = ({ columns, data, filterValue, setFilterValue }) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Filter teachers that match the search term
    const filteredData = filterValue 
        ? data.filter(teacher => 
            teacher.name.toLowerCase().includes(filterValue.toLowerCase()) || 
            teacher.email.toLowerCase().includes(filterValue.toLowerCase()) ||
            teacher.section?.toLowerCase().includes(filterValue.toLowerCase())
          )
        : data;

    return (
        <div className="space-y-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search teachers..."
                    value={filterValue}
                    onChange={e => setFilterValue(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 bg-base-100 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th 
                                            key={header.id} 
                                            className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        >
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredData.length ? (
                                filteredData.map((row, i) => (
                                    <tr key={row._id || i} className="hover:bg-gray-50 transition-colors">
                                        {columns.map((column, columnIndex) => (
                                            <td key={columnIndex} className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 truncate max-w-[150px] sm:max-w-none">
                                                {column.accessorKey ? row[column.accessorKey] : flexRender(column.cell, { row: { original: row } })}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500">
                                        No teachers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AddTeacherPage = () => {
    const { data: batches, isLoading: isLoadingBatches, error: errorBatches } = useBatches();
    const { data: teachers, isLoading: isLoadingTeachers, error: errorTeachers } = useGetTeachers();
    const addTeacherToBatch = useAddTeacherToBatch();
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [filterValue, setFilterValue] = useState('');

    const handleAddTeacher = (teacherId) => {
        if (selectedBatchId) {
            addTeacherToBatch.mutate(
                { teacherId, batchId: selectedBatchId },
                {
                    onError: (error) => {
                        toast.error('Teacher is already added to this batch');
                        console.error(error)
                    },
                    onSuccess: () => {
                        toast.success('Teacher added successfully');
                    }
                }
            );
        } else {
            toast.error('Please select a batch first');
        }
    };

    if (isLoadingBatches || isLoadingTeachers) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
    
    if (errorBatches || errorTeachers) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                <p>Error loading data. Please try again later.</p>
            </div>
        </div>
    );

    return (
        <div className="p-3 sm:p-6 max-w-6xl mx-auto">
            <div className="mb-6 sm:mb-8">
                <Link 
                    to="/batches" 
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Batches</span>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                    Add Teachers to Batch
                </h1>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Select Batch</h2>
                <div className="relative">
                    <select
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                        className="w-full py-2 sm:py-3 bg-base-100 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3 pr-8 appearance-none"
                    >
                        <option value="">Select a batch</option>
                        {batches.map(batch => (
                            <option key={batch._id} value={batch._id}>{batch.name}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <School size={18} className="text-gray-500" />
                    </div>
                </div>
                {!selectedBatchId && (
                    <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                        Please select a batch to add teachers
                    </p>
                )}
            </div>

            <div className="bg-base-100 rounded-2xl shadow-xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Available Teachers</h2>
                <DataTable
                    columns={teacherColumns(handleAddTeacher, selectedBatchId)}
                    data={teachers}
                    filterValue={filterValue}
                    setFilterValue={setFilterValue}
                />
            </div>
        </div>
    );
};

export default AddTeacherPage;