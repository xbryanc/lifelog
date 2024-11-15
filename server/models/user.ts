// import node modules
import mongoose, { Document, Types, Model, Schema } from "mongoose";
import { ExtractStatics, Subscription, GoalsList, Friend } from "../../defaults";

export interface IUser extends Document, UserModel {
  _id: Types.ObjectId;
  name: string;
  googleid: string;
  tags: string[];
  subscriptions: Subscription[];
  goals: GoalsList;
  friends: Friend[];
}

export class UserModel {
  static serializeUser(this: IUserModel) {
    return (
      user: IUser,
      done: (error?: any, id?: string | undefined) => void
    ) => {
      return done(null, user.id);
    };
  }

  static deserializeUser(this: IUserModel) {
    return (
      userId: string,
      done: (error?: any, user?: IUser | undefined) => void
    ) => {
      return this.findById(userId, done);
    };
  }
}

// define a schema
const schema: Schema<IUser, IUserModel> = new mongoose.Schema(
  {
    name: String,
    googleid: String,
    tags: [String],
    subscriptions: [
      {
        start: String,
        end: String,
        frequency: String,
        frequencyGap: Number,
        cost: Number,
        description: String,
        location: String,
        tags: [String],
      },
    ],
    goals: {
      type: Object,
      default: {},
    },
    friends: [{
      name: String,
      lastUpdated: String,
    }],
  },
  { minimize: false }
);

schema.loadClass(UserModel);

interface IUserModel
  extends Model<IUser, IUserModel>,
    ExtractStatics<typeof UserModel> {}

// compile model from schema
const User = mongoose.connection.model<IUser, IUserModel>("UserModel", schema);
export default User;
