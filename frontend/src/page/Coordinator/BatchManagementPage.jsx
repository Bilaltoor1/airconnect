import { useState } from 'react';
import { useCreateBatch, useUpdateBatch, useRemoveBatch, useBatchSummary } from '@/hooks/useBatch';
import { Plus, PencilLine, Trash2, ChevronRight } from 'lucide-react';

const BatchManagementPage = () => {
    const { data: batchSummary, isLoading, error } = useBatchSummary();
    const createBatch = useCreateBatch();
    const updateBatch = useUpdateBatch();
    const removeBatch = useRemoveBatch();
    const [batchData, setBatchData] = useState({ name: '', batchId: '' });
    const [editingBatchId, setEditingBatchId] = useState(null);
    const [expandedBatch, setExpandedBatch] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBatchData({ ...batchData, [name]: value });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createBatch.mutate({ name: batchData.name });
        setBatchData({ name: '', batchId: '' });
    };

    const handleUpdate = (batchId) => {
        updateBatch.mutate({ batchId, batchData: { name: batchData.name } });
        setEditingBatchId(null);
        setBatchData({ name: '', batchId: '' });
    };

    const handleRemove = (batchId) => {
        if (window.confirm("Are you sure you want to delete this batch?")) {
            removeBatch.mutate(batchId);
        }
    };

    const handleToggleExpand = (batchId) => {
        setExpandedBatch(expandedBatch === batchId ? null : batchId);
    };

    if (isLoading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                <p>Error loading batch data. Please try again later.</p>
            </div>
        </div>
    );

    return (
        <div className="p-3 sm:p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                Batch Management
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-base-100 rounded-2xl shadow-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4">Create New Batch</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Batch Name</label>
                            <input
                                type="text"
                                name="name"
                                className="w-full py-2 sm:py-3 bg-base-100 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 px-3"
                                placeholder="Enter batch name (e.g., CSE 2023)"
                                value={batchData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 sm:py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Create Batch
                        </button>
                    </form>
                </div>

                <div className="bg-base-100 rounded-2xl shadow-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-xl shadow">
                            <h4 className="text-sm text-blue-800 font-medium">Total Batches</h4>
                            <p className="text-2xl sm:text-3xl font-bold text-blue-900">{batchSummary.length}</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-xl shadow">
                            <h4 className="text-sm text-green-800 font-medium">Total Students</h4>
                            <p className="text-2xl sm:text-3xl font-bold text-green-900">
                                {batchSummary.reduce((sum, batch) => sum + batch.studentCount, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile view: Card-based list */}
            <div className="mt-6 sm:mt-8 md:hidden">
                <h3 className="text-xl font-semibold mb-4">Batch List</h3>
                <div className="space-y-4">
                    {batchSummary.map((batch) => (
                        <div key={batch._id} className="bg-base-100 rounded-xl shadow-md p-4 border border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    {editingBatchId === batch._id ? (
                                        <input
                                            type="text"
                                            name="name"
                                            className="w-full py-2 bg-base-100 rounded-lg border border-green-500 focus:ring-2 focus:ring-green-500 px-3"
                                            value={batchData.name}
                                            onChange={handleChange}
                                            required
                                            autoFocus
                                        />
                                    ) : (
                                        <h4 className="font-semibold text-lg">{batch.name}</h4>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {editingBatchId === batch._id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdate(batch._id)}
                                                className="bg-green-500 text-white py-1 px-2 rounded-md text-sm"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingBatchId(null);
                                                    setBatchData({ name: '', batchId: '' });
                                                }}
                                                className="bg-gray-300 text-gray-700 py-1 px-2 rounded-md text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditingBatchId(batch._id);
                                                    setBatchData({ batchId: batch._id, name: batch.name });
                                                }}
                                                className="text-amber-600 hover:text-amber-800 transition-colors"
                                            >
                                                <PencilLine size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleRemove(batch._id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleToggleExpand(batch._id)}
                                        className={`transition-transform ${expandedBatch === batch._id ? 'rotate-90' : ''}`}
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 mb-2">
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    Students: {batch.studentCount}
                                </span>
                                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    Teachers: {batch.teacherCount}
                                </span>
                            </div>

                            {expandedBatch === batch._id && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-500 mr-2">Advisor:</span>
                                        <span className="text-sm">{batch.advisorName || "—"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {batchSummary.length === 0 && (
                        <div className="text-center py-8 text-gray-500 bg-base-100 rounded-xl shadow-md">
                            No batches found. Create your first batch above!
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop view: Table-based list */}
            <div className="mt-8 bg-base-100 rounded-2xl shadow-xl p-4 sm:p-6 hidden md:block">
                <h3 className="text-xl font-semibold mb-4">Batch List</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr className="text-xs font-medium uppercase tracking-wider">
                                <th className="px-6 py-3 rounded-tl-lg">Batch Name</th>
                                <th className="px-6 py-3">Students</th>
                                <th className="px-6 py-3">Teachers</th>
                                <th className="px-6 py-3">Advisor</th>
                                <th className="px-6 py-3 rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batchSummary.map((batch, index) => (
                                <tr
                                    key={batch._id}
                                    className={`text-sm ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''} hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingBatchId === batch._id ? (
                                            <input
                                                type="text"
                                                name="name"
                                                className="w-full py-2 bg-base-100 rounded-lg border border-green-500 focus:ring-2 focus:ring-green-500 px-3"
                                                value={batchData.name}
                                                onChange={handleChange}
                                                required
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="font-medium">{batch.name}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                            {batch.studentCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                            {batch.teacherCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium">{batch.advisorName || "—"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingBatchId === batch._id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdate(batch._id)}
                                                    className="bg-green-500 text-white py-1 px-3 rounded-md text-sm hover:bg-green-600 transition-colors"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingBatchId(null);
                                                        setBatchData({ name: '', batchId: '' });
                                                    }}
                                                    className="bg-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm hover:bg-gray-400 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingBatchId(batch._id);
                                                        setBatchData({ batchId: batch._id, name: batch.name });
                                                    }}
                                                    className="text-amber-600 hover:text-amber-800 transition-colors"
                                                >
                                                    <PencilLine size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(batch._id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {batchSummary.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No batches found. Create your first batch above!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BatchManagementPage;