import { InterviewQuestion } from './types';
import {
  companies,
  interviewQuestions,
  getCompanyNames,
  getQuestionsForCompany,
  getQuestionsForCompanyAndCategory,
  getCategoriesForCompany,
  getCompanyEntry,
  CompanyEntry,
  enrichQuestion
} from './interview-data';

export type { CompanyEntry, InterviewQuestion };
export {
  companies,
  interviewQuestions,
  getCompanyNames,
  getQuestionsForCompany,
  getQuestionsForCompanyAndCategory,
  getCategoriesForCompany,
  getCompanyEntry,
  enrichQuestion
};
