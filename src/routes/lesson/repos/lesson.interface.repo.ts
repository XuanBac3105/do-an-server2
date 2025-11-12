import { Exercise, Lecture, Lesson, LessonType, Quiz } from '@prisma/client'

export interface ILessonRepo {
    create(data: {
        classroomId: number
        lessonType: LessonType
        lectureId?: number
        exerciseId?: number
        quizId?: number
        orderIndex?: number
        exerciseDueAt?: Date | null
        quizStartAt?: Date | null
        quizEndAt?: Date | null
    }): Promise<Lesson>

    findTypeLessonById(
        lessonType: LessonType,
        id: number
    ): Promise<Lecture | Exercise | Quiz | null>

    findByClassroomId(classroomId: number): Promise<any[]>
}
