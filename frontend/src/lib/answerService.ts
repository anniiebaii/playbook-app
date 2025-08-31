import { supabase } from './supabase'
import type { User, Answer, AnswerWithRelations, AnswerData, QuestionStatus} from './supabase'


export class AnswerService {

    private static readonly ANSWER_WITH_RELATIONS_QUERY = `
        *,
        author:users!questions_authorId_fkey(*),
        assignedTo:users!questions_assignedToId_fkey(*),
        answers(
        *,
        author:users!answers_authorId_fkey(*)
    ),
        upvotes:question_upvotes!question_upvotes_questionId_fkey(*),
        bookmarks:question_bookmarks!question_bookmarks_questionId_fkey(*)
    `

  static async getAnswerWithRelations(answerId: number): Promise<AnswerWithRelations | null> {
    try {
      // Main question query with relations
      const { data: answer, error: answerError } = await supabase
        .from('answers')
        .select(`
          *,
          author:users!answers_authorId_fkey(*),
          question:questions!answers_questionId_fkey(*)
        `)
        .eq('id', answerId)
        .single()

      if (answerError) {
        console.error('Error fetching answer:', answerError)
        return null
      }

      if (!answer) return null

      // Transform the data to match QuestionWithRelations interface
      const answerWithRelations: AnswerWithRelations = {
        ...answer,
        author: answer.author,
        createdAt: new Date(answer.createdAt),
        updatedAt: new Date(answer.updatedAt)
      }

      console.log('Fetched answer with relations:', answerWithRelations)

      return answerWithRelations

    } catch (error) {
      console.error('Error in getAnswerWithRelations:', error)
      return null
    }
  }

  /**
   * Get multiple questions with relations and computed fields
   */
  static async getAnswersWithRelations(options?: {
    limit?: number,
     offset?: number,
    authorId?: number
    questionId?: number
  }): Promise<AnswerWithRelations[]> {
    try {
      let query = supabase
        .from('answers')
        .select(`
          *,
          author:users!answers_authorId_fkey(*),
          question:questions!answers_questionId_fkey(*)
        `)
        .order('createdAt', { ascending: false })

      // Apply filters
      if (options?.authorId) {
        query = query.eq('authorId', options.authorId)
      }
      if (options?.questionId) {
        query = query.eq('questionId', options.questionId)
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

    // Execute the actual query

      const { data: answers, error } = await query

      if (error) {
        console.error('Error fetching answers:', error)
        return []
      }

      // Transform each question to include computed fields
      const answerWithRelations: AnswerWithRelations[] = (answers || []).map(answer => (
        {
        ...answer,
        author: answer.author,
        

        createdAt: new Date(answer.createdAt),
        updatedAt: new Date(answer.updatedAt),
      }))

      console.log('Fetched answers with relations:', answerWithRelations)
      return answerWithRelations

    } catch (error) {
      console.error('Error in getAnswersWithRelations:', error)
      return []
    }
  }

    static async createAnswer(answerData: AnswerData): Promise<Answer> {
        console.log('Creating question with data:', answerData);
        const { data, error } = await supabase
            .from('answers')
            .insert([{
            type: answerData.type,
            content: answerData.content || '',
            questionId: answerData.questionId,
            authorId: answerData.authorId, // TODO: replace with current user ID
            }])
            .select(`
            *,
            author:users!answers_authorId_fkey(id, email, name, isAdmin)
            `)
            .single()

        if (error) throw error
        return data as Answer
    }

//   /**
//    * Get answer by ID
//    */
//   async getAnswerById(id: number): Promise<AnswerWithRelations | null> {
//     return await this.prisma.answer.findUnique({
//       where: { id },
//       include: {
//         author: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             isAdmin: true,
//             avatar: true,
//             title: true,
//             rating: true,
//           },
//         },
//         question: {
//           select: {
//             id: true,
//             text: true,
//             authorId: true,
//           },
//         },
//       },
//     });
//   }

//   /**
//    * Get answers with filters
//    */
//   async getAnswers(filters: GetAnswersFilters = {}): Promise<{
//     answers: AnswerWithRelations[];
//     total: number;
//   }> {
//     const { questionId, authorId, type, limit = 50, offset = 0 } = filters;

//     const where = {
//       ...(questionId && { questionId }),
//       ...(authorId && { authorId }),
//       ...(type && { type }),
//     };

//     const [answers, total] = await Promise.all([
//       this.prisma.answer.findMany({
//         where,
//         include: {
//           author: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               isAdmin: true,
//               avatar: true,
//               title: true,
//               rating: true,
//             },
//           },
//           question: {
//             select: {
//               id: true,
//               text: true,
//               authorId: true,
//             },
//           },
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//         take: limit,
//         skip: offset,
//       }),
//       this.prisma.answer.count({ where }),
//     ]);

//     return { answers, total };
//   }

//   /**
//    * Get answers for a specific question
//    */
//   async getAnswersByQuestionId(questionId: number): Promise<AnswerWithRelations[]> {
//     return await this.prisma.answer.findMany({
//       where: { questionId },
//       include: {
//         author: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             isAdmin: true,
//             avatar: true,
//             title: true,
//             rating: true,
//           },
//         },
//         question: {
//           select: {
//             id: true,
//             text: true,
//             authorId: true,
//           },
//         },
//       },
//       orderBy: [
//         { author: { isAdmin: 'desc' } }, // Admin answers first
//         { createdAt: 'asc' }, // Then by creation time
//       ],
//     });
//   }

//   /**
//    * Get answers by a specific author
//    */
//   async getAnswersByAuthorId(
//     authorId: number,
//     limit: number = 20,
//     offset: number = 0
//   ): Promise<{
//     answers: AnswerWithRelations[];
//     total: number;
//   }> {
//     const [answers, total] = await Promise.all([
//       this.prisma.answer.findMany({
//         where: { authorId },
//         include: {
//           author: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               isAdmin: true,
//               avatar: true,
//               title: true,
//               rating: true,
//             },
//           },
//           question: {
//             select: {
//               id: true,
//               text: true,
//               authorId: true,
//             },
//           },
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//         take: limit,
//         skip: offset,
//       }),
//       this.prisma.answer.count({ where: { authorId } }),
//     ]);

//     return { answers, total };
//   }

//   /**
//    * Update an answer
//    */
//   async updateAnswer(
//     id: number,
//     input: UpdateAnswerInput,
//     userId: number
//   ): Promise<AnswerWithRelations> {
//     const { type, content } = input;

//     return await this.prisma.$transaction(async (tx) => {
//       // Get the existing answer
//       const existingAnswer = await tx.answer.findUnique({
//         where: { id },
//         include: {
//           author: true,
//         },
//       });

//       if (!existingAnswer) {
//         throw new Error('Answer not found');
//       }

//       // Check if user has permission to update (author or admin)
//       const currentUser = await tx.user.findUnique({
//         where: { id: userId },
//       });

//       if (!currentUser) {
//         throw new Error('User not found');
//       }

//       if (existingAnswer.authorId !== userId && !currentUser.isAdmin) {
//         throw new Error('Unauthorized to update this answer');
//       }

//       // Update the answer
//       const updatedAnswer = await tx.answer.update({
//         where: { id },
//         data: {
//           ...(type && { type }),
//           ...(content && { content }),
//         },
//         include: {
//           author: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               isAdmin: true,
//               avatar: true,
//               title: true,
//               rating: true,
//             },
//           },
//           question: {
//             select: {
//               id: true,
//               text: true,
//               authorId: true,
//             },
//           },
//         },
//       });

//       return updatedAnswer;
//     });
//   }

//   /**
//    * Delete an answer
//    */
//   async deleteAnswer(id: number, userId: number): Promise<void> {
//     await this.prisma.$transaction(async (tx) => {
//       // Get the existing answer
//       const existingAnswer = await tx.answer.findUnique({
//         where: { id },
//         include: {
//           question: true,
//         },
//       });

//       if (!existingAnswer) {
//         throw new Error('Answer not found');
//       }

//       // Check if user has permission to delete (author or admin)
//       const currentUser = await tx.user.findUnique({
//         where: { id: userId },
//       });

//       if (!currentUser) {
//         throw new Error('User not found');
//       }

//       if (existingAnswer.authorId !== userId && !currentUser.isAdmin) {
//         throw new Error('Unauthorized to delete this answer');
//       }

//       // Delete the answer
//       await tx.answer.delete({
//         where: { id },
//       });

//       // Check if question still has answers
//       const remainingAnswers = await tx.answer.count({
//         where: { questionId: existingAnswer.questionId },
//       });

//       // If no answers remain, set question status back to PENDING
//       if (remainingAnswers === 0) {
//         await tx.question.update({
//           where: { id: existingAnswer.questionId },
//           data: { status: QuestionStatus.PENDING },
//         });
//       }

//       // Deduct points from the answer author
//       const pointsToDeduct = currentUser.isAdmin ? 50 : 25;
//       await tx.user.update({
//         where: { id: existingAnswer.authorId },
//         data: {
//           points: {
//             decrement: pointsToDeduct,
//           },
//         },
//       });
//     });
//   }

//   /**
//    * Get answer statistics for a user
//    */
//   async getAnswerStats(authorId: number): Promise<{
//     totalAnswers: number;
//     answersByType: Record<AnswerType, number>;
//     recentAnswersCount: number;
//     averageAnswersPerDay: number;
//   }> {
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//     const [totalAnswers, answersByType, recentAnswers, oldestAnswer] = await Promise.all([
//       this.prisma.answer.count({
//         where: { authorId },
//       }),
//       this.prisma.answer.groupBy({
//         by: ['type'],
//         where: { authorId },
//         _count: { id: true },
//       }),
//       this.prisma.answer.count({
//         where: {
//           authorId,
//           createdAt: { gte: sevenDaysAgo },
//         },
//       }),
//       this.prisma.answer.findFirst({
//         where: { authorId },
//         orderBy: { createdAt: 'asc' },
//         select: { createdAt: true },
//       }),
//     ]);

//     // Calculate average answers per day
//     let averageAnswersPerDay = 0;
//     if (oldestAnswer && totalAnswers > 0) {
//       const daysSinceFirstAnswer = Math.max(
//         1,
//         (Date.now() - oldestAnswer.createdAt.getTime()) / (1000 * 60 * 60 * 24)
//       );
//       averageAnswersPerDay = Math.round((totalAnswers / daysSinceFirstAnswer) * 100) / 100;
//     }

//     // Format answers by type
//     const typeStats = answersByType.reduce(
//       (acc, item) => {
//         acc[item.type] = item._count.id;
//         return acc;
//       },
//       { TEXT: 0, VIDEO: 0, AUDIO: 0 } as Record<AnswerType, number>
//     );

//     return {
//       totalAnswers,
//       answersByType: typeStats,
//       recentAnswersCount: recentAnswers,
//       averageAnswersPerDay,
//     };
//   }

//   /**
//    * Get top contributors (users with most answers)
//    */
//   async getTopContributors(limit: number = 10): Promise<Array<{
//     user: {
//       id: number;
//       name: string;
//       email: string;
//       isAdmin: boolean;
//       avatar?: string;
//       title?: string;
//       rating?: number;
//     };
//     answerCount: number;
//     recentAnswerCount: number;
//   }>> {
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//     const topAnswerers = await this.prisma.answer.groupBy({
//       by: ['authorId'],
//       _count: { id: true },
//       orderBy: { _count: { id: 'desc' } },
//       take: limit,
//     });

//     const contributorsWithDetails = await Promise.all(
//       topAnswerers.map(async (answerer) => {
//         const [user, recentAnswerCount] = await Promise.all([
//           this.prisma.user.findUnique({
//             where: { id: answerer.authorId },
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               isAdmin: true,
//               avatar: true,
//               title: true,
//               rating: true,
//             },
//           }),
//           this.prisma.answer.count({
//             where: {
//               authorId: answerer.authorId,
//               createdAt: { gte: sevenDaysAgo },
//             },
//           }),
//         ]);

//         return {
//           user: user!,
//           answerCount: answerer._count.id,
//           recentAnswerCount,
//         };
//       })
//     );

//     return contributorsWithDetails;
//   }

//   /**
//    * Search answers by content
//    */
//   async searchAnswers(
//     query: string,
//     filters: { authorId?: number; type?: AnswerType } = {},
//     limit: number = 20,
//     offset: number = 0
//   ): Promise<{
//     answers: AnswerWithRelations[];
//     total: number;
//   }> {
//     const { authorId, type } = filters;

//     const where = {
//       content: {
//         contains: query,
//         mode: 'insensitive' as const,
//       },
//       ...(authorId && { authorId }),
//       ...(type && { type }),
//     };

//     const [answers, total] = await Promise.all([
//       this.prisma.answer.findMany({
//         where,
//         include: {
//           author: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               isAdmin: true,
//               avatar: true,
//               title: true,
//               rating: true,
//             },
//           },
//           question: {
//             select: {
//               id: true,
//               text: true,
//               authorId: true,
//             },
//           },
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//         take: limit,
//         skip: offset,
//       }),
//       this.prisma.answer.count({ where }),
//     ]);

//     return { answers, total };
//   }
}
