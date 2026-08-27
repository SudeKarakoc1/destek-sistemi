export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Ticket {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: Status;
  category: string;
  priority: Priority;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  aiSolution?: string | null;
}

export interface CommentAuthor {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface Comment {
  id: number;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  ticketId: number;
  authorId: number;
  author: CommentAuthor;
}
