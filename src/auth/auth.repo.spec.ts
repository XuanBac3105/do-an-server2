import { Test, TestingModule } from '@nestjs/testing'
import { AuthRepo } from './auth.repo'
import { PrismaService } from 'src/shared/services/prisma.service'

describe('AuthRepo', () => {
    let repo: AuthRepo
    let prismaService: PrismaService

    const mockPrismaService = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthRepo,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile()

        repo = module.get<AuthRepo>(AuthRepo)
        prismaService = module.get<PrismaService>(PrismaService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(repo).toBeDefined()
    })

    describe('createUser', () => {
        it('should create a user with all required fields', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
                phone: '0123456789',
            }

            const expectedUser = {
                id: 1,
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: {
                    fullName: userData.fullName,
                    email: userData.email,
                    passwordHash: userData.passwordHash,
                    role: userData.role,
                    phone: userData.phone,
                },
            })
            expect(result).toEqual(expectedUser)
        })

        it('should create a user without phone number', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
            }

            const expectedUser = {
                id: 1,
                ...userData,
                phone: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: {
                    fullName: userData.fullName,
                    email: userData.email,
                    passwordHash: userData.passwordHash,
                    role: userData.role,
                    phone: '',
                },
            })
            expect(result).toEqual(expectedUser)
        })

        it('should create a user with admin role', async () => {
            const userData = {
                fullName: 'Admin User',
                email: 'admin@example.com',
                passwordHash: 'hashed_password',
                role: 'admin' as const,
                phone: '0987654321',
            }

            const expectedUser = {
                id: 2,
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    role: 'admin',
                }),
            })
            expect(result).toEqual(expectedUser)
        })

        it('should call prisma.user.create exactly once', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
            }

            mockPrismaService.user.create.mockResolvedValue({
                id: 1,
                ...userData,
                phone: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            })

            await repo.createUser(userData)

            expect(prismaService.user.create).toHaveBeenCalledTimes(1)
        })

        it('should handle database errors when creating user', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
                phone: '0123456789',
            }

            const dbError = new Error('Database connection failed')
            mockPrismaService.user.create.mockRejectedValue(dbError)

            await expect(repo.createUser(userData)).rejects.toThrow(
                'Database connection failed'
            )
        })

        it('should handle duplicate email error', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'duplicate@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
                phone: '0123456789',
            }

            const duplicateError = new Error('Unique constraint failed')
            mockPrismaService.user.create.mockRejectedValue(duplicateError)

            await expect(repo.createUser(userData)).rejects.toThrow(
                'Unique constraint failed'
            )
        })

        it('should pass phone as undefined when not provided', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
            }

            const expectedUser = {
                id: 1,
                fullName: userData.fullName,
                email: userData.email,
                passwordHash: userData.passwordHash,
                role: userData.role,
                phone: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: {
                    fullName: userData.fullName,
                    email: userData.email,
                    passwordHash: userData.passwordHash,
                    role: userData.role,
                    phone: '',
                },
            })
            expect(result).toEqual(expectedUser)
        })

        it('should handle empty string values', async () => {
            const userData = {
                fullName: '',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
                phone: '0123456789',
            }

            const expectedUser = {
                id: 1,
                ...userData,
                phone: '0123456789',
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.fullName).toBe('')
        })

        it('should preserve exact email format', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'Test.User+tag@Example.COM',
                passwordHash: 'hashed_password',
                role: 'admin' as const,
                phone: '0123456789',
            }

            const expectedUser = {
                id: 1,
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.email).toBe('Test.User+tag@Example.COM')
        })

        it('should create user with very long password hash', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'a'.repeat(200),
                role: 'student' as const,
                phone: '0123456789',
            }

            const expectedUser = {
                id: 1,
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.passwordHash).toHaveLength(200)
        })

        it('should create user with international phone number', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
                phone: '+84123456789',
            }

            const expectedUser = {
                id: 1,
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.phone).toBe('+84123456789')
        })

        it('should create user with special characters in name', async () => {
            const userData = {
                fullName: "O'Connor-Smith Nguyễn Văn A",
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
                phone: '0123456789',
            }

            const expectedUser = {
                id: 1,
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.fullName).toBe("O'Connor-Smith Nguyễn Văn A")
        })

        it('should return user with correct timestamps', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
                phone: '0123456789',
            }

            const now = new Date()
            const expectedUser = {
                id: 1,
                ...userData,
                createdAt: now,
                updatedAt: now,
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.createdAt).toEqual(now)
            expect(result.updatedAt).toEqual(now)
        })

        it('should return user with auto-incremented id', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
                phone: '0123456789',
            }

            const expectedUser = {
                id: 999,
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.id).toBe(999)
            expect(typeof result.id).toBe('number')
        })

        it('should default to empty string when phone is undefined', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                role: 'student' as const,
            }

            const expectedUser = {
                id: 1,
                ...userData,
                phone: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: {
                    fullName: userData.fullName,
                    email: userData.email,
                    passwordHash: userData.passwordHash,
                    role: userData.role,
                    phone: '',
                },
            })
            expect(result.phone).toBe('')
        })
    })
})
