import mongoose from 'mongoose';

const connectToDB = async () => {
    try {
        const connection = await mongoose.connect('mongodb://localhost:27017/UserRole')
        console.log(`MongoDB connected: ${connection.connection.host}`)
    } catch (error) {
        console.log(`Error: ${error.message}`)
        process.exit(1)
    }
}

export default connectToDB