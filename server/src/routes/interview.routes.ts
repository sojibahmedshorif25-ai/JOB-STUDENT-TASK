import { Router } from 'express';
import {
  getQuestionCategories,
  getQuestions,
  getTopics,
  getMockQuestions,
  saveProgress,
  getMyProgress,
  getMyInterviews,
  getRecruiterInterviews,
  scheduleInterview,
  updateInterviewStatus,
  submitInterviewFeedback,
} from '../controllers/interview.controller';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { interviewScheduleSchema, interviewProgressSchema } from '../validators/interview.validators';

const router = Router();

router.get('/questions/categories', getQuestionCategories);
router.get('/questions/topics', getTopics);
router.get('/questions', getQuestions);
router.get('/mock', getMockQuestions);

router.get('/my', protect, getMyInterviews);
router.get('/recruiter', protect, authorize('RECRUITER', 'ADMIN'), getRecruiterInterviews);
router.get('/progress/my', protect, getMyProgress);
router.post('/progress', protect, validate(interviewProgressSchema), saveProgress);

router.post('/schedule', protect, authorize('RECRUITER', 'ADMIN'), validate(interviewScheduleSchema), scheduleInterview);
router.put('/:id/status', protect, authorize('RECRUITER', 'ADMIN'), updateInterviewStatus);
router.post('/:id/feedback', protect, authorize('RECRUITER', 'ADMIN'), submitInterviewFeedback);

export default router;
