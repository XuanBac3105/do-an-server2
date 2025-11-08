import { Test, TestingModule } from '@nestjs/testing'
import { UserRepo } from '../repos/user.repo'
import { PrismaService } from 'src/shared/services/prisma.service'
import { Role } from '@prisma/client'
import { Prisma } from '@prisma/client'

describe('UserRepo', () => {
    let repo: UserRepo
    let prismaService: PrismaService

    const mockPrismaService = {
        user: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepo,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile()

        repo = module.get<UserRepo>(UserRepo)
        prismaService = module.get<PrismaService>(PrismaService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(repo).toBeDefined()
    })

    describe('count', () => {
        it('should count all users', async () => {
            mockPrismaService.user.count.mockResolvedValue(5)

            const result = await repo.count({})

            expect(prismaService.user.count).toHaveBeenCalledWith({ where: {} })
            expect(result).toBe(5)
        })

        it('should count users with filter', async () => {
            const where: Prisma.UserWhereInput = {
                isActive: true,
            }

            mockPrismaService.user.count.mockResolvedValue(3)

            const result = await repo.count(where)

            expect(prismaService.user.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(3)
        })

        it('should count users with role filter', async () => {
            const where: Prisma.UserWhereInput = {
                role: Role.student,
            }

            mockPrismaService.user.count.mockResolvedValue(10)

            const result = await repo.count(where)

            expect(prismaService.user.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(10)
        })

        it('should count users with search filter', async () => {
            const where: Prisma.UserWhereInput = {
                OR: [
                    { fullName: { contains: 'John', mode: 'insensitive' } },
                    { email: { contains: 'John', mode: 'insensitive' } },
                ],
            }

            mockPrismaService.user.count.mockResolvedValue(2)

            const result = await repo.count(where)

            expect(prismaService.user.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(2)
        })

        it('should count users with complex filter', async () => {
            const where: Prisma.UserWhereInput = {
                isActive: true,
                role: Role.admin,
                OR: [
                    { fullName: { contains: 'test', mode: 'insensitive' } },
                    { email: { contains: 'test', mode: 'insensitive' } },
                ],
            }

            mockPrismaService.user.count.mockResolvedValue(1)

            const result = await repo.count(where)

            expect(prismaService.user.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(1)
        })

        it('should return 0 when no users match', async () => {
            mockPrismaService.user.count.mockResolvedValue(0)

            const result = await repo.count({ email: 'nonexistent@example.com' })

            expect(result).toBe(0)
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.user.count.mockRejectedValue(error)

            await expect(repo.count({})).rejects.toThrow(error)
        })
    })

    describe('findMany', () => {
        const mockUsers = [
            {
                id: 1,
                email: 'user1@example.com',
                fullName: 'User One',
                phoneNumber: '0123456789',
                passwordHash: 'hashed_password',
                role: Role.student,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            },
            {
                id: 2,
                email: 'user2@example.com',
                fullName: 'User Two',
                phoneNumber: '0987654321',
                passwordHash: 'hashed_password',
                role: Role.admin,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
            },
        ]

        it('should find all users with default parameters', async () => {
            const where: Prisma.UserWhereInput = {}
            const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'asc' }
            const skip = 0
            const take = 10

            mockPrismaService.user.findMany.mockResolvedValue(mockUsers)

            const result = await repo.findMany(where, orderBy, skip, take)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip,
                take,
            })
            expect(result).toEqual(mockUsers)
            expect(result).toHaveLength(2)
        })

        it('should find users with filter', async () => {
            const where: Prisma.UserWhereInput = {
                isActive: true,
            }
            const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'asc' }

            mockPrismaService.user.findMany.mockResolvedValue(mockUsers)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockUsers)
        })

        it('should find users sorted by fullName ascending', async () => {
            const where: Prisma.UserWhereInput = {}
            const orderBy: Prisma.UserOrderByWithRelationInput = { fullName: 'asc' }

            mockPrismaService.user.findMany.mockResolvedValue(mockUsers)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockUsers)
        })

        it('should find users sorted by createdAt descending', async () => {
            const where: Prisma.UserWhereInput = {}
            const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' }

            const reversedUsers = [...mockUsers].reverse()
            mockPrismaService.user.findMany.mockResolvedValue(reversedUsers)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(reversedUsers)
        })

        it('should find users sorted by email', async () => {
            const where: Prisma.UserWhereInput = {}
            const orderBy: Prisma.UserOrderByWithRelationInput = { email: 'asc' }

            mockPrismaService.user.findMany.mockResolvedValue(mockUsers)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockUsers)
        })

        it('should find users sorted by phoneNumber', async () => {
            const where: Prisma.UserWhereInput = {}
            const orderBy: Prisma.UserOrderByWithRelationInput = { phoneNumber: 'asc' }

            mockPrismaService.user.findMany.mockResolvedValue(mockUsers)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockUsers)
        })

        it('should handle pagination with skip and take', async () => {
            const where: Prisma.UserWhereInput = {}
            const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'asc' }
            const skip = 10
            const take = 5

            mockPrismaService.user.findMany.mockResolvedValue([mockUsers[0]])

            const result = await repo.findMany(where, orderBy, skip, take)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 10,
                take: 5,
            })
            expect(result).toHaveLength(1)
        })

        it('should find users with role filter', async () => {
            const where: Prisma.UserWhereInput = {
                role: Role.student,
            }
            const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'asc' }

            const studentUsers = [mockUsers[0]]
            mockPrismaService.user.findMany.mockResolvedValue(studentUsers)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(studentUsers)
        })

        it('should find users with search filter', async () => {
            const where: Prisma.UserWhereInput = {
                OR: [
                    { fullName: { contains: 'User', mode: 'insensitive' } },
                    { email: { contains: 'User', mode: 'insensitive' } },
                ],
            }
            const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'asc' }

            mockPrismaService.user.findMany.mockResolvedValue(mockUsers)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockUsers)
        })

        it('should find users with complex filter', async () => {
            const where: Prisma.UserWhereInput = {
                isActive: true,
                role: Role.admin,
                OR: [
                    { fullName: { contains: 'Two', mode: 'insensitive' } },
                    { email: { contains: 'Two', mode: 'insensitive' } },
                ],
            }
            const orderBy: Prisma.UserOrderByWithRelationInput = { fullName: 'asc' }

            const filteredUsers = [mockUsers[1]]
            mockPrismaService.user.findMany.mockResolvedValue(filteredUsers)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(filteredUsers)
        })

        it('should return empty array when no users found', async () => {
            const where: Prisma.UserWhereInput = {
                email: 'nonexistent@example.com',
            }
            const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'asc' }

            mockPrismaService.user.findMany.mockResolvedValue([])

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(result).toEqual([])
            expect(result).toHaveLength(0)
        })

        it('should handle multiple sort fields', async () => {
            const where: Prisma.UserWhereInput = {}
            const orderBy: Prisma.UserOrderByWithRelationInput = { role: 'asc' }

            mockPrismaService.user.findMany.mockResolvedValue(mockUsers)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockUsers)
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.user.findMany.mockRejectedValue(error)

            await expect(repo.findMany({}, { createdAt: 'asc' }, 0, 10)).rejects.toThrow(error)
        })

        it('should handle edge case with zero take', async () => {
            const where: Prisma.UserWhereInput = {}
            const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'asc' }

            mockPrismaService.user.findMany.mockResolvedValue([])

            const result = await repo.findMany(where, orderBy, 0, 0)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 0,
            })
            expect(result).toEqual([])
        })

        it('should handle large skip value', async () => {
            const where: Prisma.UserWhereInput = {}
            const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'asc' }

            mockPrismaService.user.findMany.mockResolvedValue([])

            const result = await repo.findMany(where, orderBy, 1000, 10)

            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 1000,
                take: 10,
            })
            expect(result).toEqual([])
        })
    })
})
