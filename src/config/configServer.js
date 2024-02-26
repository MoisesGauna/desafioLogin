import mongoose from "mongoose";
const URI="mongodb+srv://moisesagauna:admin123@cluster0.tkrlcyj.mongodb.net/?retryWrites=true&w=majority"
 

const connectToDB = () => {
    try {
        mongoose.connect(URI)
        console.log('connected to DB ecommerce')
    } catch (error) {
        console.log(error);
    }
};

export default connectToDB