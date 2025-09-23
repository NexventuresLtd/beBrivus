import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoCall from "../components/video/VideoCall";

const VideoCallPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const handleCallEnd = () => {
    navigate("/mentor-dashboard");
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Invalid Session</h1>
          <p className="text-neutral-300 mb-6">No session ID provided</p>
          <button
            onClick={() => navigate("/mentor-dashboard")}
            className="bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <VideoCall
      sessionId={sessionId}
      isInitiator={true}
      onCallEnd={handleCallEnd}
      participantName="Mentee"
    />
  );
};

export default VideoCallPage;
