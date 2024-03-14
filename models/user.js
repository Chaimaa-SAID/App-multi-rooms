import mongoose from "mongoose";
import  passportLocalMongoose from 'passport-local-mongoose';

const User = new mongoose.Schema({
  username: String,
  password: String
});

User.plugin(passportLocalMongoose);

User.statics.getUserByIds = async function (ids) {
  try {
    const users = await this.find({ _id: { $in: ids } });
    return users;
  } catch (error) {
    throw error;
  }
}

const UserModel = mongoose.model("userData", User, 'userData');
export {UserModel}
export default UserModel;