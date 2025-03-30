import { useBatches } from '../hooks/useBatch.js';
import { School } from 'lucide-react';

const BatchSelect = ({ batchId, setBatchId, errors }) => {
    const { data: batchesData, isLoading: batchesLoading } = useBatches();

    return (
        <div>
            <label className="block text-sm font-medium mb-1">Batch</label>
            <div className="relative">
                <select
                    className="w-full py-3 bg-base-100 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 px-3 pr-8 appearance-none text-base-text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                >
                    <option value="" disabled>Select Batch</option>
                    {batchesLoading ? (
                        <option>Loading...</option>
                    ) : (
                        batchesData.map((batch) => (
                            <option key={batch._id} value={batch._id}>
                                {batch.name}
                            </option>
                        ))
                    )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <School size={18} className="text-gray-500" />
                </div>
            </div>
            {errors && errors.batchId && <p className="text-red-500 text-xs mt-1">{errors.batchId._errors[0]}</p>}
        </div>
    );
};

export default BatchSelect;