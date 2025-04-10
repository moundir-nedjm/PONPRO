import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Grid,
  IconButton,
  Alert
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import * as faceapi from 'face-api.js';
import apiClient from '../../utils/apiClient';

const MODELS_URL = '/models';

const FaceScanner = ({ 
  open, 
  onClose, 
  onSuccess, 
  mode = 'register', // 'register' or 'recognize'
  employeeId,
  employeeName
}) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [detectionResult, setDetectionResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [stream, setStream] = useState(null);

  // Load models and initialize camera
  useEffect(() => {
    if (open) {
      loadModels();
    }
    
    // Cleanup on component unmount or when dialog closes
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setCapturedImage(null);
      setDetectionResult(null);
      setErrorMessage('');
      setSuccessMessage('');
      setIsReady(false);
      setIsCapturing(false);
      setIsProcessing(false);
    };
  }, [open]);

  // Load face-api.js models
  const loadModels = async () => {
    setIsInitializing(true);
    setErrorMessage('');
    
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODELS_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_URL)
      ]);
      
      console.log('Face API models loaded successfully');
      startCamera();
    } catch (error) {
      console.error('Error loading face-api models:', error);
      setErrorMessage('Erreur lors du chargement des modèles de reconnaissance faciale.');
      setIsInitializing(false);
    }
  };

  // Start camera feed
  const startCamera = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });
      
      setStream(currentStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = currentStream;
        videoRef.current.onloadedmetadata = () => {
          setIsInitializing(false);
          setIsReady(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMessage('Erreur lors de l\'accès à la caméra. Veuillez vérifier les permissions.');
      setIsInitializing(false);
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (!isReady || !videoRef.current) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
    
    // Process the captured image
    processImage(canvas);
  };

  // Process captured image for face detection
  const processImage = async (canvas) => {
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      // Get face detections from the captured image
      const detections = await faceapi.detectAllFaces(canvas, 
        new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      if (detections.length === 0) {
        setErrorMessage('Aucun visage détecté. Veuillez réessayer.');
        setCapturedImage(null);
        setIsCapturing(false);
        setIsProcessing(false);
        return;
      }
      
      if (detections.length > 1) {
        setErrorMessage('Plusieurs visages détectés. Veuillez vous assurer qu\'il n\'y a qu\'un seul visage dans le cadre.');
        setCapturedImage(null);
        setIsCapturing(false);
        setIsProcessing(false);
        return;
      }
      
      // We have one face, proceed with registration or recognition
      const detection = detections[0];
      setDetectionResult(detection);
      
      // Convert descriptor to array for storage
      const descriptor = Array.from(detection.descriptor);
      
      if (mode === 'register') {
        // Register the face
        await registerFace(descriptor);
      } else {
        // Recognize the face
        await recognizeFace(descriptor);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setErrorMessage('Erreur lors du traitement de l\'image.');
      setIsCapturing(false);
      setIsProcessing(false);
    }
  };

  // Register a face for an employee
  const registerFace = async (descriptor) => {
    try {
      const response = await apiClient.post('/biometric/register-face', {
        employeeId,
        faceData: descriptor
      });
      
      if (response.data.success) {
        setSuccessMessage('Visage enregistré avec succès!');
        
        // Call onSuccess prop with the result
        setTimeout(() => {
          onSuccess && onSuccess({
            employeeId,
            faceData: descriptor,
            timestamp: new Date().toISOString()
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Échec de l\'enregistrement');
      }
    } catch (error) {
      console.error('Error registering face:', error);
      setErrorMessage(error.message || 'Erreur lors de l\'enregistrement du visage.');
    } finally {
      setIsCapturing(false);
      setIsProcessing(false);
    }
  };

  // Recognize a face
  const recognizeFace = async (descriptor) => {
    try {
      const response = await apiClient.post('/biometric/recognize-face', {
        faceData: descriptor
      });
      
      if (response.data.success && response.data.match) {
        setSuccessMessage(`Visage reconnu: ${response.data.employee.firstName} ${response.data.employee.lastName}`);
        
        // Call onSuccess prop with the result
        setTimeout(() => {
          onSuccess && onSuccess({
            employeeId: response.data.employee._id,
            name: `${response.data.employee.firstName} ${response.data.employee.lastName}`,
            timestamp: new Date().toISOString()
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Visage non reconnu');
      }
    } catch (error) {
      console.error('Error recognizing face:', error);
      setErrorMessage(error.message || 'Erreur lors de la reconnaissance faciale.');
    } finally {
      setIsCapturing(false);
      setIsProcessing(false);
    }
  };

  // Reset the component state to try again
  const handleRetry = () => {
    setCapturedImage(null);
    setDetectionResult(null);
    setErrorMessage('');
    setSuccessMessage('');
    setIsCapturing(false);
    setIsProcessing(false);
  };

  // Dialog title based on mode
  const dialogTitle = mode === 'register' 
    ? 'Enregistrement du visage' 
    : 'Reconnaissance faciale';

  return (
    <Dialog
      open={open}
      onClose={isProcessing ? null : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{dialogTitle}</Typography>
          {!isProcessing && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {isInitializing ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress />
            <Typography variant="body1" style={{ marginTop: 16 }}>
              Initialisation de la caméra...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {employeeName && mode === 'register' && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Enregistrement du visage pour: {employeeName}
                </Alert>
              </Grid>
            )}
            
            {errorMessage && (
              <Grid item xs={12}>
                <Alert severity="error">{errorMessage}</Alert>
              </Grid>
            )}
            
            {successMessage && (
              <Grid item xs={12}>
                <Alert 
                  severity="success"
                  icon={<CheckCircleIcon fontSize="inherit" />}
                >
                  {successMessage}
                </Alert>
              </Grid>
            )}
            
            <Grid item xs={12} className="face-scanner-container">
              <Box
                position="relative"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: 640,
                  maxHeight: 480,
                  margin: '0 auto',
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'black'
                }}
              >
                {!capturedImage ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: isReady ? 'block' : 'none'
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                      }}
                    />
                    
                    {!isReady && !errorMessage && (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        minHeight={300}
                      >
                        <CircularProgress />
                      </Box>
                    )}
                  </>
                ) : (
                  <img
                    src={capturedImage}
                    alt="Captured face"
                    style={{
                      width: '100%',
                      height: 'auto'
                    }}
                  />
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
              {!capturedImage && isReady && !errorMessage && (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isCapturing || isProcessing}
                  onClick={captureImage}
                  startIcon={<CameraAltIcon />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {isCapturing ? 'Capture...' : 'Capturer'}
                </Button>
              )}
              
              {capturedImage && (
                <Box mt={2}>
                  {isProcessing ? (
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <CircularProgress size={24} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {mode === 'register' ? 'Enregistrement...' : 'Reconnaissance...'}
                      </Typography>
                    </Box>
                  ) : (
                    errorMessage && (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleRetry}
                        sx={{ mt: 1 }}
                      >
                        Réessayer
                      </Button>
                    )
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose}
          disabled={isProcessing}
        >
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FaceScanner; 