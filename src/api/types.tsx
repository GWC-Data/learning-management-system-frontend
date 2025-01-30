import { ReactNode } from "react";

// src/api/types.ts (or you can define it in the same file)
export interface Course {
    courseImg: string | undefined;
    courseName: ReactNode;  
    courseDesc: ReactNode;
    courseLink: string | undefined;
    id: number;
    name: string;
    description: string;
    // Add any other fields your course object may have
  }
  