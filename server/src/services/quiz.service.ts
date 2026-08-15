import { Course, Enrollment } from '../models';
import { AppError } from '../utils/AppError';

export interface GradedQuiz {
  score: number;
  correctCount: number;
  incorrectCount: number;
  total: number;
  percentage: number;
  passed: boolean;
  results: Array<{
    questionId?: string;
    correct: boolean;
    correctAnswer: string;
    explanation: string;
  }>;
}

export const gradeQuiz = async (
  courseId: string,
  moduleId: string,
  lessonId: string,
  answers: Record<string, string>,
): Promise<GradedQuiz> => {
  const course = await Course.findById(courseId);
  if (!course) throw new AppError('Course not found', 404);

  const module = course.modules?.find((m) => String(m._id) === String(moduleId));
  if (!module) throw new AppError('Module not found', 404);

  const lesson = module.lessons?.find((l) => String(l._id) === String(lessonId));
  if (!lesson || !lesson.quiz || !lesson.quiz.questions?.length) {
    throw new AppError('No quiz found for this lesson', 404);
  }

  const questions = lesson.quiz.questions;
  let correctCount = 0;
  const results: GradedQuiz['results'] = [];

  questions.forEach((question, index) => {
    const questionId = String(question._id);
    const userAnswer = answers[questionId];
    const isCorrect =
      userAnswer !== undefined && userAnswer === question.correctAnswer;
    if (isCorrect) correctCount += 1;
    results.push({
      questionId,
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
    });
  });

  const total = questions.length;
  const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const passed = percentage >= (lesson.quiz.passingScore || 70);

  return {
    score: correctCount,
    correctCount,
    incorrectCount: total - correctCount,
    total,
    percentage,
    passed,
    results,
  };
};

export const updateEnrollmentAfterQuiz = async (
  userId: string,
  courseId: string,
  moduleId: string,
  lessonId: string,
  grade: GradedQuiz,
) => {
  const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
  if (!enrollment) return null;

  const entry = {
    lessonId: lessonId as unknown as typeof enrollment.progress[0]['lessonId'],
    moduleId: moduleId as unknown as typeof enrollment.progress[0]['moduleId'],
    completed: true,
    completedAt: new Date(),
    quizScore: grade.percentage,
    quizPassed: grade.passed,
  };

  const existing = enrollment.progress.find(
    (p) => String(p.lessonId) === String(lessonId),
  );
  if (existing) {
    existing.completed = true;
    existing.completedAt = new Date();
    existing.quizScore = grade.percentage;
    existing.quizPassed = grade.passed;
  } else {
    enrollment.progress.push(entry as never);
  }

  await enrollment.save();
  return enrollment;
};
