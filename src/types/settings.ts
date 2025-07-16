import { UserPreferences } from "./user";

export interface UserSettings {
  displayName?: string;
  preferences: UserPreferences;
}
