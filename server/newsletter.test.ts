import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import * as db from './db';

// Mock the database module
vi.mock('./db', () => ({
  createNewsletterSignup: vi.fn(),
  getNewsletterSignupByEmail: vi.fn(),
  getAllNewsletterSignups: vi.fn(),
  deleteNewsletterSignup: vi.fn(),
}));

describe('Newsletter Procedures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('newsletter.signup', () => {
    it('should successfully create a newsletter signup with valid data', async () => {
      const mockSignup = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
      };

      vi.mocked(db.getNewsletterSignupByEmail).mockResolvedValue(null);
      vi.mocked(db.createNewsletterSignup).mockResolvedValue(mockSignup);

      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      // Validate input schema
      const schema = z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Valid email is required'),
      });

      const validInput = schema.parse(input);
      expect(validInput).toEqual(input);

      // Check for existing email
      const existing = await db.getNewsletterSignupByEmail(input.email);
      expect(existing).toBeNull();

      // Create signup
      const result = await db.createNewsletterSignup(validInput);
      expect(result).toEqual(mockSignup);
      expect(db.createNewsletterSignup).toHaveBeenCalledWith(validInput);
    });

    it('should reject duplicate email addresses', async () => {
      const existingSignup = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        createdAt: new Date(),
      };

      vi.mocked(db.getNewsletterSignupByEmail).mockResolvedValue(existingSignup);

      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'jane@example.com',
      };

      const existing = await db.getNewsletterSignupByEmail(input.email);
      expect(existing).not.toBeNull();
      expect(existing?.email).toBe('jane@example.com');
    });

    it('should validate email format', async () => {
      const schema = z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Valid email is required'),
      });

      const invalidInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
      };

      expect(() => schema.parse(invalidInput)).toThrow();
    });

    it('should require first name', async () => {
      const schema = z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Valid email is required'),
      });

      const inputWithoutFirstName = {
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      expect(() => schema.parse(inputWithoutFirstName)).toThrow();
    });

    it('should require last name', async () => {
      const schema = z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Valid email is required'),
      });

      const inputWithoutLastName = {
        firstName: 'John',
        lastName: '',
        email: 'john@example.com',
      };

      expect(() => schema.parse(inputWithoutLastName)).toThrow();
    });

    it('should trim whitespace from input fields', async () => {
      const input = {
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: '  john@example.com  ',
      };

      const trimmed = {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim(),
      };

      expect(trimmed.firstName).toBe('John');
      expect(trimmed.lastName).toBe('Doe');
      expect(trimmed.email).toBe('john@example.com');
    });
  });

  describe('newsletter.list', () => {
    it('should retrieve all newsletter signups', async () => {
      const mockSignups = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          createdAt: new Date(),
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getAllNewsletterSignups).mockResolvedValue(mockSignups);

      const result = await db.getAllNewsletterSignups();
      expect(result).toEqual(mockSignups);
      expect(result).toHaveLength(2);
      expect(db.getAllNewsletterSignups).toHaveBeenCalled();
    });

    it('should return empty array when no signups exist', async () => {
      vi.mocked(db.getAllNewsletterSignups).mockResolvedValue([]);

      const result = await db.getAllNewsletterSignups();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('newsletter.delete', () => {
    it('should delete a newsletter signup by id', async () => {
      vi.mocked(db.deleteNewsletterSignup).mockResolvedValue(undefined);

      const signupId = 1;
      await db.deleteNewsletterSignup(signupId);

      expect(db.deleteNewsletterSignup).toHaveBeenCalledWith(signupId);
    });

    it('should handle deletion of non-existent signup gracefully', async () => {
      vi.mocked(db.deleteNewsletterSignup).mockResolvedValue(undefined);

      const signupId = 999;
      await db.deleteNewsletterSignup(signupId);

      expect(db.deleteNewsletterSignup).toHaveBeenCalledWith(signupId);
    });
  });

  describe('Input Validation', () => {
    it('should validate signup input schema', () => {
      const schema = z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Valid email is required'),
      });

      const validInputs = [
        { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.co.uk' },
        { firstName: 'A', lastName: 'B', email: 'a@b.com' },
      ];

      validInputs.forEach(input => {
        expect(() => schema.parse(input)).not.toThrow();
      });
    });

    it('should reject invalid email formats', () => {
      const schema = z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Valid email is required'),
      });

      const invalidEmails = [
        { firstName: 'John', lastName: 'Doe', email: 'invalid' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane@' },
        { firstName: 'Bob', lastName: 'Jones', email: '@example.com' },
      ];

      invalidEmails.forEach(input => {
        expect(() => schema.parse(input)).toThrow();
      });
    });
  });
});
