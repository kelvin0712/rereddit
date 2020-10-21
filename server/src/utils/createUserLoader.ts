import DataLoader from "dataloader";
import { User } from "../entities/User";

// userIds: [5, 4, 1]
// The function need to return an array match the order of the userIds
// return: [{id: 5}, {id: 4}, {id: 1}]
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]); // [ {id: 1, name: 'kelvin'}, ...]
    const userIdsToUser: Record<number, User> = {};
    users.forEach((user) => {
      userIdsToUser[user.id] = user;
    });
    const sortedUsers = userIds.map((userId) => userIdsToUser[userId]);
    return sortedUsers;
  });
