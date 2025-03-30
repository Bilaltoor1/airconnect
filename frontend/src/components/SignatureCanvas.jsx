import  { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignatureCanvasComponent = ({ onClear }) => {
    const sigCanvas = useRef({});

    const clear = () => {
        sigCanvas.current.clear();
        if (onClear) onClear();
    };

    return (
        <div className="mt-4">
            <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ className: 'signature-canvas border border-gray-300 w-full h-48' }}
            />
            <button onClick={clear} className="btn btn-secondary mt-2">Clear</button>
        </div>
    );
};

export default SignatureCanvasComponent;
