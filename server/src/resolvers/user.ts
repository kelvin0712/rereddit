import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validRegister } from "../utils/validateRegister";

//Create type for errors
@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

// Create type for response
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  // Create query for current user
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    // you are not logged in
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }
  // Create register function
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // Validation
    const errors = validRegister(options);

    if (errors) {
      return { errors };
    }

    // Hashing password
    const hashedPassword = await argon2.hash(options.password);

    let user;
    try {
      // Create user and save user to the database
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPassword,
          email: options.email,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");

      user = result[0];
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "Username has already been taken!",
            },
          ],
        };
      }
    }

    // store user id session
    // this will set a cookie on user
    // keep them logged in
    req.session.userId = user.id;

    return {
      user,
    };
  }

  // Create login function
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // Validation

    // Find a user
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "That username or email does not exist!",
          },
        ],
      };
    }
    // if there is a user verify the userpassword
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  // Logout function
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve, reject) => {
      return req.session.destroy((err) => {
        if (err) {
          console.log(err);
          return resolve(false);
        }

        res.clearCookie(COOKIE_NAME);
        return resolve(true);
      });
    });
  }
}
