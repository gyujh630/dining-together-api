import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

interface DecodedToken {
  userId: number;
  userType: number;
}

declare global {
  namespace Express {
    interface Request {
      decoded: DecodedToken;
    }
  }
}

// 무효화된 토큰 목록
const revokedTokens = new Set<string>();

// 토큰을 무효화하는 함수
export const revokeToken = (token: string) => {
  revokedTokens.add(token);
};

export const generateAuthToken = (user: DecodedToken): string => {
  const token = jwt.sign(
    user,
    process.env.JWT_SECRET as Secret,
    { expiresIn: '6h' } // 토큰 만료 시간
  );
  return token;
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded: DecodedToken = jwt.verify(
      req.headers.authorization as string,
      process.env.JWT_SECRET as Secret
    ) as DecodedToken;

    // 로그아웃된 경우
    if (revokedTokens.has(req.headers.authorization as string)) {
      return res.status(401).json({
        code: 401,
        message: '무효화된 토큰입니다.',
      });
    }

    req.decoded = decoded;
    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(419).json({
        code: 419,
        message: '토큰이 만료되었습니다.',
      });
    }
    return res.status(401).json({
      code: 401,
      message: '유효하지 않은 토큰입니다.',
    });
  }
};