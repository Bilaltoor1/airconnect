import { useParams, Link } from 'react-router-dom';
import {
    useBatchDetails,
    useRemoveStudentFromBatch,
    useRemoveTeacherFromBatch
} from '../../hooks/useBatch';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { UserX, ArrowLeft, Users, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const studentColumns = (handleRemoveStudent) => [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'rollNo',
        header: 'Roll No',
    },
    {
        accessorKey: 'section',
        header: 'Section',
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({row}) => (
            <button 
                onClick={() => handleRemoveStudent(row.original._id)} 
                className="flex items-center gap-1.5 text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-100 hover:bg-red-100 transition-colors"
            >
                <UserX size={14} />
                <span className="text-xs font-medium">Remove</span>
            </button>
        ),
    },
];

const teacherColumns = (handleRemoveTeacher) => [
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
        cell: ({row}) => (
            <button 
                onClick={() => handleRemoveTeacher(row.original._id)} 
                className="flex items-center gap-1.5 text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-100 hover:bg-red-100 transition-colors"
            >
                <UserX size={14} />
                <span className="text-xs font-medium">Remove</span>
            </button>
        ),
    },
];

const DataTable = ({columns, data, emptyMessage}) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id}
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 text-sm text-gray-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500">
                                    {emptyMessage || "No records found."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BatchDetailsPage = () => {
    const {batchId} = useParams();
    const {data: batch, isLoading, error} = useBatchDetails(batchId);
    const removeStudentFromBatch = useRemoveStudentFromBatch();
    const removeTeacherFromBatch = useRemoveTeacherFromBatch();

    if (isLoading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                <p>Error loading batch details. Please try again later.</p>
            </div>
        </div>
    );

    const handleRemoveStudent = (studentId) => {
        if(window.confirm("Are you sure you want to remove this student from the batch?")) {
            removeStudentFromBatch.mutate(
                {studentId, batchId}, 
                {
                    onSuccess: () => toast.success("Student removed successfully"),
                    onError: (err) => toast.error(err.message || "Failed to remove student")
                }
            );
        }
    };

    const handleRemoveTeacher = (teacherId) => {
        if(window.confirm("Are you sure you want to remove this teacher from the batch?")) {
            removeTeacherFromBatch.mutate(
                {teacherId, batchId},
                {
                    onSuccess: () => toast.success("Teacher removed successfully"),
                    onError: (err) => toast.error(err.message || "Failed to remove teacher")
                }
            );
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <Link 
                        to="/batches" 
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Batches</span>
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                        {batch.name}
                    </h1>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                    <Link 
                        to="/add-teacher" 
                        className="flex items-center gap-2 py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                        <Users size={18} />
                        Add Teacher
                    </Link>
                    <Link 
                        to="/add-student" 
                        className="flex items-center gap-2 py-2 px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                    >
                        <UserPlus size={18} />
                        Add Student
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-base-100 rounded-2xl shadow-lg p-6 lg:col-span-3">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                        <h2 className="text-xl font-bold mb-4 md:mb-0">Batch Information</h2>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Students:</span>
                                <span className="bg-purple-100 text-purple-800 text-xs font-medium py-1 px-2 rounded-full">
                                    {batch.students.length}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Teachers:</span>
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium py-1 px-2 rounded-full">
                                    {batch.teachers.length}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Advisor</p>
                                <p className="font-medium">
                                    {batch.advisor ? batch.advisor.name : "No advisor assigned"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Created On</p>
                                <p className="font-medium">
                                    {new Date(batch.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">Teachers</h2>
                    <DataTable
                        columns={teacherColumns(handleRemoveTeacher)}
                        data={batch.teachers}
                        emptyMessage="No teachers assigned to this batch yet."
                    />
                </section>
                
                <section>
                    <h2 className="text-xl font-semibold mb-4">Students</h2>
                    <DataTable
                        columns={studentColumns(handleRemoveStudent)}
                        data={batch.students}
                        emptyMessage="No students assigned to this batch yet."
                    />
                </section>
            </div>
        </div>
    );
};

export default BatchDetailsPage;