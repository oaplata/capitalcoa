/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../services/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query, user } = request;
    const timestamp = new Date();

    // Solo auditar operaciones CRUD
    const auditableMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!auditableMethods.includes(method)) {
      return next.handle();
    }

    // Determinar la acción y entidad
    const action = this.getAction(method);
    const entityType = this.getEntityType(url);

    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              timestamp,
              user_id: user?.userId?.toString() || 'system',
              action,
              entity_type: entityType,
              entity_id: this.getEntityId(params, body, response),
              before_data: this.getBeforeData(method, body, params),
              after_data: this.getAfterData(method, response),
            },
          });
        } catch (error) {
          console.error('Error creating audit log:', error);
        }
      }),
    );
  }

  private getAction(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.CREATE;
    }
  }

  private getEntityType(url: string): string {
    if (url.includes('/users')) return 'User';
    if (url.includes('/assets')) return 'Asset';
    if (url.includes('/signals')) return 'Signal';
    if (url.includes('/trades')) return 'Trade';
    if (url.includes('/backtests')) return 'Backtest';
    return 'Unknown';
  }

  private getEntityId(params: any, body: any, response: any): string {
    if (params?.id) return params.id.toString();
    if (body?.id) return body.id.toString();
    if (response?.id) return response.id.toString();
    if (response?.data?.id) return response.data.id.toString();
    return 'unknown';
  }

  private getBeforeData(method: string, body: any, params: any): any {
    if (method === 'DELETE' && params?.id) {
      return { id: params.id };
    }
    return method === 'POST' ? null : body;
  }

  private getAfterData(method: string, response: any): any {
    if (method === 'DELETE') return null;
    return response?.data || response;
  }
}
