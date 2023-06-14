// import node modules
import mongoose, { Document, Types, Model, Schema } from "mongoose";
import { ExtractStatics, FinanceLog } from "../../defaults";

export interface IFinance extends Document, FinanceModel {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  year: string;
  finance: FinanceLog;
}

export class FinanceModel {
  static async getFinanceForUser(
    this: IFinanceModel,
    user: Types.ObjectId,
    year: string
  ): Promise<IFinance | null> {
    return await this.findOne({ user, year });
  }
}

// define a schema
const schema: Schema<IFinance, IFinanceModel> = new mongoose.Schema(
  {
    user: mongoose.Schema.Types.ObjectId,
    year: String,
    finance: {
      type: Object,
      default: {},
    },
  },
  { minimize: false }
);

schema.loadClass(FinanceModel);

interface IFinanceModel
  extends Model<IFinance, IFinanceModel>,
    ExtractStatics<typeof FinanceModel> {}

// compile model from schema
const Finance = mongoose.connection.model<IFinance, IFinanceModel>(
  "FinanceModel",
  schema
);
export default Finance;
