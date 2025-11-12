import { ExSubmissionResType } from "../dtos/responses/ex-submissson-res.dto";
import { SubmitExReqType } from "../dtos/requests/submit-ex-req.dto";
import { GradeSubmissionReqType } from "../dtos/requests/grade-submission-req.dto";

export interface IExerciseSubmissionService {
    submit(studentId: number, data: SubmitExReqType): Promise<ExSubmissionResType>;
    deleteSubmission(studentId: number, submissionId: number): Promise<{ message: string }>;
    getSubmissionsByLessonId(lessonId: number): Promise<ExSubmissionResType[]>;
    gradeSubmission(submissionId: number, data: GradeSubmissionReqType): Promise<ExSubmissionResType>;
}
