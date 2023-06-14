// import node modules
import mongoose, { Document, Types, Model, Schema } from "mongoose";
import { ExtractStatics, Diary } from "../../defaults";

export interface IDiary extends Document, DiaryModel {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  year: string;
  diary: Diary;
}

export class DiaryModel {
  static async getDiaryForUser(
    this: IDiaryModel,
    user: Types.ObjectId,
    year: string
  ): Promise<IDiary | null> {
    return await this.findOne({ user, year });
  }
}

// define a schema
const schema: Schema<IDiary, IDiaryModel> = new mongoose.Schema(
  {
    user: mongoose.Schema.Types.ObjectId,
    year: String,
    diary: {
      type: Object,
      default: {},
    },
  },
  { minimize: false }
);

schema.loadClass(DiaryModel);

interface IDiaryModel
  extends Model<IDiary, IDiaryModel>,
    ExtractStatics<typeof DiaryModel> {}

// compile model from schema
const Diary = mongoose.connection.model<IDiary, IDiaryModel>(
  "DiaryModel",
  schema
);
export default Diary;
