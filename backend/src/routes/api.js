import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend server is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Sample route for doubts / concept gaps
router.get('/doubts', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        studentName: 'Alice Johnson',
        subject: 'Physics',
        topic: 'Electromagnetic Induction',
        doubt: 'Why does Lenz law imply conservation of energy?',
        detectedGap: 'Underlying work-energy theorem in magnetic fields',
        status: 'In Review',
      },
      {
        id: 2,
        studentName: 'Bob Smith',
        subject: 'Mathematics',
        topic: 'Calculus - Limits',
        doubt: 'How does L\'Hopital\'s rule work for infinity minus infinity?',
        detectedGap: 'Indeterminate form algebraic transformations',
        status: 'Resolved',
      },
    ],
  });
});

router.post('/doubts', (req, res) => {
  const { studentName, subject, topic, doubt } = req.body;
  if (!doubt || !studentName) {
    return res.status(400).json({
      success: false,
      message: 'Student name and doubt are required.',
    });
  }

  const newDoubt = {
    id: Date.now(),
    studentName,
    subject: subject || 'General',
    topic: topic || 'General',
    doubt,
    detectedGap: 'AI analysis pending...',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  res.status(201).json({
    success: true,
    message: 'Doubt submitted successfully',
    data: newDoubt,
  });
});

export default router;

