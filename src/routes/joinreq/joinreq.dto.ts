import { createZodDto } from "nestjs-zod";
import { CreateJoinreqReqSchema, JoinreqResSchema, LeaveClrSchema } from "./joinreq.model";

export class JoinreqResDto extends createZodDto(JoinreqResSchema) {}

export class CreateJoinreqReqDto extends createZodDto(CreateJoinreqReqSchema) {}

export class LeaveClrDto extends createZodDto(LeaveClrSchema) {}