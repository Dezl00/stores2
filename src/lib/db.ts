import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const client = new PrismaClient()
  return client.$extends({
    query: {
      product: {
        async findMany({ args, query }) {
          args.where = { ...args.where, isArchived: false }
          return query(args)
        }
      },
      category: {
        async findMany({ args, query }) {
          args.where = { ...args.where, isArchived: false }
          return query(args)
        }
      }
    }
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const db = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
