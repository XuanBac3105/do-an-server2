import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { Prisma, Quiz } from '@prisma/client'
import type { IQuizRepo } from '../repos/quiz.interface.repo'
import type { IQuizService } from './quiz.interface.service'
import { QuizResDto } from '../dtos/responses/quiz-res.dto'
import { CreateQuizReqType } from '../dtos/requests/create-quiz-req.dto'
import { ListQuizzesResType } from '../dtos/responses/list-quizzes-res.dto'
import { GetQuizzesQueryType } from '../dtos/queries/get-quizzes.dto'
import { buildListResponse, buildOrderBy, buildSearchFilter, calculatePagination } from 'src/shared/utils/query.util'
import { UpdateQuizReqType } from '../dtos/requests/update-quiz-req.dto'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { QuizDetailResType } from '../dtos/responses/quiz-detail-res.dto'

@Injectable()
export class QuizService implements IQuizService {
    constructor(
        @Inject('IQuizRepo')
        private readonly quizRepo: IQuizRepo,
    ) {}

    async create(data: CreateQuizReqType): Promise<QuizResDto> {
        return await this.quizRepo.create({
            title: data.title,
            description: data.description ?? null,
            timeLimitSec: data.timeLimitSec,
            maxAttempts: data.maxAttempts,
            shuffleQuestions: data.shuffleQuestions ?? true,
            shuffleOptions: data.shuffleOptions ?? true,
            gradingMethod: data.gradingMethod ?? 'first',
        })
    }

    async getAll(query: GetQuizzesQueryType): Promise<ListQuizzesResType> {
        const { page, limit, search, order, sortBy } = query

        const where: Prisma.QuizWhereInput = {
            deletedAt: null,
            ...buildSearchFilter(search, ['title']),
        }

        const orderBy = buildOrderBy(sortBy, order)

        const { skip, take } = calculatePagination(page, limit)

        const [total, data] = await Promise.all([
            this.quizRepo.count(where),
            this.quizRepo.findMany(where, orderBy, skip, take),
        ])

        return buildListResponse(page, limit, total, data)
    }

    async getById(id: number): Promise<QuizDetailResType> {
        const quiz = await this.quizRepo.findByIdWithDetails(id)
        if (!quiz || quiz.deletedAt !== null) {
            throw new UnprocessableEntityException('Không tìm thấy bài kiểm tra.')
        }
        return quiz
    }

    async update(id: number, data: UpdateQuizReqType): Promise<QuizResDto> {
        const existingQuiz = await this.quizRepo.findById(id)
        if (!existingQuiz || existingQuiz.deletedAt !== null) {
            throw new UnprocessableEntityException('Không tìm thấy bài kiểm tra.')
        }

        return await this.quizRepo.update(id, {
            title: data.title,
            description: data.description ?? existingQuiz.description,
            timeLimitSec: data.timeLimitSec,
            maxAttempts: data.maxAttempts ?? existingQuiz.maxAttempts,
            shuffleQuestions: data.shuffleQuestions ?? existingQuiz.shuffleQuestions,
            shuffleOptions: data.shuffleOptions ?? existingQuiz.shuffleOptions,
            gradingMethod: data.gradingMethod ?? existingQuiz.gradingMethod,
        })
    }

    async delete(id: number): Promise<ResponseMessage> {
        const existingQuiz = await this.quizRepo.findById(id)
        if (!existingQuiz || existingQuiz.deletedAt !== null) {
            throw new UnprocessableEntityException('Không tìm thấy bài kiểm tra.')
        }

        await this.quizRepo.update(id, { deletedAt: new Date() })
        return { message: 'Xóa bài kiểm tra thành công' }
    }
}