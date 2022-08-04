import { prisma } from '../../index.js';

export const hello = {
  Query: {
    hello: async (_: any, { id }: { id: string }) => {
      const data = await prisma.hello.findUnique({ where: { id } });

      console.log(data);

      return {
        id,
        content: data!.content
      };
    }
  },
  Mutation: {
    addHello: async () => {
      await prisma.hello.create({ data: { content: 'hello' } });

      return true;
    }
  }
};
