import { IUser } from "./server/models/user";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}
