import { RequestHandler, Request, Response, NextFunction } from "express";
import * as core from "express-serve-static-core";
import JwtPayload from "@/jwt/JwtPayload";
import JwtVerifier from "@/jwt/JwtVerifier";

type JwtHandler<P extends core.Params = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = core.Query>
  = (req: Request<P, ResBody, ReqBody, ReqQuery> & { jwt: JwtPayload }, res: Response<ResBody>, next: NextFunction) => any;

/**
 * Offers a strongly typed way to apply a "proxy" middleware to the request pipeline to make accessing JWT payload easier.
 * 
 * The reason that this is not just a simple middleware is because it is highly type unsafe to do so, whereas proxying the request handler
 * (as this middleware does) offers a better way to typecheck.
 * @param verifier The JwtVerifier to use when verifying JWT tokens.
 * @param jwtHandler The handler to run when a valid JWT token is passed.
 */
export default function jwt<P extends core.Params = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = core.Query>(
  verifier: JwtVerifier,
  jwtHandler: JwtHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler {
  return (req, res, next) => {
    const token = req.headers.authorization;

    if (token === undefined) {
      throw new TypeError("No JWT token was specified in the Authorization header.");
    }

    const validationResult = verifier.isValid(token);

    if (!validationResult.success) {
      throw new Error("The JWT token is invalid.")
    }

    //@ts-expect-error
    req.jwt = validationResult.payload;

    //@ts-expect-error
    return jwtHandler(req, res, next);
  };
}