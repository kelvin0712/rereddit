import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

// userIds: [5, 4, 1]
// The function need to return an array match the order of the userIds
// return: [{id: 5}, {id: 4}, {id: 1}]
export const createVoteStatusLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any); // [ {id: 1, name: 'kelvin'}, ...]
      const updootIdsToUpdoot: Record<string, Updoot> = {};
      updoots.forEach((updoot) => {
        updootIdsToUpdoot[`${updoot.postId}|${updoot.userId}`] = updoot;
      });
      return keys.map(
        (key) => updootIdsToUpdoot[`${key.postId}|${key.userId}`]
      );
    }
  );
