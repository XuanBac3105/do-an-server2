import { AssignLectureReqType } from '../dtos/requests/assign-lecture.dto'
import { AssignExerciseReqType } from '../dtos/requests/assign-exercise.dto'
import { AssignQuizReqType } from '../dtos/requests/assign-quiz.dto'
import { LessonLectureResType } from '../dtos/responses/lesson-lecture-res.dto'
import { LessonExerciseResType } from '../dtos/responses/lesson-exercise-res.dto'
import { LessonQuizResType } from '../dtos/responses/lesson-quiz-res.dto'
import { GetLessonsByClassroomQueryType } from '../dtos/queries/get-lessons-by-classroom.query'
import { LessonsListResType } from '../dtos/responses/lesson-with-details-res.dto'

export interface ILessonService {
    assignLecture(body: AssignLectureReqType): Promise<LessonLectureResType>
    assignExercise(body: AssignExerciseReqType): Promise<LessonExerciseResType>
    assignQuiz(body: AssignQuizReqType): Promise<LessonQuizResType>
    getLessonsByClassroom(query: GetLessonsByClassroomQueryType): Promise<LessonsListResType>
}
