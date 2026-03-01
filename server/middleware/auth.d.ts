import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    team?: {
        teamId: string;
        role: string;
    };
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
