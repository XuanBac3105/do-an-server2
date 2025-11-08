import { ResponseMessage } from "src/shared/types/response-message.type";
import { UpdateClrStdType } from "../dtos/requests/update-clrstd.dto";

export interface IClrstdService {
    deactivate(body: UpdateClrStdType): Promise<ResponseMessage>;
    activate(body: UpdateClrStdType): Promise<ResponseMessage>;
    deleteStudent(body: UpdateClrStdType): Promise<ResponseMessage>;
}
