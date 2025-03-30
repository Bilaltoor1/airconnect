import { useState } from 'react';
import SignatureCanvasComponent from '../../components/SignatureCanvas';

const StudentApplicationsPage = () => {
    const [applications, setApplications] = useState([
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            studentId: '123456',
            reason: 'Leave of Absence',
            content: 'I need a leave of absence due to personal reasons.\n' +
                'To create a more advanced application form that resembles the template in the image you provided Make sure you have a signature component in place that can capture the signature:',
            advisorComments: '',
            teacherSignature: '',
            status: 'Pending' // Pending, Approved, NeedsCorrection
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            studentId: '654321',
            reason: 'Extension of Assignment Deadline',
            content: 'I need an extension for my assignment due to health issues.',
            advisorComments: '',
            teacherSignature: '',
            status: 'Pending'
        },
    ]);

    const handleTeacherSignature = (applicationId, signatureDataUrl) => {
        setApplications(applications.map(app =>
            app.id === applicationId ? { ...app, teacherSignature: signatureDataUrl, status: 'Approved' } : app
        ));
    };

    const handleAdvisorComment = (applicationId, comment) => {
        setApplications(applications.map(app =>
            app.id === applicationId ? { ...app, advisorComments: comment, status: 'NeedsCorrection' } : app
        ));
    };

    return (
        <div className="min-h-screen bg-base-100 p-4 ">
            <div className="max-w-4xl w-full mt-6 mx-auto p-4 bg-base-100 shadow-lg rounded-lg">
                <h2 className="text-2xl text-base-text font-bold mb-4">Student Applications</h2>
                {applications.map((application) => (
                    <div key={application.id} className="mb-8 p-4 bg-base-200 shadow rounded-lg">
                        <h3 className="text-xl font-bold mb-2">Application from: {application.name}</h3>
                        <p><strong>Email:</strong> {application.email}</p>
                        <p><strong>Student ID:</strong> {application.studentId}</p>
                        <p><strong>Reason:</strong> {application.reason}</p>
                        <p><strong>Content:</strong></p>
                        <div className='border w-full min-h-[300px] p-4'>
                            {application.content}
                        </div>
                        <div className="my-4">
                            <h4 className="text-lg font-semibold mb-2">Teacher's Signature:</h4>
                            {application.teacherSignature ? (
                                <img src={application.teacherSignature} alt="Teacher's Signature" />
                            ) : (
                                <SignatureCanvasComponent onSave={(signature) => handleTeacherSignature(application.id, signature)} />
                            )}
                        </div>

                        <div className="my-4">
                            <h4 className="text-lg font-semibold mb-2">Advisor's Comment:</h4>
                            <textarea
                                value={application.advisorComments}
                                onChange={(e) => handleAdvisorComment(application.id, e.target.value)}
                                className="w-full p-2 border rounded bg-base-200"
                                rows="4"
                                placeholder="Leave a comment or request correction..."
                            />
                        </div>

                        <p><strong>Status:</strong> {application.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentApplicationsPage;
