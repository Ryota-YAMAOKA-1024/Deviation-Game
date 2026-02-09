import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import { createCompleteDrawingUsecase } from '../lib/usecases/completeDrawing.js';

const DRAWING_LIMIT_SECONDS = 90;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

const toCanvasPoint = (canvas, clientX, clientY) => {
  const rect = canvas.getBoundingClientRect();
  const xScale = canvas.width / rect.width;
  const yScale = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * xScale,
    y: (clientY - rect.top) * yScale
  };
};

export default function DrawingScreenPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const completeDrawingUsecase = useMemo(() => createCompleteDrawingUsecase(), []);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const [remainingSeconds, setRemainingSeconds] = useState(DRAWING_LIMIT_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#1f2937';
    context.lineWidth = 4;
  }, []);

  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const finishDrawing = useCallback(
    async ({ isTimeout }) => {
      if (!gameId || isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setErrorText('');

      const canvas = canvasRef.current;
      const sketchUrl = canvas ? canvas.toDataURL('image/png') : '';
      const result = await completeDrawingUsecase.execute({ gameId, sketchUrl });

      if (!result.ok && !isTimeout) {
        setErrorText(`${result.errorCode}: ${result.message}`);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      navigate(`/game/${gameId}/wait`, { replace: isTimeout });
    },
    [completeDrawingUsecase, gameId, navigate]
  );

  useEffect(() => {
    if (remainingSeconds !== 0) return;
    void finishDrawing({ isTimeout: true });
  }, [finishDrawing, remainingSeconds]);

  const startDraw = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = toCanvasPoint(canvas, event.clientX, event.clientY);
    isDrawingRef.current = true;
    lastPointRef.current = point;
  };

  const draw = (event) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const nextPoint = toCanvasPoint(canvas, event.clientX, event.clientY);
    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.lineTo(nextPoint.x, nextPoint.y);
    context.stroke();

    lastPointRef.current = nextPoint;
  };

  const stopDraw = () => {
    isDrawingRef.current = false;
  };

  const handleClear = () => {
    initializeCanvas();
    setErrorText('');
  };

  return (
    <PageShell title="DrawingScreen" description="描画画面">
      <div className="card drawing-header">
        <p className="card-title">制限時間</p>
        <p className="drawing-timer">{remainingSeconds} 秒</p>
      </div>

      <div className="card drawing-card">
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={stopDraw}
          onPointerLeave={stopDraw}
        />
      </div>

      <div className="card drawing-actions">
        <button type="button" className="secondary-button" onClick={handleClear} disabled={isSubmitting}>
          クリア
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            void finishDrawing({ isTimeout: false });
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? '送信中...' : '完成'}
        </button>
      </div>

      {errorText ? <p className="form-error">{errorText}</p> : null}
    </PageShell>
  );
}
