import { celebrate, Joi } from "celebrate";
import express, { Request, Response, NextFunction } from "express";
import validateEmailFormatInBody from "../middleware/validateEmailFormatInBody";
import validateAccessToken from "../middleware/validateAccessToken";

const userController = express.Router();

userController.post(
  "/user",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  validateEmailFormatInBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await req.ctx!.services.user.createUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      });
      return res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }
);

userController.get(
  "/email/verify/:emailVerificationToken",
  celebrate({
    params: Joi.object().keys({
      emailVerificationToken: Joi.string().required(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emailVerifiedSuccessfully =
        await req.ctx?.services.user.verifyUserEmail(
          req.params.emailVerificationToken
        );

      let redirectQueryParams = "";
      if (emailVerifiedSuccessfully) {
        redirectQueryParams = `?emailVerified=true`;
      }
      const redirectUrl = `${process.env.PUBLIC_URL}/login${redirectQueryParams}`;
      console.log(redirectUrl);

      return res.status(302).redirect(redirectUrl);
    } catch (e) {
      next(e);
    }
  }
);

userController.get(
  "/user",
  validateAccessToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await req.ctx.services.user.getUserByIdOrFail(req.userId!);
      return res.status(200).send({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
      });
    } catch (e) {
      next(e);
    }
  }
);

export default userController;
