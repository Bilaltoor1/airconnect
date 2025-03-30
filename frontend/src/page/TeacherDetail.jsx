import {useParams} from "react-router-dom";

function TeacherDetail() {
    const {id} = useParams();

    return (
        <div>
            <h1>Teacher Detail</h1>
            <p>Teacher ID: {id}</p>
            <button className="btn btn-primary">Button</button>
        </div>
    );
}

export default TeacherDetail;