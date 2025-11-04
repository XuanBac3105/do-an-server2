import { createZodDto } from "nestjs-zod";
import { GetIdParam } from "../params/get-id.param";

export class GetIdParamDto extends createZodDto(GetIdParam) {}