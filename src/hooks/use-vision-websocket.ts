"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  getVisionSocket,
  disconnectVisionSocket,
} from "@/lib/vision-socket-client";
import { useLabAgentHealth } from "@/hooks/use-lab-agent-health";
import { useVisionDetectionStore } from "@/stores/vision-detection-store";
import {
  DetectionResult,
  ROIConfig,
  BatchStats,
  BatchSummary,
} from "@/types/vision-detection";

export type AgentSource = "local" | "cloud" | "unavailable";

export function useVisionWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const lastFrameTime = useRef(Date.now());
  const frameCount = useRef(0);
  const isStreamingRef = useRef(false);
  const lastSendTimeRef = useRef(0);
  const awaitingResponseRef = useRef(false);
  const pendingResultRef = useRef<DetectionResult | null>(null);
  const resultFlushTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Phase 7: agent availability is probed via HTTPS /health before any socket
  // is opened. The probe (mount + focus + 10s interval) lives in the shared
  // useLabAgentHealth hook. `null` means "initial probe in flight"; `false`
  // shows the install banner; `true` is the only state in which the socket is
  // actually opened.
  const labAgent = useLabAgentHealth();
  const agentAvailable = labAgent.available;
  const refreshHealth = labAgent.refresh;
  const [connectError, setConnectError] = useState<string | null>(null);

  const {
    isConnected,
    isStreaming,
    roi,
    currentBatchId,
    autoBatchEnabled,
    setConnected,
    setModelLoaded,
    setStreaming,
    setSessionId,
    setCurrentResult,
    setFps,
    incrementFrames,
    setCurrentBatch,
    setBatchStats,
    addBatchToHistory,
    setBatchHistory,
    setROI,
    reset,
  } = useVisionDetectionStore();

  const autoBatchEnabledRef = useRef(autoBatchEnabled);
  useEffect(() => {
    autoBatchEnabledRef.current = autoBatchEnabled;
  }, [autoBatchEnabled]);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Open the socket only after the probe has confirmed the agent is up. If
  // the agent goes down again, tear it back down so we stop sending frames
  // into a dead pipe.
  useEffect(() => {
    if (agentAvailable !== true) {
      if (socketRef.current) {
        disconnectVisionSocket();
        socketRef.current = null;
        setConnected(false);
        setStreaming(false);
      }
      return;
    }

    const socket = getVisionSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Lab Agent socket connected");
      setConnected(true);
      setConnectError(null);
    });

    socket.on("disconnect", () => {
      console.log("Lab Agent socket disconnected");
      setConnected(false);
      setStreaming(false);
    });

    socket.on("connect_error", (err: Error) => {
      console.error("Lab Agent connect_error:", err.message);
      setConnectError(err.message);
      // Likely the agent died mid-session; force a fresh /health probe so the
      // banner reappears immediately rather than waiting for the next 10s
      // interval tick.
      refreshHealth();
    });

    socket.on(
      "connection_status",
      (data: { connected: boolean; modelLoaded: boolean }) => {
        setModelLoaded(data.modelLoaded);
      },
    );

    socket.on(
      "stream_started",
      (data: { sessionId: string; roi?: ROIConfig }) => {
        setSessionId(data.sessionId);
        setStreaming(true);
        if (data.roi) {
          setROI(data.roi);
        }
      },
    );

    socket.on("stream_stopped", () => {
      setStreaming(false);
      setSessionId(null);
    });

    socket.on(
      "batch_started",
      (data: { batchId: string; batchNumber: number; roi: ROIConfig }) => {
        setCurrentBatch(data.batchId, data.batchNumber);
        setROI(data.roi);
        setBatchStats(null);
      },
    );

    socket.on("batch_ended", (batch: BatchSummary) => {
      addBatchToHistory(batch);
      setCurrentBatch(null, batch.batchNumber);
      setBatchStats(null);
    });

    socket.on("batch_stats_updated", (stats: BatchStats) => {
      setBatchStats(stats);
    });

    socket.on("batch_history", (data: { batches: BatchSummary[] }) => {
      setBatchHistory(data.batches);
    });

    socket.on("roi_updated", (data: { roi: ROIConfig }) => {
      setROI(data.roi);
    });

    socket.on("detection_result", (result: DetectionResult) => {
      awaitingResponseRef.current = false;

      // Throttle store updates to max 10/sec
      pendingResultRef.current = result;
      if (!resultFlushTimerRef.current) {
        resultFlushTimerRef.current = setTimeout(() => {
          resultFlushTimerRef.current = null;
          if (pendingResultRef.current) {
            setCurrentResult(pendingResultRef.current);
            pendingResultRef.current = null;
          }
        }, 100);
      }

      incrementFrames();

      frameCount.current++;
      const now = Date.now();
      const elapsed = now - lastFrameTime.current;
      if (elapsed >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / elapsed));
        frameCount.current = 0;
        lastFrameTime.current = now;
      }

      if (autoBatchEnabledRef.current && result.currentBatchId) {
        socket.emit("end_batch", {});
        socket.emit("start_batch", {});
      }
    });

    socket.on("error", (error: { code: string; message: string }) => {
      console.error("Lab Agent error event:", error);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("connection_status");
      socket.off("stream_started");
      socket.off("stream_stopped");
      socket.off("batch_started");
      socket.off("batch_ended");
      socket.off("batch_stats_updated");
      socket.off("batch_history");
      socket.off("roi_updated");
      socket.off("detection_result");
      socket.off("error");
      if (resultFlushTimerRef.current) {
        clearTimeout(resultFlushTimerRef.current);
        resultFlushTimerRef.current = null;
      }
    };
  }, [
    agentAvailable,
    refreshHealth,
    setConnected,
    setModelLoaded,
    setStreaming,
    setSessionId,
    setCurrentResult,
    setFps,
    incrementFrames,
    setCurrentBatch,
    setBatchStats,
    addBatchToHistory,
    setBatchHistory,
    setROI,
  ]);

  const startStream = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("start_stream", { roi });
  }, [roi]);

  const stopStream = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("stop_stream", {});
    reset();
  }, [reset]);

  const sendFrame = useCallback((frameData: ArrayBuffer) => {
    if (!isStreamingRef.current || !socketRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastSendTimeRef.current < 200 || awaitingResponseRef.current) {
      return;
    }

    lastSendTimeRef.current = now;
    awaitingResponseRef.current = true;
    socketRef.current.emit("frame", frameData);
  }, []);

  const startBatch = useCallback((customRoi?: ROIConfig) => {
    if (!socketRef.current) return;
    socketRef.current.emit("start_batch", { roi: customRoi });
  }, []);

  const endBatch = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("end_batch", {});
  }, []);

  const updateROI = useCallback((newRoi: ROIConfig) => {
    if (!socketRef.current) return;
    socketRef.current.emit("update_roi", { roi: newRoi });
  }, []);

  const getBatchHistory = useCallback((limit: number = 10) => {
    if (!socketRef.current) return;
    socketRef.current.emit("get_batch_history", { limit });
  }, []);

  const updateSettings = useCallback(
    (settings: { saveDetections?: boolean; confidenceThreshold?: number }) => {
      if (!socketRef.current) return;
      socketRef.current.emit("update_settings", settings);
    },
    [],
  );

  const disconnect = useCallback(() => {
    disconnectVisionSocket();
    socketRef.current = null;
    reset();
  }, [reset]);

  // Source state for the InferenceStatusPill. v1 has no cloud fallback so we
  // only ever return "local" or "unavailable".
  const source: AgentSource =
    agentAvailable === true ? "local" : "unavailable";

  return {
    isConnected,
    isStreaming,
    currentBatchId,
    agentAvailable,
    agentVersion: labAgent.version,
    connectError,
    source,
    startStream,
    stopStream,
    sendFrame,
    startBatch,
    endBatch,
    updateROI,
    getBatchHistory,
    updateSettings,
    disconnect,
  };
}
