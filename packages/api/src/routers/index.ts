import { protectedProcedure, publicProcedure, router } from "../index";
import { logsRouter } from "./logs";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  logs: logsRouter,
});
export type AppRouter = typeof appRouter;
