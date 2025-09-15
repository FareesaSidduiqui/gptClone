import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

const connectingDB = function(){

    connectDB()
      .then(() => {
        console.log("congrats connection");
      })
      .catch((e) => {
        console.log("error in connecting mongodb", e);
      });
}

export default connectingDB