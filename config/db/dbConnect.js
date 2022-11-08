const mongoose = require("mongoose")

const dbConnect = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URI)
        console.log(`db connected : ${connection.host}`);
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = dbConnect