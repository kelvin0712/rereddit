import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validRegister } from "../utils/validateRegister";
import { forgetPasswordEmail } from "../utils/forgetPasswordEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

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

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // This is the current user and it's ok ti show them their email
    if (user.id === req.session.userId) {
      return user.email;
    }
    // current user will not see anyone else email
    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Ctx() { redis, req }: MyContext,
    @Arg("newPassword") newPassword: string,
    @Arg("token") token: string
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "password length must be more than 2 characters.",
          },
        ],
      };
    }
    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);

    if (!userId) {
      return {
        errors: [{ field: "token", message: "token expired." }],
      };
    }

    const id = parseInt(userId);
    const user = await User.findOne(id);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists.",
          },
        ],
      };
    }

    await User.update({ id }, { password: await argon2.hash(newPassword) });

    // delete the token after users changed their password
    await redis.del(FORGET_PASSWORD_PREFIX + token);

    // login user after change password

    req.session.userId = user.id;

    return {
      user,
    };
  }

  // Send email to user who forget password
  @Mutation(() => Boolean)
  async forgetPassword(
    @Ctx() { redis }: MyContext,
    @Arg("email") email: string
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }

    // create a token by uuid
    const token = v4(); // 'fdsafsda-fdsafdsa-fdsafdsa'

    // set token to redis
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3 // 3 days
    );

    // send email to user
    await forgetPasswordEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
    );

    return true;
  }
  // Create query for current user
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // you are not logged in
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }
  // Create register function
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
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
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: hashedPassword,
          email: options.email,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // Validation

    // Find a user
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
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
    return new Promise((resolve) => {
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
