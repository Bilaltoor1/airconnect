import mongoose from "mongoose";

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    recipient: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    type: { 
        type: String, 
        enum: ['announcement', 'job', 'comment', 'system', 'application_submitted', 'application_advisor_action', 'application_coordinator_action'], 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    relatedId: { 
        type: Schema.Types.ObjectId 
    },
    read: { 
        type: Boolean, 
        default: false 
    },
    created: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
