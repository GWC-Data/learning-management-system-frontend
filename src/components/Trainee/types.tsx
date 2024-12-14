// types.ts
export interface Course {
    id: number;
    name: string;
    image: string;
    details: string;
    syllabus: string[];
  }
  
  export interface Category {
    name: string;
    image: string;
    courses: Course[];
  }
  