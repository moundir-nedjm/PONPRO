import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Stack,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress
} from '@mui/material';
import {
  Face as FaceIcon,
  PhotoCamera as CameraIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Replay as RetryIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// Face capture poses configuration
const FACE_POSES = [
  { id: 'front', label: 'Face avant', instruction: 'Regardez droit vers la caméra' },
  { id: 'left', label: 'Côté gauche', instruction: 'Tournez légèrement la tête vers la gauche' },
  { id: 'right', label: 'Côté droit', instruction: 'Tournez légèrement la tête vers la droite' },
  { id: 'up', label: 'Vers le haut', instruction: 'Levez légèrement le menton' },
  { id: 'down', label: 'Vers le bas', instruction: 'Baissez légèrement le menton' }
];

/**
 * Face scanning component with webcam integration
 * Provides a guided user interface for capturing face biometric data from multiple angles
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the camera dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onComplete - Function to call when face capture is complete
 * @param {Object} props.employee - The employee whose face is being scanned
 */
const FaceScanCamera = ({ open, onClose, onComplete, employee }) => {
  const theme = useTheme();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [captureStatus, setCaptureStatus] = useState('waiting'); // waiting, capturing, success, error
  const [countdown, setCountdown] = useState(null);
  const [quality, setQuality] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Multi-pose capture states
  const [activeStep, setActiveStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setCapturedImages({});
      setOverallProgress(0);
      setCaptureStatus('waiting');
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open]);
  
  // Start camera
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          // Start simple face detection simulation
          simulateFaceDetection();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setErrorMessage('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.');
      setCaptureStatus('error');
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCaptureStatus('waiting');
    setFaceDetected(false);
    setCountdown(null);
  };
  
  // Simulate face detection (in a real app, use a proper face detection library)
  const simulateFaceDetection = () => {
    // Simulate detection after a short delay
    setTimeout(() => {
      setFaceDetected(true);
      // Quality varies slightly by pose to simulate real conditions
      const poseQualityVariation = {
        'front': 0.90,
        'left': 0.85,
        'right': 0.88,
        'up': 0.82,
        'down': 0.84
      };
      
      const currentPose = FACE_POSES[activeStep].id;
      setQuality(poseQualityVariation[currentPose] || 0.85);
    }, 1500);
  };
  
  // Start the capture process for current pose
  const startCapture = () => {
    if (!faceDetected) {
      setErrorMessage('Aucun visage détecté. Veuillez vous placer face à la caméra.');
      return;
    }
    
    setCaptureStatus('capturing');
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        captureFrame();
      }
    }, 1000);
  };
  
  // Capture a frame from the video
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame on canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get the image data
    const imageData = canvas.toDataURL('image/jpeg');
    
    // Save the captured image for current pose
    const currentPose = FACE_POSES[activeStep].id;
    setCapturedImages(prev => ({
      ...prev,
      [currentPose]: {
        image: imageData,
        quality: quality
      }
    }));
    
    setCaptureStatus('success');
    
    // Update overall progress
    const newProgress = ((activeStep + 1) / FACE_POSES.length) * 100;
    setOverallProgress(newProgress);
  };
  
  // Move to the next pose
  const handleNextPose = () => {
    if (activeStep < FACE_POSES.length - 1) {
      setActiveStep(prev => prev + 1);
      setCaptureStatus('waiting');
      setFaceDetected(false);
      simulateFaceDetection();
    } else {
      // All poses completed
      handleCompleteAllPoses();
    }
  };
  
  // Move to the previous pose
  const handlePreviousPose = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      setCaptureStatus('waiting');
      setFaceDetected(false);
      simulateFaceDetection();
    }
  };
  
  // Retry the current pose
  const handleRetryCurrentPose = () => {
    // Remove this pose from captured images
    const currentPose = FACE_POSES[activeStep].id;
    setCapturedImages(prev => {
      const newCaptured = { ...prev };
      delete newCaptured[currentPose];
      return newCaptured;
    });
    
    setCaptureStatus('waiting');
    setFaceDetected(false);
    simulateFaceDetection();
    
    // Update progress
    const newProgress = (activeStep / FACE_POSES.length) * 100;
    setOverallProgress(newProgress);
  };
  
  // Complete the multi-pose capture process
  const handleCompleteAllPoses = () => {
    if (onComplete) {
      // Calculate the average quality
      const qualities = Object.values(capturedImages).map(item => item.quality);
      const avgQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
      
      onComplete({
        success: true,
        multiPoseImages: capturedImages,
        quality: avgQuality
      });
    }
    handleClose();
  };
  
  // Close the dialog
  const handleClose = () => {
    stopCamera();
    onClose();
  };
  
  const currentPose = FACE_POSES[activeStep];
  const isPoseCompleted = capturedImages[currentPose?.id];
  const isAllPosesCompleted = activeStep === FACE_POSES.length - 1 && isPoseCompleted;
  const poseHasBeenCaptured = !!capturedImages[currentPose?.id];
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: theme.palette.primary.main,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FaceIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Reconnaissance Faciale Multipose
            {employee && ` - ${employee.firstName} ${employee.lastName}`}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} color="inherit" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <Box sx={{ display: 'flex', height: '550px' }}>
          {/* Left side: Stepper showing progress */}
          <Box sx={{ width: '30%', p: 2, borderRight: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" gutterBottom>
              Étapes de Capture
            </Typography>
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {FACE_POSES.map((pose, index) => {
                const isCompleted = !!capturedImages[pose.id];
                
                return (
                  <Step key={pose.id} completed={isCompleted}>
                    <StepLabel>
                      <Typography 
                        variant="subtitle2"
                        sx={{ fontWeight: isCompleted ? 'bold' : 'normal' }}
                      >
                        {pose.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {pose.instruction}
                      </Typography>
                    </StepContent>
                  </Step>
                );
              })}
            </Stepper>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progression globale:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={overallProgress} 
                    color="success" 
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(overallProgress)}%
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Right side: Camera view */}
          <Box sx={{ 
            width: '70%',
            position: 'relative',
            bgcolor: 'black',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Video stream */}
            <Box sx={{ 
              flex: 1,
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <video 
                ref={videoRef} 
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: poseHasBeenCaptured ? 'none' : 'block'
                }}
                muted
              />
              
              {/* Hidden canvas for capturing frames */}
              <canvas 
                ref={canvasRef} 
                style={{ display: 'none' }}
              />
              
              {/* Show captured image for current pose if available */}
              {poseHasBeenCaptured && (
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img 
                    src={capturedImages[currentPose.id].image} 
                    alt="Captured" 
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                  <Box sx={{ 
                    position: 'absolute',
                    bottom: 20,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 1, 
                        bgcolor: alpha(theme.palette.success.main, 0.9),
                        color: 'white',
                        borderRadius: 2
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CheckIcon />
                        <Typography>
                          {currentPose.label} capturé ! Qualité: {(capturedImages[currentPose.id].quality * 100).toFixed(0)}%
                        </Typography>
                      </Stack>
                    </Paper>
                  </Box>
                </Box>
              )}
              
              {/* Face detection guide */}
              {cameraActive && !poseHasBeenCaptured && (
                <>
                  <Box sx={{ 
                    position: 'absolute',
                    width: 200,
                    height: 260,
                    border: `2px solid ${faceDetected ? theme.palette.success.main : theme.palette.primary.main}`,
                    borderRadius: '50% 50% 45% 45%',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -55%)',
                    boxShadow: faceDetected ? `0 0 20px ${alpha(theme.palette.success.main, 0.6)}` : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {faceDetected && (
                      <Typography
                        variant="body2"
                        sx={{
                          position: 'absolute',
                          bottom: -30,
                          left: 0,
                          right: 0,
                          textAlign: 'center',
                          color: 'white',
                          textShadow: '0 0 4px rgba(0,0,0,0.8)',
                          bgcolor: alpha(theme.palette.success.main, 0.8),
                          p: 0.5,
                          borderRadius: 1
                        }}
                      >
                        Visage détecté
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Current pose instruction */}
                  <Paper
                    elevation={3}
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.8),
                      color: 'white',
                      minWidth: 280,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      {currentPose.label}
                    </Typography>
                    <Typography variant="body2">
                      {currentPose.instruction}
                    </Typography>
                  </Paper>
                </>
              )}
              
              {/* Countdown display */}
              {countdown !== null && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.7),
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: 'white',
                  boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.8)}`
                }}>
                  {countdown}
                </Box>
              )}
              
              {/* Loading state */}
              {!cameraActive && captureStatus === 'waiting' && (
                <CircularProgress size={60} />
              )}
              
              {/* Error display */}
              {captureStatus === 'error' && (
                <Box sx={{ p: 3 }}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage || 'Une erreur est survenue lors de l\'initialisation de la caméra.'}
                  </Alert>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={startCamera}
                    startIcon={<CameraIcon />}
                  >
                    Réessayer
                  </Button>
                </Box>
              )}
            </Box>
            
            {/* Controls for camera */}
            <Box sx={{ p: 2, bgcolor: theme.palette.grey[900] }}>
              {poseHasBeenCaptured ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    onClick={handleRetryCurrentPose} 
                    startIcon={<RetryIcon />}
                    variant="outlined"
                    color="secondary"
                  >
                    Reprendre cette pose
                  </Button>
                  
                  <Box>
                    {activeStep > 0 && (
                      <Button 
                        onClick={handlePreviousPose}
                        startIcon={<BackIcon />}
                        sx={{ mr: 1 }}
                      >
                        Précédent
                      </Button>
                    )}
                    
                    <Button 
                      onClick={handleNextPose}
                      variant="contained" 
                      color={isAllPosesCompleted ? "success" : "primary"}
                      endIcon={isAllPosesCompleted ? <CheckIcon /> : <NextIcon />}
                    >
                      {isAllPosesCompleted ? 'Terminer' : 'Continuer'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    onClick={startCapture}
                    variant="contained" 
                    color="primary"
                    disabled={!faceDetected || captureStatus === 'capturing' || !cameraActive}
                    startIcon={<CameraIcon />}
                  >
                    {captureStatus === 'capturing' ? 'Capture en cours...' : 'Capturer cette pose'}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: theme.palette.grey[100] }}>
        <Button onClick={handleClose}>Annuler</Button>
        <Typography variant="body2" sx={{ flex: 1, color: theme.palette.text.secondary, textAlign: 'center' }}>
          {Object.keys(capturedImages).length} sur {FACE_POSES.length} poses capturées
        </Typography>
        <Button 
          onClick={handleCompleteAllPoses} 
          variant="contained" 
          color="success"
          disabled={Object.keys(capturedImages).length < FACE_POSES.length}
          startIcon={<CheckIcon />}
        >
          Finaliser le scan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FaceScanCamera; 