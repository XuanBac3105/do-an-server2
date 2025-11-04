import z from "zod";
import { ClassroomWithStdJreqSchema } from "./classroom.model";

export type ClassroomWithStdJreqType = z.infer<typeof ClassroomWithStdJreqSchema>;