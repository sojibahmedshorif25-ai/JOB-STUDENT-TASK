import { Router } from 'express';
import { uploadFile } from '../controllers/upload.controller';
import { protect } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/', protect, upload.single('file'), uploadFile);

export default router;
