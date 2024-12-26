import { atom } from "nanostores";
import { User } from "../../lib/api/groups/user";

export const $currentUser = atom<User | null>(null);
