import { createZodDto } from "nestjs-zod";
import { UpdateClrStdSchema } from "./clrstd.model";

export class UpdateClrStdDto extends createZodDto(UpdateClrStdSchema) {}