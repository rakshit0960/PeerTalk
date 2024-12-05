import { userSearchSchema } from "@/schema/user-search";
import { z } from "zod";

export type UserSearchResult = z.infer<typeof userSearchSchema>;
