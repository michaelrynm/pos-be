import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

/**
 * Global service for generating UUIDs.
 * Inject this service wherever you need to generate unique identifiers.
 */
@Injectable()
export class UuidService {
  /**
   * Generate a new v4 UUID string.
   * @returns A randomly generated UUID.
   */
  generate(): string {
    return uuid();
  }
}
